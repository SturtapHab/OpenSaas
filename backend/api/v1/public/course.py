"""Курс: покупка без регистрации и выдача ссылки на уроки после оплаты."""
from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from modules.billing.robokassa import verify_success_signature
from modules.course import service as course_service
from modules.course.models import CourseOrderStatus

router = APIRouter(prefix="/course", tags=["course"])


class CourseInfo(BaseModel):
    enabled: bool
    price: Decimal
    currency: str = "RUB"


class BuyResponse(BaseModel):
    payment_url: str


class OrderStatus(BaseModel):
    # False — это не заказ курса (например, оплата подписки из кабинета).
    is_course: bool
    paid: bool = False
    inv_id: str | None = None
    telegram_url: str | None = None


@router.get("/info", response_model=CourseInfo)
async def course_info():
    """Цена (ENV COURSE_PRICE) и включена ли продажа (задан COURSE_TELEGRAM_URL)."""
    return CourseInfo(enabled=settings.course_enabled, price=settings.course_price)


@router.post("/buy", response_model=BuyResponse)
async def buy(db: Annotated[AsyncSession, Depends(get_db)]):
    """Без авторизации: создаём заказ и сразу отдаём ссылку на оплату."""
    url, _ = await course_service.create_order(db)
    return BuyResponse(payment_url=url)


@router.get("/order", response_model=OrderStatus)
async def order_status(
    db: Annotated[AsyncSession, Depends(get_db)],
    OutSum: str,
    InvId: str,
    SignatureValue: str,
):
    """Параметры, с которыми Робокасса вернула покупателя на Success URL.

    Подпись (пароль #1) знает только Робокасса, поэтому ссылку получает лишь тот,
    кто действительно прошёл оплату этого заказа.
    """
    if not verify_success_signature(OutSum, InvId, SignatureValue):
        raise HTTPException(status_code=400, detail="Invalid signature")

    order = await course_service.get_by_inv_id(db, InvId)
    if order is None:
        return OrderStatus(is_course=False)

    paid = order.status == CourseOrderStatus.PAID
    return OrderStatus(
        is_course=True,
        paid=paid,
        inv_id=order.inv_id,
        telegram_url=(settings.course_telegram_url or None) if paid else None,
    )
