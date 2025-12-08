"""答题分析路由"""

from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import noload
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Database, PracticeSession, PracticeAnswer, PracticeWrongRecord
from services.analysis import practice_report_analysis

router = APIRouter()


@router.post("/{id}/report")
async def analyze_report(id: int, db: AsyncSession = Database):
    """分析练习报告"""
    logger.info(f"开始分析练习报告: {id}")
    try:
        # 读取练习记录
        practice_session = await db.scalar(
            select(PracticeSession)
            .options(noload(PracticeSession.textbook))
            .where(PracticeSession.id == id)
        )
        if not practice_session:
            raise ValueError(f"练习记录不存在: {id}")

        answer_result = await db.scalars(
            select(PracticeAnswer).where(PracticeAnswer.session_id == id)
        )
        practice_answers = answer_result.all()

        wrong_answer_result = await db.scalars(
            select(PracticeWrongRecord).where(PracticeWrongRecord.session_id == id)
        )
        wrong_records = wrong_answer_result.all()
        return practice_report_analysis(
            db=db,
            session=practice_session,
            answers=practice_answers,
            wrong_records=wrong_records,
        )
    except Exception as e:
        logger.error(f"练习报告分析失败: {e}", exc_info=True)
        raise ValueError(f"练习报告分析失败: {e}")
