"""Billing endpoints (internal)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from dependencies import CurrentUser
from modules.billing import service as billing_service
from modules.billing.schemas import (
    CourseAccess,
    CourseInfo,
    PaymentPublic,
    PlanPublic,
    SubscribeRequest,
    SubscribeResponse,
    SubscriptionPublic,
)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans", response_model=list[PlanPublic])
async def list_plans(db: Annotated[AsyncSession, Depends(get_db)]):
    plans = await billing_service.list_plans(db)
    return [PlanPublic.model_validate(p) for p in plans]


@router.get("/subscription", response_model=SubscriptionPublic | None)
async def get_subscription(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    sub = await billing_service.get_user_subscription(db, user.id)
    if sub is None:
        return None
    return SubscriptionPublic.model_validate(sub)


@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe(
    payload: SubscribeRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    url, payment = await billing_service.create_payment_for_plan(
        db, user, payload.plan_id, payload.provider
    )
    return SubscribeResponse(payment_url=url, payment_id=payment.id)


@router.get("/payments", response_model=list[PaymentPublic])
async def list_payments(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    payments = await billing_service.list_user_payments(db, user)
    return [PaymentPublic.model_validate(p) for p in payments]


@router.post("/cancel", response_model=SubscriptionPublic)
async def cancel(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    sub = await billing_service.cancel_subscription(db, user)
    return SubscriptionPublic.model_validate(sub)


@router.get("/course/info", response_model=CourseInfo)
async def course_info():
    """Цена курса и включена ли продажа. Без авторизации — нужна лендингу."""
    return CourseInfo(enabled=settings.course_enabled, price=settings.course_price)


@router.get("/course", response_model=CourseAccess)
async def get_course(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Ссылку на уроки (ENV COURSE_TELEGRAM_URL) отдаём только оплатившим."""
    purchased = await billing_service.has_purchased_course(db, user.id)
    return CourseAccess(
        enabled=settings.course_enabled,
        price=settings.course_price,
        purchased=purchased,
        telegram_url=(settings.course_telegram_url or None) if purchased else None,
    )


@router.post("/course/buy", response_model=SubscribeResponse)
async def buy_course(
    user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]
):
    url, payment = await billing_service.create_payment_for_course(db, user)
    return SubscribeResponse(payment_url=url, payment_id=payment.id)
