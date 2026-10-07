"""Покупка курса без регистрации.

1. Лендинг → `POST /course/buy` → CourseOrder(pending) + ссылка на Робокассу.
2. Робокасса → Result URL (`/webhooks/robokassa`) → `mark_paid`.
3. Робокасса возвращает покупателя на Success URL с OutSum/InvId/SignatureValue
   (подпись паролем #1) → `/payment/success` → `GET /course/order` проверяет подпись
   и, если заказ оплачен, отдаёт ссылку на уроки из ENV COURSE_TELEGRAM_URL.

Ссылку на уроки не хранить в коде: репозиторий открытый.
"""
from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from modules.billing import robokassa
from modules.course.models import CourseOrder, CourseOrderStatus


async def create_order(db: AsyncSession) -> tuple[str, CourseOrder]:
    if not settings.course_enabled:
        raise HTTPException(status_code=404, detail="Продажа курса на этом сайте выключена")

    order = CourseOrder(
        inv_id=str(int(time.time() * 1000)),
        amount=settings.course_price,
        status=CourseOrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    url = robokassa.build_payment_url(
        inv_id=order.inv_id,
        amount=order.amount,
        description=f"{settings.app_name} — курс",
    )
    await db.commit()
    return url, order


async def get_by_inv_id(db: AsyncSession, inv_id: str) -> CourseOrder | None:
    return await db.scalar(select(CourseOrder).where(CourseOrder.inv_id == inv_id))


def mark_paid(order: CourseOrder, email: str | None = None) -> None:
    if order.status == CourseOrderStatus.PAID:
        return
    order.status = CourseOrderStatus.PAID
    order.paid_at = datetime.now(timezone.utc)
    if email:
        order.email = email[:255]
