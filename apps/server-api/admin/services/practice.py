"""练习管理服务 - Admin端"""

from loguru import logger
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import (
    PracticeSession,
    PracticeAnswer,
    PracticeReport,
    PracticeWrongRecord,
)
from shared.core.schema import (
    PracticeAnswerSchema,
    PracticeSessionSchema,
    PracticeReportSchema,
    PracticeWrongRecordSchema,
    PracticeDetailSchema,
)


async def get_practice_history(db: AsyncSession, student_id: str, practice_type: str):
    """根据学生ID和练习类型获取最近 30 条练习记录"""
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id, PracticeSession.session_type == practice_type
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(30)
    )

    result = [PracticeSessionSchema.model_validate(session) for session in sessions.all()]
    print(result)

    logger.info(
        f"[Admin] 获取练习历史: student_id={student_id}, type={practice_type}, count={len(result)}"
    )
    return result


async def get_session_detail(db: AsyncSession, session_id: int):
    """
    根据练习会话ID查询会话详情
    包括：会话基本信息、问题列表、已完成练习的报告、错题记录
    """
    # 查询会话基本信息
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    # 查询答题记录和题目信息
    answers = await db.scalars(
        select(PracticeAnswer)
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
    )

    # 查询报告（如果练习已完成）
    report = None
    if session.status == 2:
        report = await db.scalar(
            select(PracticeReport).where(PracticeReport.session_id == session_id)
        )

    # 查询错题记录
    wrong_records = await db.scalars(
        select(PracticeWrongRecord)
        .where(PracticeWrongRecord.session_id == session_id)
        .order_by(desc(PracticeWrongRecord.create_time))
    )

    return PracticeDetailSchema(
        session=PracticeSessionSchema.model_validate(session),
        answers=[PracticeAnswerSchema.model_validate(answer) for answer in answers.all()],
        report=PracticeReportSchema.model_validate(report) if report else None,
        wrong_records=[
            PracticeWrongRecordSchema.model_validate(record) for record in wrong_records.all()
        ],
    )


async def delete_session(db: AsyncSession, session_id: int):
    """删除练习会话"""
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    logger.info(f"[Admin] 开始删除练习会话: session_id={session_id}, type={session.session_type}")

    try:
        # 删除会话相关的所有数据
        # 1. 删除答题记录
        await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))

        # 2. 删除报告（如果存在）
        await db.execute(delete(PracticeReport).where(PracticeReport.session_id == session_id))

        # 3. 删除会话本身
        await db.delete(session)
        await db.commit()

        logger.info(f"[Admin] 练习会话删除成功: session_id={session_id}")

    except Exception as e:
        await db.rollback()
        logger.error(f"[Admin] 删除练习会话失败: session_id={session_id}, error={e}")
        raise ValueError(f"删除练习会话失败: {str(e)}")
