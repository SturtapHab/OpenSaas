"""CourseOrder — покупка курса без регистрации."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, Numeric, String, func
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
    # Email, который покупатель указал на странице Робокассы (если она его прислала).
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
