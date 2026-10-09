"""Курс: заказы (покупка без регистрации) и уроки на платформе."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class CourseOrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"


class CourseOrder(Base):
    __tablename__ = "course_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # InvId в Робокассе. Один Result URL на магазин, поэтому webhook ищет
    # сначала Payment, затем CourseOrder.
    inv_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[CourseOrderStatus] = mapped_column(
        Enum(
            CourseOrderStatus,
            name="course_order_status",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=CourseOrderStatus.PENDING,
        nullable=False,
    )
    # Email покупателя: вводится на лендинге до оплаты, на него приходит доступ.
    # У старых заказов — email со страницы Робокассы (если она его прислала).
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Аккаунт, которому открыт доступ после оплаты.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CourseLesson(Base):
    """Урок курса. Видят только пользователи с доступом (User.course_access_at)."""

    __tablename__ = "course_lessons"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Ссылка на видео. Если она ведёт в S3 из настроек (S3_*), зрителю отдаётся
    # временная подписанная ссылка, а не эта.
    video_url: Mapped[str] = mapped_column(String(1000), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
