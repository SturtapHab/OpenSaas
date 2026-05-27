"""Landing page management (internal)."""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import CurrentUser
from modules.landings import service
from modules.landings.schemas import (
    LandingCreate,
    LandingPublic,
    LandingWithHTML,
    RegenerateSectionRequest,
)

router = APIRouter(prefix="/landings", tags=["landings"])


@router.get("", response_model=list[LandingPublic])
async def list_landings(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await service.list_landings(db, user)
    return [LandingPublic.model_validate(item) for item in items]


@router.post("", response_model=LandingWithHTML, status_code=status.HTTP_201_CREATED)
async def create_landing(
    payload: LandingCreate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    landing = await service.create_landing(db, user, payload)
    return LandingWithHTML.model_validate(landing)


@router.get("/{landing_id}", response_model=LandingWithHTML)
async def get_landing(
    landing_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from sqlalchemy import select
    from modules.landings.models import Landing
    from fastapi import HTTPException

    landing = await db.get(Landing, landing_id)
    if not landing or landing.user_id != user.id:
        raise HTTPException(status_code=404, detail="Landing not found")
    return LandingWithHTML.model_validate(landing)


@router.post("/{landing_id}/regenerate", response_model=LandingWithHTML)
async def regenerate_landing(
    landing_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from modules.landings.models import Landing
    from fastapi import HTTPException

    landing = await db.get(Landing, landing_id)
    if not landing or landing.user_id != user.id:
        raise HTTPException(status_code=404, detail="Landing not found")

    from modules.landings.schemas import LandingFormData
    form = LandingFormData(**landing.form_data)
    landing = await service.generate_with_ai(db, landing, form)
    return LandingWithHTML.model_validate(landing)


@router.post("/{landing_id}/regenerate-section", response_model=LandingWithHTML)
async def regenerate_section(
    landing_id: UUID,
    payload: RegenerateSectionRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    landing = await service.regenerate_section(db, user, landing_id, payload)
    return LandingWithHTML.model_validate(landing)


@router.post("/{landing_id}/publish", response_model=LandingWithHTML)
async def publish_landing(
    landing_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    landing = await service.publish_landing(db, user, landing_id)
    return LandingWithHTML.model_validate(landing)


@router.post("/{landing_id}/unpublish", response_model=LandingWithHTML)
async def unpublish_landing(
    landing_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    landing = await service.unpublish_landing(db, user, landing_id)
    return LandingWithHTML.model_validate(landing)


@router.delete("/{landing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_landing(
    landing_id: UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await service.delete_landing(db, user, landing_id)
    return None
