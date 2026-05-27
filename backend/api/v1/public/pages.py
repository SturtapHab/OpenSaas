"""Public landing pages (no auth required)."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.responses import HTMLResponse
from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from modules.landings import service

router = APIRouter(tags=["pages"])


@router.get("/pages/{slug}", response_class=HTMLResponse)
async def public_page(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    landing = await service.get_public_landing(db, slug)
    return HTMLResponse(content=landing.html_content)
