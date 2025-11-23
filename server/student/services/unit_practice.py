"""单元练习服务"""

from typing import Dict, Optional
from loguru import logger
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, Unit
from student.schema import PracticeStatsSchem
from shared.services.practice import PracticeService


async def get_units_practice_stats(
    db: AsyncSession, student_id: str, textbook_id: int
) -> Dict[int, PracticeStatsSchem]:
    """
    获取指定教材下所有单元的未完成练习记录
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        textbook_id: 教材ID
        
    Returns:
        Dict[unit_id, PracticeStatsSchem]: 单元ID到练习统计的映射
    """
    # 查询该教材下所有未完成的单元练习
    sessions = await db.scalars(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.status != 2,  # 未完成的练习
        )
    )
    
    # 构建返回结果
    result = {}
    for session in sessions.all():
        unit_id = session.target_id
        
        # 统计该单元已完成的练习次数
        times = await count_unit_practice(db, student_id, unit_id)
        
        result[unit_id] = PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=times,
        )
    
    logger.info(
        f"获取单元练习统计: student_id={student_id}, textbook_id={textbook_id}, "
        f"units_count={len(result)}"
    )
    
    return result


async def check_unit_practice(
    db: AsyncSession, student_id: str, unit_id: int
) -> Optional[PracticeStatsSchem]:
    """检查是否有未完成的单元练习"""
    times = await count_unit_practice(db, student_id, unit_id)
    
    # 查找未完成的单元练习
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status != 2,  # 未完成的练习
        )
    )

    if not session:
        return None

    logger.info(f"找到未完成的单元练习: session_id={session.id}, student_id={student_id}, unit_id={unit_id}")

    return PracticeStatsSchem(
        session_id=session.id,
        status=session.status,
        total_questions=session.question_count,
        completed_questions=session.answer_count,
        right_questions=session.correct_count,
        times=times,
    )


async def create_unit_practice(
    db: AsyncSession, student_id: str, unit_id: int
) -> PracticeStatsSchem:
    """创建新的单元练习"""
    # 获取单元信息
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("单元不存在")
    
    # 获取教材信息
    textbook = unit.textbook
    if not textbook:
        raise ValueError("教材信息不存在")
    
    logger.info(
        f"开始创建单元练习: student_id={student_id}, unit_id={unit_id}, "
        f"textbook_id={textbook.id}"
    )
    
    try:
        times = await count_unit_practice(db, student_id, unit_id)
        
        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="unit_practice",
            count=30,
            recall_count=15,
            unit_id=unit_id,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询刚创建的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        if not session:
            raise ValueError("创建单元练习失败")

        logger.info(f"单元练习创建成功: session_id={session_id}, unit_id={unit_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=times,
        )

    except Exception as e:
        logger.error(f"创建单元练习失败: student_id={student_id}, unit_id={unit_id}, error={e}")
        raise ValueError(f"创建单元练习失败: {str(e)}")


async def count_unit_practice(db: AsyncSession, student_id: str, unit_id: int) -> int:
    """统计指定单元的练习次数（已完成的）"""
    result = await db.scalar(
        select(func.count(PracticeSession.id)).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status == 2,  # 只统计已完成的练习
        )
    )
    count = result or 0
    logger.info(f"单元练习次数统计: student_id={student_id}, unit_id={unit_id}, count={count}")
    return count

