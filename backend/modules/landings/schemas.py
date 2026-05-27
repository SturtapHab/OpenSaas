"""Pydantic schemas for the landings module."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LandingFormData(BaseModel):
    # Шаг 1 — О продукте
    sphere: Literal["saas", "course", "services", "product", "event", "other"]
    product_name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=10, max_length=500)
    target_audience: str = Field(min_length=5, max_length=200)

    # Шаг 2 — Детали
    price: str | None = Field(default=None, max_length=50)
    cta_text: str = Field(default="Попробовать", max_length=50)
    advantages: list[str] = Field(default_factory=list, max_length=3)

    # Шаг 3 — Стиль
    tone: Literal["professional", "friendly", "aggressive"]
    color_scheme: Literal["blue", "dark", "light", "green"]


class LandingCreate(BaseModel):
    form_data: LandingFormData


class RegenerateSectionRequest(BaseModel):
    section_key: str  # например "hero", "features", "pricing"
    instruction: str | None = None  # дополнительное пожелание пользователя


class LandingPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    status: str
    form_data: dict
    sections_json: dict | None
    created_at: datetime
    updated_at: datetime


class LandingWithHTML(LandingPublic):
    html_content: str | None
