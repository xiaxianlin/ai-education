"""通用练习服务"""

from typing import Optional, List, Dict
from loguru import logger
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, PracticeAnswer, PracticeReport, Question
from core.schema import PracticeSessionSchema, QuestionSchema, PracticeReportSchema
from student.schema import PracticeHistorySchema
from shared.utils.time import now


async def begin_practice(db: AsyncSession, student_id: str, session_id: int) -> dict:
    """
    开始练习
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID
        
    Returns:
        练习会话信息
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
    
    return {
        "session_id": session.id,
        "status": session.status,
        "session_type": session.session_type,
        "target_id": session.target_id,
        "textbook_id": session.textbook_id,
        "question_count": session.question_count,
        "answer_count": session.answer_count,
        "correct_count": session.correct_count,
        "start_time": session.start_time,
        "create_time": session.create_time,
    }


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
) -> List[PracticeHistorySchema]:
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

    result = []
    for session in sessions.all():
        result.append(
            PracticeHistorySchema(
                session_id=session.id,
                session_type=session.session_type,
                status=session.status,
                target_id=session.target_id,
                textbook_id=session.textbook_id,
                question_count=session.question_count,
                answer_count=session.answer_count,
                correct_count=session.correct_count,
                start_time=session.start_time,
                end_time=session.end_time,
                create_time=session.create_time,
            )
        )

    logger.info(
        f"获取练习历史: student_id={student_id}, type={practice_type}, "
        f"count={len(result)}"
    )

    return result


async def count_practice_by_type(
    db: AsyncSession, student_id: str, practice_type: str, target_id: Optional[int] = None
) -> int:
    """
    通用的练习次数统计函数

    Args:
        db: 数据库会话
        student_id: 学生ID
        practice_type: 练习类型 (daily_practice/unit_practice/assessment)
        target_id: 目标ID（单元练习时为 unit_id，每日练习时为日期，能力评估时不需要）

    Returns:
        练习次数
    """
    query = select(func.count(PracticeSession.id)).where(
        PracticeSession.student_id == student_id,
        PracticeSession.session_type == practice_type,
        PracticeSession.status == 2,  # 只统计已完成的练习
    )

    # 如果提供了 target_id，添加条件
    if target_id is not None:
        query = query.where(PracticeSession.target_id == target_id)

    result = await db.scalar(query)
    count = result or 0

    logger.info(
        f"练习次数统计: student_id={student_id}, type={practice_type}, "
        f"target_id={target_id}, count={count}"
    )
    return count


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
        questions = [QuestionSchema.model_validate(q).model_dump() for q in question_objs.all()]
    
    # 构建答题记录列表
    answer_list = []
    for answer in answers:
        answer_data = {
            "question_id": answer.question_id,
            "question_order": answer.question_order,
            "text_answer": answer.text_answer,
            "is_correct": answer.is_correct,
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
            report = PracticeReportSchema.model_validate(report_obj).model_dump()
    
    # 构建返回结果
    session_dict = PracticeSessionSchema.model_validate(session).model_dump()
    # 将 id 字段映射为 session_id，以符合前端接口定义
    session_dict["session_id"] = session_dict.pop("id", session.id)
    
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
