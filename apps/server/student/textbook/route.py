from fastapi import APIRouter
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .services import textbook

textbook_router = APIRouter(prefix="/textbook")


@textbook_router.get(
    "/{textbook_id}/units",
    tags=["教材中心"],
    summary="获取教材单元列表",
    description="查询指定教材的教学单元列表",
)
async def get_units(textbook_id: int, db: AsyncSession = Database):
    units = await textbook.query_textbook_units(db, textbook_id)
    return units


@textbook_router.get(
    "/{unit_id}/knowledges",
    tags=["教材中心"],
    summary="获取单元知识点列表",
    description="查询指定单元包含的所有知识点",
)
async def get_unit_knowledges(unit_id: int, db: AsyncSession = Database):
    knowledges = await textbook.get_unit_knowledges(db, unit_id)
    return knowledges
