from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
import admin.services.practice as practice_service


practice_router = APIRouter(prefix="/practice", tags=["学生练习管理"])


@practice_router.get("/{id}/daily")
async def get_daily_practice(id: str, db: AsyncSession = Database):
    """获取学生的每日练习"""
    return await practice_service.get_daily_practice(db, id)


@practice_router.get("/{id}/{type}/history")
async def get_practice_history(id: str, type: str, db: AsyncSession = Database):
    """获取学生的练习列表"""
    return await practice_service.get_practice_history(db, id, type)


@practice_router.post("/{id}/{type}/generate")
async def generate_student_practice(id: str, type: str, db: AsyncSession = Database):
    """根据学生ID和练习类型生成练习"""
    return await practice_service.generate_practice(db, id, type)


@practice_router.post("/{id}/{session_id}/regenerate")
async def regenerate_student_practice(id: str, session_id: int, db: AsyncSession = Database):
    """根据学生ID和练习会话ID重新生成练习"""
    return await practice_service.regenerate_practice(db, id, session_id)
