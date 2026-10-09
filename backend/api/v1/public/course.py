"""Курс: покупка без регистрации. После оплаты доступ открывается на платформе."""
from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from modules.billing.robokassa import verify_success_signature
from modules.course import service as course_service
from modules.course.models import CourseOrderStatus
from modules.email import service as email_service
from modules.rate_limit.service import check_rate_limit

router = APIRouter(prefix="/course", tags=["course"])


class CourseInfo(BaseModel):
    enabled: bool
    price: Decimal
    currency: str = "RUB"


class BuyRequest(BaseModel):
    email: EmailStr


class BuyResponse(BaseModel):
    payment_url: str


class RobokassaReturn(BaseModel):
    OutSum: str
    InvId: str
    SignatureValue: str


class OrderStatus(BaseModel):
    # False — это не заказ курса (например, оплата подписки из кабинета).
    is_course: bool
    paid: bool = False
    inv_id: str | None = None
    # Куда ушло письмо с доступом, частично скрыто: sh***@gmail.com.
    email: str | None = None


@router.get("/info", response_model=CourseInfo)
async def course_info():
    """Цена (ENV COURSE_PRICE) и включена ли продажа (ENV COURSE_ENABLED)."""
    return CourseInfo(enabled=settings.course_enabled, price=settings.course_price)


@router.post("/buy", response_model=BuyResponse)
async def buy(payload: BuyRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Без авторизации: заказ с email покупателя и ссылка на оплату."""
    url, _ = await course_service.create_order(db, payload.email)
    return BuyResponse(payment_url=url)


async def _verified_order(db: AsyncSession, ret: RobokassaReturn):
    """Заказ по параметрам Success URL. Подпись (пароль #1) знает только Робокасса."""
    if not verify_success_signature(ret.OutSum, ret.InvId, ret.SignatureValue):
        raise HTTPException(status_code=400, detail="Invalid signature")
    return await course_service.get_by_inv_id(db, ret.InvId)


@router.get("/order", response_model=OrderStatus)
async def order_status(
    db: Annotated[AsyncSession, Depends(get_db)],
    OutSum: str,
    InvId: str,
    SignatureValue: str,
):
    """Статус заказа для страницы «Оплата прошла»."""
    order = await _verified_order(
        db, RobokassaReturn(OutSum=OutSum, InvId=InvId, SignatureValue=SignatureValue)
    )
    if order is None:
        return OrderStatus(is_course=False)
    return OrderStatus(
        is_course=True,
        paid=order.status == CourseOrderStatus.PAID,
        inv_id=order.inv_id,
        email=course_service.mask_email(order.email),
    )


@router.post("/order/resend", response_model=OrderStatus)
async def resend_access(
    payload: RobokassaReturn,
    bg: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Отправить письмо с доступом ещё раз (не чаще 5 раз в час на заказ)."""
    order = await _verified_order(db, payload)
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    if not await check_rate_limit(db, f"course-resend:{order.inv_id}", 5):
        raise HTTPException(status_code=429, detail="Слишком часто. Попробуйте через час")
    user, token = await course_service.resend_token(db, order)
    bg.add_task(
        email_service.send_course_access_email, user.email, token, settings.course_access_link_days
    )
    return OrderStatus(
        is_course=True,
        paid=True,
        inv_id=order.inv_id,
        email=course_service.mask_email(user.email),
    )
