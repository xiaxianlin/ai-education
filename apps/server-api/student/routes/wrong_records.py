"""错题记录路由（学生端）"""

from typing import List, Optional
from fastapi import APIRouter, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.services import wrong_records

wrong_records_router = APIRouter(prefix="/wrong-records")


@wrong_records_router.get("/")
async def get_wrong_questions_route(
    request: Request,
    mastered: Optional[int] = Query(None, description="是否已掌握 (0-未掌握, 1-已掌握)"),
    db: AsyncSession = Database,
) -> List[dict]:
    """
    获取错题列表
    
    根据 mastered 参数筛选：
    - None: 返回全部错题
    - 0: 返回未掌握的错题
    - 1: 返回已掌握的错题
    """
    student = request.state.student
    result = await wrong_records.get_wrong_questions(
        db, student.id, mastered=mastered
    )
    return result


@wrong_records_router.post("/{question_id}/master")
async def mark_question_as_mastered_route(
    question_id: int,
    request: Request,
    db: AsyncSession = Database,
) -> dict:
    """标记题目为已掌握"""
    student = request.state.student
    await wrong_records.mark_question_as_mastered(
        db, student.id, question_id
    )
    return {"message": "已标记为已掌握"}


@wrong_records_router.post("/{question_id}/unmaster")
async def unmark_question_as_mastered_route(
    question_id: int,
    request: Request,
    db: AsyncSession = Database,
) -> dict:
    """取消标记题目为已掌握（标记为未掌握）"""
    student = request.state.student
    await wrong_records.unmark_question_as_mastered(
        db, student.id, question_id
    )
    return {"message": "已标记为未掌握"}

