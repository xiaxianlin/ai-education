"""练习管理路由 - Admin端"""

from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from admin.services import practice
from shared.core.database import Database

practice_router = APIRouter(prefix="/practice", tags=["学生练习管理"])


@practice_router.get("/{student_id}/history/{practice_type}")
async def get_practice_history(
    student_id: str, practice_type: str, db: AsyncSession = Database
):
    """
    根据学生ID和练习类型查询最近30条练习记录

    Args:
        student_id: 学生ID
        practice_type: 练习类型 (daily_practice/unit_practice/assessment)

    Returns:
        练习历史记录列表
    """
    # 验证练习类型
    valid_types = ["daily_practice", "unit_practice", "assessment"]
    if practice_type not in valid_types:
        raise ValueError(f"无效的练习类型，可选值：{', '.join(valid_types)}")

    # 获取历史记录
    return await practice.get_practice_history(db, student_id, practice_type)


@practice_router.get("/session/{session_id}")
async def get_session_detail(session_id: int, db: AsyncSession = Database):
    """
    根据练习会话ID查询会话详情

    包括：
    - 会话基本信息
    - 问题列表（带答题记录）
    - 已完成练习的报告（如果存在）
    - 错题记录列表

    Args:
        session_id: 练习会话ID

    Returns:
        会话详情，包含session、answers、report、wrong_records四部分
    """
    return await practice.get_session_detail(db, session_id)


@practice_router.delete("/session/{session_id}")
async def delete_session(session_id: int, db: AsyncSession = Database):
    """
    删除练习会话

    Args:
        session_id: 练习会话ID
    """
    await practice.delete_session(db, session_id)
