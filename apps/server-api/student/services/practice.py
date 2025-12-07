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
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )

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
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )

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


async def get_session_detail(
    db: AsyncSession, student_id: str, session_id: int
) -> Dict:
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
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )

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
        question_objs = await db.scalars(
            select(Question).where(Question.id.in_(question_ids))
        )
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
):
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


async def generate_practice_session(
    *,
    db: AsyncSession,
    type: str,
    student_id: str,
    textbook_id: int,
    unit_id: int | None = None,
):

    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))

    if not textbook:
        raise ValueError("教材不纯粹")
    unit = None
    target_id = today()
    if type == "unit_practice":
        unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
        target_id = unit_id
    # 生成开始前，先创建会话记录
    session = PracticeSession(
        student_id=student_id,
        session_type=type,
        target_id=target_id,
        textbook_id=textbook_id,
    )
    db.add(session)
    await db.flush()

    try:
        count = GENERATE_QUESTION_COUNT[textbook.grade][type]
        if not count:
            raise ValueError("生成数量异常")

        logger.info(f"开始生成练习会话: session_id={session.id}, type={type}")

        # 提交任务到 server-task
        task_id = str(uuid.uuid4())
        task_client = TaskServiceClient()

        payload = {
            "type": type,
            "count": count,
            "textbook_id": textbook.id,
            "student_id": student_id,
        }
        if unit:
            payload["unit_id"] = unit.id

        await task_client.submit_task(
            task_id=task_id,
            task_type="question_generation",
            payload=payload,
            timeout=600,
        )

        # 轮询任务状态直到完成
        max_wait_time = 600
        poll_interval = 2
        elapsed_time = 0

        while elapsed_time < max_wait_time:
            status = await task_client.get_task_status(task_id)
            if not status:
                raise ValueError("任务不存在")

            task_status = status.get("status")
            if task_status == "completed":
                # 从数据库查询生成的题目（根据类型和参数）
                query = select(Question).where(Question.textbook_id == textbook.id)
                if unit:
                    query = query.where(Question.unit_id == unit.id)
                query = query.order_by(Question.id.desc()).limit(count)
                questions_result = await db.scalars(query)
                questions = questions_result.all()
                break
            elif task_status == "failed":
                error_msg = status.get("error", "未知错误")
                raise ValueError(f"题目生成失败: {error_msg}")

            await asyncio.sleep(poll_interval)
            elapsed_time += poll_interval
        else:
            raise ValueError("题目生成超时")

        await PracticeService.create_answer_records(db, session.id, questions)

        session.question_count = len(questions)
        session.generate_status = 1
        session.update_time = now()
        await db.commit()

        logger.info(
            f"练习会话生成完成: session_id={session.id}, question_count={session.question_count}"
        )
        return session
    except Exception as e:
        logger.error(f"生成练习会话失败: session_id={session.id}, error={e}")
        await db.rollback()
        await db.delete(session)
        raise ValueError(f"会话生成失败: {str(e)}")


async def regenerate_practice_session(db: AsyncSession, session_id: int):
    # 查询练习会话
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )
    if not session:
        raise ValueError("当前练习不存在")

    if session.generate_status == 0:
        raise ValueError("当前练习正在生成中，请稍后重试")

    try:
        # 更新练习会话状态
        session.generate_status = 0
        session.question_count = 0
        session.correct_count = 0
        session.start_time = 0
        session.answer_count = 0

        logger.info(
            f"开始重新生成练习会话: session_id={session_id}, type={session.session_type}"
        )

        unit_id = session.target_id if session.session_type == "unit_practice" else None

        # 提交任务到 server-task
        task_id = str(uuid.uuid4())
        task_client = TaskServiceClient()

        payload = {
            "type": session.session_type,
            "count": session.question_count,
            "textbook_id": session.textbook_id,
            "student_id": session.student_id,
        }
        if unit_id:
            payload["unit_id"] = unit_id

        await task_client.submit_task(
            task_id=task_id,
            task_type="question_generation",
            payload=payload,
            timeout=600,
        )

        # 轮询任务状态直到完成
        max_wait_time = 600
        poll_interval = 2
        elapsed_time = 0

        while elapsed_time < max_wait_time:
            status = await task_client.get_task_status(task_id)
            if not status:
                raise ValueError("任务不存在")

            task_status = status.get("status")
            if task_status == "completed":
                # 从数据库查询生成的题目
                query = select(Question).where(
                    Question.textbook_id == session.textbook_id
                )
                if unit_id:
                    query = query.where(Question.unit_id == unit_id)
                query = query.order_by(Question.id.desc()).limit(session.question_count)
                questions_result = await db.scalars(query)
                questions = questions_result.all()
                break
            elif task_status == "failed":
                error_msg = status.get("error", "未知错误")
                raise ValueError(f"题目生成失败: {error_msg}")

            await asyncio.sleep(poll_interval)
            elapsed_time += poll_interval
        else:
            raise ValueError("题目生成超时")

        await db.execute(
            delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
        )
        await db.flush()  # 确保删除操作完成

        # 批量创建答题记录
        answer_records = []
        for index, question in enumerate(questions):
            answer_record = PracticeAnswer(
                session_id=session_id,
                question_id=question.id,
                question_order=index + 1,
                status=0,
                time_spent=0,
            )
            answer_records.append(answer_record)

        db.add_all(answer_records)

        session.question_count = len(questions)
        session.generate_status = 1
        await db.commit()

        logger.info(
            f"练习会话重新生成完成: session_id={session_id}, question_count={session.question_count}"
        )
        return session
    except Exception as e:
        logger.error(f"重新生成练习会话失败: session_id={session_id}, error={e}")
        await db.rollback()
        raise ValueError(f"会话重新生成失败: {str(e)}")


async def create_daily_practice(
    db: AsyncSession,
    student_id: str,
    textbook_id: int,
):
    """为学生生成每日练习"""
    current_date = today()

    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == current_date,
        )
    )

    if session:
        raise ValueError("当天每日练习已存在")

    uncompleted_session = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.status != 2,
        )
        .order_by(desc(PracticeSession.create_time))
    )

    if uncompleted_session:

        logger.info(
            f"找到未完成的每日练习，准备重置: student_id={student_id},session_id={uncompleted_session.id}"
        )

        try:
            # 重置所有答题记录的信息
            answer_records = await db.scalars(
                select(PracticeAnswer).where(
                    PracticeAnswer.session_id == uncompleted_session.id
                )
            )
            for answer in answer_records.all():
                answer.text_answer = None
                answer.status = 0
                answer.time_spent = 0
                answer.submit_time = None
                answer.audio_answer = None

            # 重置进度并更新为当天的每日练习
            uncompleted_session.target_id = current_date
            uncompleted_session.status = 0
            uncompleted_session.answer_count = 0
            uncompleted_session.correct_count = 0
            uncompleted_session.start_time = 0
            uncompleted_session.end_time = None

            await db.commit()

            logger.info(
                f"未完成每日练习已重置为当天:student_id={student_id}, session_id={uncompleted_session.id}"
            )

            return uncompleted_session.id

        except Exception as e:
            await db.rollback()
            logger.error(
                f"重置未完成每日练习失败: student_id={student_id}, session_id={uncompleted_session.id}, error={e}"
            )
            raise ValueError(f"重置未完成每日练习失败: {str(e)}")

    logger.info(f"开始创建每日练习: student_id={student_id}")
    session = await generate_practice_session(
        db=db,
        type="daily_practice",
        student_id=student_id,
        textbook_id=textbook_id,
    )

    return session.id


async def create_unit_practice(
    db: AsyncSession,
    student_id: str,
    textbook_id: int,
    unit_id: int,
):
    """为学生生成单元练习"""

    # 获取单元信息
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))

    if not unit:
        raise ValueError("单元不存在")

    # 检查是否已存在未完成的单元练习
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status != 2,
        )
    )

    if session:
        raise ValueError("还存在未完成的单元练习，请先删除")

    logger.info(f"开始创建单元练习: student_id={student_id}, unit_id={unit_id}")

    session = await generate_practice_session(
        db=db,
        type="unit_practice",
        unit_id=unit_id,
        textbook_id=textbook_id,
        student_id=student_id,
    )

    logger.info(
        f"单元练习创建成功: student_id={student_id}, session_id={session.id}, unit_id={unit_id}"
    )

    return session.id


async def create_assessment(
    db: AsyncSession,
    student_id: str,
    textbook_id: int,
):
    """为学生生成能力评测"""

    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status != 2,
        )
    )

    if session:
        raise ValueError("还存在未完成的能力评测，请先删除")

    logger.info(f"开始创建能力评测: student_id={student_id}")

    session = await generate_practice_session(
        db=db,
        type="assessment",
        student_id=student_id,
        textbook_id=textbook_id,
    )

    return session.id
