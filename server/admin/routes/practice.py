"""练习管理路由 - Admin端"""

from typing import Dict, List, Optional
from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.schema import PracticeStatsSchem
import admin.services.practice as practice_service


practice_router = APIRouter(prefix="/practice", tags=["学生练习管理"])


# ========== 每日练习相关接口 ==========


@practice_router.get("/{student_id}/daily")
async def get_daily_practice(student_id: str, db: AsyncSession = Database) -> Optional[Dict]:
    """
    根据学生ID查询当天的每日练习

    Args:
        student_id: 学生ID

    Returns:
        练习会话信息（如果存在）或 None
    """
    return await practice_service.get_daily_practice(db, student_id)


@practice_router.post("/{student_id}/daily/create")
async def create_daily_practice(student_id: str, db: AsyncSession = Database) -> Dict:
    """
    根据学生ID生成每日练习

    Args:
        student_id: 学生ID

    Returns:
        练习会话信息
    """
    return await practice_service.create_daily_practice(db, student_id)


@practice_router.post("/{student_id}/daily/regenerate")
async def regenerate_daily_practice(student_id: str, db: AsyncSession = Database) -> Dict:
    """
    根据学生ID重新生成每日练习

    Args:
        student_id: 学生ID

    Returns:
        练习会话信息
    """
    return await practice_service.regenerate_daily_practice(db, student_id)


# ========== 单元练习相关接口 ==========


@practice_router.post("/{student_id}/unit/{unit_id}/create", response_model=PracticeStatsSchem)
async def create_unit_practice(student_id: str, unit_id: int, db: AsyncSession = Database):
    """
    根据学生ID和单元ID生成单元练习

    Args:
        student_id: 学生ID
        unit_id: 单元ID

    Returns:
        练习统计信息
    """
    return await practice_service.create_unit_practice(db, student_id, unit_id)


@practice_router.post("/{student_id}/unit/{unit_id}/regenerate", response_model=PracticeStatsSchem)
async def regenerate_unit_practice(student_id: str, unit_id: int, db: AsyncSession = Database):
    """
    根据学生ID和单元ID重新生成单元练习

    Args:
        student_id: 学生ID
        unit_id: 单元ID

    Returns:
        练习统计信息
    """
    return await practice_service.regenerate_unit_practice(db, student_id, unit_id)


# ========== 能力评估相关接口 ==========


@practice_router.post("/{student_id}/assessment/create", response_model=PracticeStatsSchem)
async def create_assessment(student_id: str, db: AsyncSession = Database):
    """
    根据学生ID生成能力评估

    Args:
        student_id: 学生ID

    Returns:
        练习统计信息
    """
    return await practice_service.create_assessment(db, student_id)


@practice_router.post("/{student_id}/assessment/regenerate", response_model=PracticeStatsSchem)
async def regenerate_assessment(student_id: str, db: AsyncSession = Database):
    """
    根据学生ID重新生成能力评估

    Args:
        student_id: 学生ID

    Returns:
        练习统计信息
    """
    return await practice_service.regenerate_assessment(db, student_id)


# ========== 练习历史记录 ==========


@practice_router.get("/{student_id}/history/{practice_type}")
async def get_practice_history(
    student_id: str, practice_type: str, db: AsyncSession = Database
) -> List[Dict]:
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
    history_list = await practice_service.get_practice_history(
        db, student_id, practice_type, limit=30
    )

    # 转换为字典列表
    return [item.model_dump() for item in history_list]


# ========== 练习会话详情 ==========


@practice_router.get("/session/{session_id}/detail")
async def get_session_detail(session_id: int, db: AsyncSession = Database) -> Dict:
    """
    根据练习会话ID查询会话详情

    包括：
    - 会话基本信息
    - 问题列表（带答题记录）
    - 已完成练习的报告（如果存在）

    Args:
        session_id: 练习会话ID

    Returns:
        会话详情，包含session、answers、report三部分
    """
    return await practice_service.get_session_detail(db, session_id)


# ========== 删除练习会话 ==========


@practice_router.delete("/session/{session_id}")
async def delete_session(session_id: int, db: AsyncSession = Database):
    """
    删除练习会话

    Args:
        session_id: 练习会话ID
    """
    await practice_service.delete_session(db, session_id)
