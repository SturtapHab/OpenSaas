"""Уроки курса для пользователей с доступом (JWT)."""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import CurrentUser
from modules.auth.models import User
from modules.course import service as course_service
from modules.course.storage import viewer_video_url

router = APIRouter(prefix="/course", tags=["course"])


class LessonPublic(BaseModel):
    id: UUID
    position: int
    title: str
    description: str
    # Для S3 — временная ссылка (S3_VIDEO_LINK_MINUTES), её нет смысла пересылать.
    video_url: str


async def require_course(user: CurrentUser) -> User:
    if not user.has_course and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Курс не куплен")
    return user


@router.get("/lessons", response_model=list[LessonPublic])
async def lessons(
    _: Annotated[User, Depends(require_course)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return [
        LessonPublic(
            id=lesson.id,
            position=lesson.position,
            title=lesson.title,
            description=lesson.description,
            video_url=viewer_video_url(lesson.video_url),
        )
        for lesson in await course_service.list_lessons(db)
    ]
