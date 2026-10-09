"""Курс: покупка без регистрации и уроки на платформе.

1. Лендинг → `POST /course/buy {email}` → CourseOrder(pending, email) + ссылка на Робокассу.
2. Робокасса → Result URL (`/webhooks/robokassa`) → `mark_paid` + `grant_access`:
   есть пользователь с этим email — открываем ему курс, нет — создаём аккаунт.
   Письмо с доступом: новому — ссылка «Задать пароль» (COURSE_ACCESS_LINK_DAYS),
   старому — ссылка на вход.
3. Робокасса возвращает покупателя на Success URL → `/payment/success` → `GET /course/order`
   (подпись паролем #1) показывает, на какую почту ушло письмо.
4. Уроки — `CourseLesson`, видят только пользователи с `User.course_access_at`.
   Доступ бессрочный: снимается только вручную из админки.
"""
from __future__ import annotations

import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Sequence
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from modules.auth import service as auth_service
from modules.auth.models import PasswordResetToken, User, UserProfile
from modules.auth.utils import hash_password
from modules.billing import robokassa
from modules.billing.models import Subscription, SubscriptionStatus
from modules.course.models import CourseLesson, CourseOrder, CourseOrderStatus


def normalize_email(email: str) -> str:
    return email.strip().lower()


def mask_email(email: str | None) -> str | None:
    """sh***@gmail.com — для страницы «Оплата прошла»."""
    if not email or "@" not in email:
        return None
    name, domain = email.split("@", 1)
    return f"{name[:2]}***@{domain}"


# --- Заказы ---------------------------------------------------------------


async def create_order(db: AsyncSession, email: str) -> tuple[str, CourseOrder]:
    if not settings.course_enabled:
        raise HTTPException(status_code=404, detail="Продажа курса на этом сайте выключена")

    order = CourseOrder(
        inv_id=str(int(time.time() * 1000)),
        amount=settings.course_price,
        status=CourseOrderStatus.PENDING,
        email=normalize_email(email),
    )
    db.add(order)
    await db.flush()

    url = robokassa.build_payment_url(
        inv_id=order.inv_id,
        amount=order.amount,
        description=f"{settings.app_name} — курс",
        user_email=order.email,
    )
    await db.commit()
    return url, order


async def get_by_inv_id(db: AsyncSession, inv_id: str) -> CourseOrder | None:
    return await db.scalar(select(CourseOrder).where(CourseOrder.inv_id == inv_id))


def mark_paid(order: CourseOrder, email: str | None = None) -> bool:
    """True, если заказ оплачен только что (а не повторное уведомление Робокассы)."""
    if order.status == CourseOrderStatus.PAID:
        return False
    order.status = CourseOrderStatus.PAID
    order.paid_at = datetime.now(timezone.utc)
    # Старые заказы создавались без email: берём тот, что ввели в Робокассе.
    if not order.email and email:
        order.email = normalize_email(email)[:255]
    return True


async def list_orders(db: AsyncSession, limit: int = 100) -> Sequence[CourseOrder]:
    return (
        await db.scalars(
            select(CourseOrder)
            .where(CourseOrder.status == CourseOrderStatus.PAID)
            .order_by(CourseOrder.paid_at.desc())
            .limit(limit)
        )
    ).all()


# --- Доступ ---------------------------------------------------------------


async def _create_user(db: AsyncSession, email: str) -> User:
    """Аккаунт покупателя. Пароль случайный: человек задаст свой по ссылке из письма."""
    now = datetime.now(timezone.utc)
    user = User(
        email=email,
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        is_email_verified=True,
        trial_ends_at=now + timedelta(days=settings.trial_days),
    )
    db.add(user)
    await db.flush()
    db.add(UserProfile(user_id=user.id))
    db.add(
        Subscription(
            user_id=user.id,
            status=SubscriptionStatus.TRIAL,
            current_period_start=now,
            current_period_end=now + timedelta(days=settings.trial_days),
        )
    )
    return user


async def grant_access(
    db: AsyncSession, email: str, order: CourseOrder | None = None
) -> tuple[User, bool]:
    """Открыть курс пользователю с этим email (создать, если нет).

    Возвращает (user, created). Коммит — на вызывающем.
    """
    email = normalize_email(email)
    user = await db.scalar(select(User).where(auth_service.email_is(email)))
    created = user is None
    if user is None:
        user = await _create_user(db, email)
    if user.course_access_at is None:
        user.course_access_at = datetime.now(timezone.utc)
    if order is not None:
        order.user_id = user.id
    return user, created


async def set_user_access(db: AsyncSession, user_id: UUID, has_access: bool) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if has_access and user.course_access_at is None:
        user.course_access_at = datetime.now(timezone.utc)
    elif not has_access:
        user.course_access_at = None
    await db.commit()
    return user


async def access_email_token(db: AsyncSession, user: User, created: bool) -> str | None:
    """Токен для письма с доступом: новому аккаунту — ссылка «Задать пароль и войти».

    Само письмо отправляется в фоне: `email_service.send_course_access_email`.
    """
    if not created:
        return None
    return await auth_service.create_reset_token(
        db, user, ttl=timedelta(days=settings.course_access_link_days)
    )


async def resend_token(db: AsyncSession, order: CourseOrder) -> tuple[User, str | None]:
    """Повтор письма по оплаченному заказу: (кому, токен или None)."""
    user = await db.get(User, order.user_id) if order.user_id else None
    if order.status != CourseOrderStatus.PAID or user is None:
        raise HTTPException(status_code=409, detail="Заказ ещё не оплачен")
    # Пока человек ни разу не задал пароль по ссылке, снова шлём ссылку на пароль.
    used = await db.scalar(
        select(func.count(PasswordResetToken.id)).where(
            PasswordResetToken.user_id == user.id, PasswordResetToken.is_used.is_(True)
        )
    )
    return user, await access_email_token(db, user, created=not used)


# --- Уроки ----------------------------------------------------------------


async def list_lessons(db: AsyncSession) -> Sequence[CourseLesson]:
    return (
        await db.scalars(
            select(CourseLesson).order_by(CourseLesson.position, CourseLesson.created_at)
        )
    ).all()


async def get_lesson(db: AsyncSession, lesson_id: UUID) -> CourseLesson:
    lesson = await db.get(CourseLesson, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Урок не найден")
    return lesson


async def create_lesson(db: AsyncSession, **fields) -> CourseLesson:
    if fields.get("position") is None:
        last = await db.scalar(select(func.max(CourseLesson.position)))
        fields["position"] = (last or 0) + 1
    lesson = CourseLesson(**fields)
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson


async def update_lesson(db: AsyncSession, lesson_id: UUID, **fields) -> CourseLesson:
    lesson = await get_lesson(db, lesson_id)
    for k, v in fields.items():
        if v is not None:
            setattr(lesson, k, v)
    await db.commit()
    await db.refresh(lesson)
    return lesson


async def delete_lesson(db: AsyncSession, lesson_id: UUID) -> None:
    lesson = await get_lesson(db, lesson_id)
    await db.delete(lesson)
    await db.commit()
