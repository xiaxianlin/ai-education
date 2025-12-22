from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from student.services import textbook

textbook_router = APIRouter(prefix="/textbook")


@textbook_router.get(
    "/{textbook_id}/units",
    tags=["教材中心"],
    summary="获取教材单元列表",
    description="查询指定教材或当前默认教材的教学单元列表",
)
async def get_units(textbook_id: int, request: Request, db: AsyncSession = Database):
    units = await textbook.query_textbook_units(db, request.state.student.id, textbook_id)
    return units


@textbook_router.get(
    "/{unit_id}/knowledges",
    tags=["教材中心"],
    summary="获取单元知识点列表",
    description="查询指定单元包含的所有知识点（学生需拥有该教材权限）",
)
async def get_unit_knowledges(unit_id: int, request: Request, db: AsyncSession = Database):
    student = request.state.student
    knowledges = await textbook.get_unit_knowledges(db, student.id, unit_id)
    return knowledges
