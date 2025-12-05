"""通用练习服务"""

import os
from pathlib import Path
from typing import Dict, Tuple
from loguru import logger
from sqlalchemy import select, desc
from sqlalchemy.orm import noload
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, PracticeAnswer, PracticeReport, Question
from core.schema import PracticeSessionSchema, QuestionSchema, PracticeReportSchema
from core.settings import envs
from shared.services.aliyun import AliyunAIService, AudioUnderstandingResult
from shared.provider.aliyun import AliyunOSS
from shared.utils.time import now, today


async def get_daily_practice(db: AsyncSession, student_id: str):
    """获取每日所有的日常练习记录"""
    result = await db.scalars(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == today(),
        )
    )

    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def get_unit_practice(db: AsyncSession, student_id: str):
    """获取所有未完成单元练习记录"""
    result = await db.scalars(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.status != 2,
        )
    )

    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def get_assessment(db: AsyncSession, student_id: str):
    """获取所有未完成综合评估记录"""
    result = await db.scalars(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status != 2,
        )
    )

    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


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

    # 如果已经开始或已完成，不能重复开始
    if session.status == 1:
        logger.warning(f"练习已经开始: session_id={session_id}")
        # 返回当前状态
    elif session.status == 2:
        raise ValueError("练习已完成，无法重新开始")
    else:
        # 更新状态为进行中
        session.status = 1
        session.start_time = now()
        session.update_time = now()
        await db.commit()
        logger.info(f"练习开始: session_id={session_id}, student_id={student_id}")


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
            PracticeSession.student_id == student_id, PracticeSession.session_type == practice_type
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
    answer_records = await db.scalars(
        select(PracticeAnswer)
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
    )

    # 获取所有题目ID
    answers = answer_records.all()
    question_ids = [answer.question_id for answer in answers]

    # 查询题目详情
    questions = []
    if question_ids:
        question_objs = await db.scalars(select(Question).where(Question.id.in_(question_ids)))
        questions = [QuestionSchema.model_validate(q) for q in question_objs.all()]

    # 构建答题记录列表
    answer_list = []
    for answer in answers:
        answer_data = {
            "question_id": answer.question_id,
            "question_order": answer.question_order,
            "text_answer": answer.text_answer,
            "status": answer.status,
            "time_spent": answer.time_spent,
            "submit_time": answer.submit_time,
        }
        answer_list.append(answer_data)

    # 查询报告（如果练习已完成）
    report = None
    if session.status == 2:
        report_obj = await db.scalar(
            select(PracticeReport).where(PracticeReport.session_id == session_id)
        )
        if report_obj:
            report = PracticeReportSchema.model_validate(report_obj)

    # 构建返回结果
    session_dict = PracticeSessionSchema.model_validate(session)

    result = {
        "session": session_dict,
        "questions": questions,
        "answers": answer_list,
        "report": report,
    }

    logger.info(
        f"[Student] 获取会话详情成功: session_id={session_id}, question_count={len(questions)}"
    )

    return result


async def upload_recording(
    db: AsyncSession,
    student_id: str,
    session_id: int,
    question_id: int,
    audio_data: bytes,
    audio_type: str = "webm",
) -> Tuple[str, AudioUnderstandingResult]:
    """
    上传录音并进行语音识别

    Args:
        student_id: 学生ID
        session_id: 练习会话ID
        question_id: 问题ID
        audio_data: 音频数据 (bytes)
        audio_type: 音频格式，默认为webm

    Returns:
        Tuple[oss_path, analysis]: OSS 存储路径和音频理解结果模型
    """
    # 构建 OSS 存储路径
    oss_path = f"answer/{student_id}_{session_id}_{question_id}.{audio_type}"

    file_path = None
    try:
        # 创建临时目录保存音频文件（ASR 需要文件路径）
        tmp_dir = Path(envs.TMP_DIR) / "recordings"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        file_path = tmp_dir / f"{student_id}_{session_id}_{question_id}.{audio_type}"

        # 写入临时文件
        with open(file_path, "wb") as f:
            f.write(audio_data)
        logger.info(f"录音临时文件创建成功: {file_path}")

        # 上传到 OSS
        oss = AliyunOSS()
        if oss.exist(oss_path):
            logger.info(f"OSS 文件已存在，先删除: {oss_path}")
            oss.delete(oss_path)
        oss.upload(oss_path, audio_data)
        logger.info(f"录音上传 OSS 成功: {oss_path}")

        # 获取 OSS 访问地址
        audio_url = oss.get_access_url(oss_path)
        logger.info(f"获取 OSS 访问地址成功: {audio_url}")

        # 查询题目信息，用于构造问题提示
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            raise ValueError("题目不存在")

        # 调用音频理解函数（包含转写 + 匹配分析）
        analysis_result = AliyunAIService.audio_understanding(
            audio_url=audio_url,
            audio_type=audio_type,
            question=question.content,
        )
        logger.info(
            "音频理解成功: match=%s, recognized_text_length=%s",
            analysis_result.match,
            len(analysis_result.recognized_text),
        )

        return oss_path, analysis_result

    except Exception as e:
        logger.error(f"上传录音失败: {e}")
        raise ValueError(f"上传录音失败: {str(e)}")
    finally:
        # 清理临时文件
        if file_path and file_path.exists():
            os.remove(file_path)
            logger.info(f"临时文件已删除: {file_path}")
