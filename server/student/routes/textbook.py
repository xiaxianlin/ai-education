from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from student.services import textbook

textbook_router = APIRouter(prefix="/textbook")


@textbook_router.get("/all")
async def get_textbooks(request: Request, db: AsyncSession = Database):
    """获取学生的教材列表"""
    textbooks = await textbook.query_student_textbook(db, request.state.student.id)
    return textbooks


@textbook_router.get("/units")
async def get_units(textbook_id: int, request: Request, db: AsyncSession = Database):
    """获取单元列表，如果指定了textbook_id则获取该教材的单元，否则获取当前教材的单元"""
    units = await textbook.query_textbook_units(db, request.state.student.id, textbook_id)
    return units


@textbook_router.post("/acitve/{textbook_id}")
async def active_textbook(textbook_id: int, request: Request, db: AsyncSession = Database):
    """激活指定教材为当前使用教材"""
    await textbook.activate_student_textbook(db, request.state.student.id, textbook_id)
