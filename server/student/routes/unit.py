"""单元相关路由（学生端）"""

from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from student.services import unit as unit_service

unit_router = APIRouter(prefix="/unit")


@unit_router.get("/{unit_id}/knowledges")
async def get_unit_knowledges(
    unit_id: int, request: Request, db: AsyncSession = Database
):
    """
    根据单元ID获取知识点列表（学生端）
    
    需要验证学生是否有权限访问该单元（单元必须属于学生的教材）
    """
    student = request.state.student
    knowledges = await unit_service.get_unit_knowledges(db, student.id, unit_id)
    return knowledges


@unit_router.get("/practice/in-progress")
async def get_in_progress_unit_practice(
    request: Request, db: AsyncSession = Database
):
    """
    获取进行中的单元练习（学生端）
    
    返回学生当前进行中的第一个单元练习会话
    """
    student = request.state.student
    session = await unit_service.get_in_progress_unit_practice(db, student.id)
    return session
