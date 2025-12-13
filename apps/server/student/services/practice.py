"""通用练习服务"""

from typing import Dict

from loguru import logger
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, joinedload

import ai
from shared.core.database import (
    PracticeAnswer,
    PracticeReport,
    PracticeSession,
    Question,
)
from shared.core.schema import (
    PracticeAnswerSchema,
    PracticeReportSchema,
    PracticeSessionSchema,
)
from shared.utils import oss
from shared.utils.time import now, today


async def get_daily_practice(db: AsyncSession, student_id: str, textbook_id: int):
    """获取每日所有的日常练习记录"""
    result = await db.scalar(
        select(PracticeSession).where(
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
        raise ValueError("练习会话不存在")

    if session.student_id != student_id:
        raise ValueError("无权操作此练习")

    if session.status == 0:
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
        raise ValueError("练习会话不存在")

    if session.student_id != student_id:
        raise ValueError("无权操作此练习")

    # 如果已经完成，直接返回报告ID
    if session.status == 2:
        logger.warning(f"练习已完成: session_id={session_id}")
        # 查询报告ID
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


async def get_practice_history(
    db: AsyncSession, student_id: str, practice_type: str, limit: int = 30
):
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


async def get_session_detail(db: AsyncSession, student_id: str, session_id: int) -> Dict:
    """
    根据练习会话ID查询会话详情（学生端）
    包括：会话基本信息、问题列表、已完成练习的报告

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID

    Returns:
        会话详情，包含session、questions、answers、report
    """
    # 查询会话基本信息
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    # 验证权限
    if session.student_id != student_id:
        raise ValueError("无权访问此练习会话")

    # 查询答题记录和题目信息
    results = await db.scalars(
        select(PracticeAnswer)
        .options(joinedload(PracticeAnswer.question))
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
    )

    # 获取所有答题记录
    answers = [PracticeAnswerSchema.model_validate(answer) for answer in results.all()]

    # 对 answers 根据 question_order 进行排序
    answers.sort(key=lambda x: x.question_order)
    questions = [answer.question for answer in answers]

    for answer in answers:
        answer.question = None

    # 查询报告（如果练习已完成）
    report = None
    if session.status == 2:
        report = await db.scalar(
            select(PracticeReport).where(PracticeReport.session_id == session_id)
        )

    # 构建返回结果
    result = {
        "session": PracticeSessionSchema.model_validate(session),
        "questions": questions,
        "answers": answers,
        "report": PracticeReportSchema.model_validate(report) if report else None,
    }

    logger.info(
        f"[Student] 获取会话详情成功: session_id={session_id}, question_count={len(questions)}"
    )

    return result


async def analyze_audio_answer(
    db: AsyncSession,
    student_id: str,
    session_id: int,
    question_id: int,
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

    analysis_result = await ai.question.analyze_audio_answer(question, audio_url, audio_type)
    logger.info(
        f"音频理解成功: match={analysis_result.match}, text_length={len(analysis_result.text)}"
    )

    # 更新 PracticeAnswer
    answer = await db.scalar(
        select(PracticeAnswer).where(
            PracticeAnswer.session_id == session_id,
            PracticeAnswer.question_id == question_id,
        )
    )
    if not answer:
        raise ValueError("答题记录不存在")

    answer.audio_answer = oss_path
    answer.text_answer = analysis_result.text
    await db.commit()

    return analysis_result
