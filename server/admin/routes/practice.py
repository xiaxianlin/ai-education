"""练习管理路由 - Admin端"""

from fastapi import Depends
from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from shared.services.practice import PracticeService
from admin.services import practice
from admin.schema import GeneratePracticeSchema


practice_router = APIRouter(prefix="/practice", tags=["学生练习管理"])


@practice_router.post("/generate")
async def generate_practice_session(
    params: GeneratePracticeSchema = Depends(), db: AsyncSession = Database
):
    """
    根据学生ID和练习类型生成练习

    Args:
        student_id: 学生ID
        type: 练习类型 (daily_practice/unit_practice/assessment)
        unit_id: 单元ID (可选)
        count: 练习题目数量 (可选)

    Returns:
        练习会话信息
    """
    type = params.type
    student_id = params.student_id
    textbook_id = params.textbook_id
    unit_id = params.unit_id
    count = params.count
    if type == "daily_practice":
        return await PracticeService.create_daily_practice(
            db=db, student_id=student_id, texbook_id=textbook_id, count=count
        )
    elif type == "unit_practice":
        return await PracticeService.create_unit_practice(
            db=db, student_id=student_id, texbook_id=textbook_id, count=count, unit_id=unit_id
        )
    elif type == "assessment":
        return await PracticeService.create_assessment(
            db=db, student_id=student_id, texbook_id=textbook_id, count=count
        )
    else:
        raise ValueError("无效的练习类型，可选值：daily_practice, unit_practice, assessment")


@practice_router.post("/{session_id}/regenerate")
async def regenerate_practice_session(session_id: int, db: AsyncSession = Database):
    """
    根据练习会话ID重新生成练习

    Args:
        session_id: 练习会话ID

    Returns:
        练习统计信息
    """
    return await PracticeService.regenerate_practice_session(db, session_id)


@practice_router.get("/{student_id}/history/{practice_type}")
async def get_practice_history(student_id: str, practice_type: str, db: AsyncSession = Database):
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

    Args:
        session_id: 练习会话ID

    Returns:
        会话详情，包含session、answers、report三部分
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
