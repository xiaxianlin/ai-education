"""通用练习服务"""

from loguru import logger
from shared.core.database import (
    PracticeSession,
    PracticeSessionAnswer,
    Question,
)
from shared.core.schema import (
    PracticeSessionSchema,
)
from shared.services import answer as ai_answer
from shared.utils import oss
from shared.utils.time import now, today
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload


async def get_daily_practice(db: AsyncSession, student_id: str, textbook_id: int):
    """获取每日所有的日常练习记录"""
    result = await db.scalar(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == today(),
            PracticeSession.textbook_id == textbook_id,
        )
    )

    if result is None:
        return None
    return PracticeSessionSchema.model_validate(result)


async def get_unit_practice(db: AsyncSession, student_id: str, unit_id: int):
    """获取所有未完成单元练习记录"""
    result = await db.scalar(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status != 2,
        )
    )

    if result is None:
        return None
    return PracticeSessionSchema.model_validate(result)


async def get_assessment(db: AsyncSession, student_id: str, textbook_id: int):
    """获取所有未完成综合评估记录"""
    result = await db.scalar(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.status != 2,
        )
    )

    if result is None:
        return None
    return PracticeSessionSchema.model_validate(result)


async def begin_practice(db: AsyncSession, student_id: str, session_id: int) -> dict:
    """
    开始练习

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID

    """
    # 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    if session.status == 0:
        # 检查生成状态
        if session.generate_status == 0:
            raise ValueError("练习正在生成中，请稍候")
        if session.generate_status == -1:
            raise ValueError("练习生成失败，请重新生成")
        if session.generate_status != 1:
            raise ValueError(f"练习状态异常，无法开始（generate_status={session.generate_status}）")

        # 更新状态为进行中
        session.status = 1
        session.start_time = now()
        session.update_time = now()
        await db.commit()
        logger.info(f"练习开始: session_id={session_id}, student_id={student_id}")
    else:
        raise ValueError("练习一开始或者已完成")


async def complete_practice(db: AsyncSession, student_id: str, session_id: int) -> int:
    """
    完成练习，生成报告

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID

    Returns:
        报告ID
    """
    # 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    # 检查是否已完成所有题目
    if session.answer_count < session.question_count:
        logger.warning(
            f"练习未完成所有题目: session_id={session_id}, "
            f"已答={session.answer_count}, 总数={session.question_count}"
        )
        # 允许未完成就结束，但记录警告日志

    # 如果已经完成，直接返回报告ID
    if session.status == 2:
        logger.info(f"练习已完成: session_id={session_id}")
        # 先查询报告是否存在
        from shared.core.database import PracticeSessionReport

        report = await db.scalar(select(PracticeSessionReport).where(PracticeSessionReport.session_id == session_id))
        if report:
            return report.id
        # 如果报告不存在，再生成
        from student.services.report import generate_practice_report

        report_id = await generate_practice_report(db, student_id, session_id)
        return report_id

    # 更新状态为已完成
    session.status = 2
    session.end_time = now()
    session.update_time = now()
    await db.commit()

    logger.info(f"练习完成: session_id={session_id}, student_id={student_id}")

    # 生成报告
    from student.services.report import generate_practice_report

    report_id = await generate_practice_report(db, student_id, session_id)

    return report_id


async def get_practice_history(db: AsyncSession, student_id: str, practice_type: str, limit: int = 30):
    """
    获取指定类型的练习历史记录

    Args:
        db: 数据库会话
        student_id: 学生ID
        practice_type: 练习类型 (daily_practice/unit_practice/assessment)
        limit: 返回记录数量，默认30条

    Returns:
        练习历史记录列表
    """
    # 查询最近的练习记录（按创建时间倒序）
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == practice_type,
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )

    return [PracticeSessionSchema.model_validate(session) for session in sessions.all()]


async def analyze_audio_answer(
    db: AsyncSession,
    student_id: str,
    session_id: int,
    question_id: str,
    audio_data: bytes,
    audio_type: str = "webm",
):
    """上传录音并进行语音识别"""

    question = await db.scalar(select(Question).where(Question.id == question_id))
    if not question:
        raise ValueError("题目不存在")

    # 构建 OSS 存储路径
    oss_path = f"answer/{student_id}_{session_id}_{question_id}.{audio_type}"

    oss.upload(oss_path, audio_data)
    logger.info(f"录音上传 OSS 成功: {oss_path}")

    # 获取 OSS 访问地址
    audio_url = oss.get_access_url(oss_path)
    logger.info(f"获取 OSS 访问地址成功: {audio_url}")

    analysis_result = await ai_answer.analyze_audio_answer(question, audio_url)
    logger.info(f"音频理解成功: match={analysis_result.match}, text_length={len(analysis_result.text)}")

    # 更新 PracticeSessionAnswer
    answer = await db.scalar(
        select(PracticeSessionAnswer).where(
            PracticeSessionAnswer.session_id == session_id,
            PracticeSessionAnswer.question_id == question_id,
        )
    )
    if not answer:
        raise ValueError("答题记录不存在")

    answer.audio_answer = oss_path
    answer.text_answer = analysis_result.text
    await db.commit()

    return analysis_result
