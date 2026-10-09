"""Admin endpoints (internal, role=admin required)."""
from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from dependencies import AdminUser, require_admin
from modules.admin import service as admin_service
from modules.course import service as course_service
from modules.auth.models import UserRole
from modules.auth.schemas import UserPublic
from modules.email import service as email_service
from modules.billing.schemas import PaymentPublic
from modules.referrals import service as ref_service
from modules.referrals.models import ReferralPayoutStatus
from modules.referrals.schemas import AdminReferralPayoutPublic

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


class RoleUpdate(BaseModel):
    role: UserRole


@router.post("/email/test")
async def send_test_email(admin: AdminUser):
    """Отправить проверочное письмо админу и вернуть ошибку SMTP, если она есть."""
    if not settings.email_enabled:
        raise HTTPException(
            status_code=400, detail="SMTP не настроен: задайте SMTP_USER и SMTP_PASSWORD"
        )
    try:
        await email_service.send_test_email(admin.email)
    except Exception as exc:  # noqa: BLE001 — показываем админу причину как есть
        raise HTTPException(
            status_code=502, detail=f"{type(exc).__name__}: {exc}"
        ) from exc
    return {"detail": f"Письмо отправлено на {admin.email}"}


@router.get("/stats")
async def stats(db: Annotated[AsyncSession, Depends(get_db)]):
    return await admin_service.stats(db)


@router.get("/users", response_model=list[UserPublic])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: str | None = None,
    status: str | None = Query(default=None),
):
    is_active = None
    if status == "blocked":
        is_active = False
    elif status == "active":
        is_active = True
    items = await admin_service.list_users(
        db, page=page, limit=limit, role=role, is_active=is_active
    )
    return [UserPublic.model_validate(u) for u in items]


@router.patch("/users/{user_id}/role", response_model=UserPublic)
async def set_role(
    user_id: UUID,
    payload: RoleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await admin_service.set_role(db, user_id, payload.role)
    return UserPublic.model_validate(user)


@router.patch("/users/{user_id}/block", response_model=UserPublic)
async def block_user(
    user_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    user = await admin_service.set_active(db, user_id, False)
    return UserPublic.model_validate(user)


@router.patch("/users/{user_id}/unblock", response_model=UserPublic)
async def unblock_user(
    user_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    user = await admin_service.set_active(db, user_id, True)
    return UserPublic.model_validate(user)


@router.get("/payments", response_model=list[PaymentPublic])
async def list_payments(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(100, ge=1, le=500),
):
    items = await admin_service.list_payments(db, limit=limit)
    return [PaymentPublic.model_validate(p) for p in items]


@router.get("/referrals/payouts", response_model=list[AdminReferralPayoutPublic])
async def list_referral_payouts(
    db: Annotated[AsyncSession, Depends(get_db)],
    status: ReferralPayoutStatus | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    items = await ref_service.admin_list_payouts(
        db, status_filter=status, limit=limit, offset=offset
    )
    return [AdminReferralPayoutPublic.model_validate(p) for p in items]


@router.patch(
    "/referrals/payouts/{payout_id}/approve",
    response_model=AdminReferralPayoutPublic,
)
async def approve_payout(
    payout_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    p = await ref_service.admin_set_payout_status(
        db, payout_id, ReferralPayoutStatus.APPROVED
    )
    return AdminReferralPayoutPublic.model_validate(p)


@router.patch(
    "/referrals/payouts/{payout_id}/mark-paid",
    response_model=AdminReferralPayoutPublic,
)
async def mark_paid(
    payout_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    p = await ref_service.admin_set_payout_status(
        db, payout_id, ReferralPayoutStatus.PAID
    )
    return AdminReferralPayoutPublic.model_validate(p)


@router.patch(
    "/referrals/payouts/{payout_id}/reject",
    response_model=AdminReferralPayoutPublic,
)
async def reject_payout(
    payout_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    p = await ref_service.admin_set_payout_status(
        db, payout_id, ReferralPayoutStatus.REJECTED
    )
    return AdminReferralPayoutPublic.model_validate(p)


# --- Курс -----------------------------------------------------------------


class LessonAdmin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    position: int
    title: str
    description: str
    video_url: str


class LessonCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    video_url: str = Field(default="", max_length=1000)
    position: int | None = None


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    video_url: str | None = Field(default=None, max_length=1000)
    position: int | None = None


class CourseAccessUpdate(BaseModel):
    has_course: bool


class CourseGrantRequest(BaseModel):
    email: EmailStr


class CourseGrantResponse(BaseModel):
    user: UserPublic
    created: bool


class CourseOrderAdmin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inv_id: str
    amount: str
    email: str | None
    user_id: UUID | None
    paid_at: datetime | None


@router.get("/course/lessons", response_model=list[LessonAdmin])
async def list_lessons(db: Annotated[AsyncSession, Depends(get_db)]):
    return [LessonAdmin.model_validate(x) for x in await course_service.list_lessons(db)]


@router.post("/course/lessons", response_model=LessonAdmin, status_code=201)
async def create_lesson(payload: LessonCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    lesson = await course_service.create_lesson(db, **payload.model_dump())
    return LessonAdmin.model_validate(lesson)


@router.patch("/course/lessons/{lesson_id}", response_model=LessonAdmin)
async def update_lesson(
    lesson_id: UUID, payload: LessonUpdate, db: Annotated[AsyncSession, Depends(get_db)]
):
    lesson = await course_service.update_lesson(db, lesson_id, **payload.model_dump())
    return LessonAdmin.model_validate(lesson)


@router.delete("/course/lessons/{lesson_id}", status_code=204)
async def delete_lesson(lesson_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    await course_service.delete_lesson(db, lesson_id)


@router.get("/course/orders", response_model=list[CourseOrderAdmin])
async def list_course_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(100, ge=1, le=500),
):
    return [
        CourseOrderAdmin(
            inv_id=o.inv_id,
            amount=str(o.amount),
            email=o.email,
            user_id=o.user_id,
            paid_at=o.paid_at,
        )
        for o in await course_service.list_orders(db, limit=limit)
    ]


@router.post("/course/grant", response_model=CourseGrantResponse)
async def grant_course(
    payload: CourseGrantRequest,
    bg: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Выдать курс по email: нет аккаунта — создаём, письмо с доступом — как после оплаты."""
    user, created = await course_service.grant_access(db, payload.email)
    token = await course_service.access_email_token(db, user, created)
    await db.commit()
    await db.refresh(user)
    bg.add_task(
        email_service.send_course_access_email,
        user.email,
        token,
        settings.course_access_link_days,
    )
    return CourseGrantResponse(user=UserPublic.model_validate(user), created=created)


@router.patch("/users/{user_id}/course", response_model=UserPublic)
async def set_user_course(
    user_id: UUID, payload: CourseAccessUpdate, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Открыть или забрать курс у пользователя (без письма)."""
    user = await course_service.set_user_access(db, user_id, payload.has_course)
    return UserPublic.model_validate(user)
