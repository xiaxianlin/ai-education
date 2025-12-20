from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from shared.core.database import Question
from shared.core.constants import QUESTION_RECALL_COUNT
from loguru import logger


async def recall_for_daily_practice(db: AsyncSession, student_id: str, textbook_id: int) -> List[Question]:
    """为日常练习召回题目

    Args:
        db: 数据库会话
        student_id: 学生ID
        textbook_id: 教材ID

    Returns:
        题目列表

    Note:
        策略：从教材中随机选择题目，优先排除学生最近做过的题目
        召回数量从环境变量 QUESTION_RECALL_COUNT 读取
    """
    if QUESTION_RECALL_COUNT == 0:
        return []

    # 构建查询：从教材随机选择
    stmt = (
        select(Question).where(Question.textbook_id == textbook_id).order_by(func.random()).limit(QUESTION_RECALL_COUNT)
    )

    result = await db.execute(stmt)
    questions = result.scalars().all()

    logger.debug(f"日常练习召回题目: student_id={student_id}, textbook_id={textbook_id}, " f"召回数量={len(questions)}")

    return list(questions[:QUESTION_RECALL_COUNT])


async def recall_for_unit_practice(db: AsyncSession, unit_id: int) -> List[Question]:
    """为单元练习召回题目

    Args:
        db: 数据库会话
        unit_id: 单元ID

    Returns:
        题目列表

    Note:
        策略：从指定单元随机选择题目，优先保持题型多样性
        召回数量从环境变量 QUESTION_RECALL_COUNT 读取
    """
    if QUESTION_RECALL_COUNT == 0:
        return []

    # 构建查询：从指定单元随机选择
    stmt = select(Question).where(Question.unit_id == unit_id).order_by(func.random()).limit(QUESTION_RECALL_COUNT)

    result = await db.execute(stmt)
    questions = result.scalars().all()

    logger.debug(f"单元练习召回题目: unit_id={unit_id}, " f"召回数量={len(questions)}")

    return list(questions[:QUESTION_RECALL_COUNT])


async def recall_for_assessment(db: AsyncSession, textbook_id: int) -> List[Question]:
    """为综合评估召回题目

    Args:
        db: 数据库会话
        textbook_id: 教材ID
        student_id: 学生ID（可选，如果提供则排除该学生最近做过的题目）

    Returns:
        题目列表

    Note:
        策略：从指定教材随机选择题目，用于避免生成重复题目
        召回数量从环境变量 QUESTION_RECALL_COUNT 读取
    """
    if QUESTION_RECALL_COUNT == 0:
        return []

    # 构建查询：从教材随机选择
    stmt = (
        select(Question).where(Question.textbook_id == textbook_id).order_by(func.random()).limit(QUESTION_RECALL_COUNT)
    )

    result = await db.execute(stmt)
    questions = result.scalars().all()

    logger.debug(f"综合评估召回题目: textbook_id={textbook_id}, " f"召回数量={len(questions)}")

    return list(questions[:QUESTION_RECALL_COUNT])
