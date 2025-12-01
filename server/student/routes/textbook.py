from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from student.services import textbook

textbook_router = APIRouter(prefix="/textbook")


@textbook_router.get("/{textbook_id}/units")
async def get_units(textbook_id: int, request: Request, db: AsyncSession = Database):
    """获取单元列表，如果指定了textbook_id则获取该教材的单元，否则获取当前教材的单元"""
    units = await textbook.query_textbook_units(db, request.state.student.id, textbook_id)
    return units


@textbook_router.get("/{unit_id}/knowledges")
async def get_unit_knowledges(unit_id: int, request: Request, db: AsyncSession = Database):
    """
    根据单元ID获取知识点列表（学生端）

    需要验证学生是否有权限访问该单元（单元必须属于学生的教材）
    """
    student = request.state.student
    knowledges = await textbook.get_unit_knowledges(db, student.id, unit_id)
    return knowledges
