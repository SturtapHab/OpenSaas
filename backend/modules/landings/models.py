"""Landing page model."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class LandingStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class Landing(Base):
    __tablename__ = "landings"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Входные данные формы
    form_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Результат генерации
    sections_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    html_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Публикация
    slug: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )
    status: Mapped[LandingStatus] = mapped_column(
        Enum(
            LandingStatus,
            name="landing_status",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=LandingStatus.DRAFT,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
