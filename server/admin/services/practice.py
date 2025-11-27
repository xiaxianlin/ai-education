"""练习管理服务 - Admin端"""

from typing import Dict
from loguru import logger
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, PracticeAnswer, PracticeReport, Question
from core.schema import PracticeSessionSchema, PracticeReportSchema, QuestionSchema
from shared.utils.time import today


async def get_practice_history(db: AsyncSession, student_id: str, practice_type: str):
    """根据学生ID和练习类型获取最近 30 条练习记录"""
    sessions = await db.scalars(
        select(PracticeSession)
        .where(PracticeSession.student_id == student_id, PracticeSession.session_type == practice_type)
        .order_by(desc(PracticeSession.create_time))
        .limit(30)
    )

    result = [PracticeSessionSchema.model_validate(session) for session in sessions.all()]
    print(result)

    logger.info(f"[Admin] 获取练习历史: student_id={student_id}, type={practice_type}, count={len(result)}")
    return result


async def get_daily_practice(db: AsyncSession, student_id: str):
    """获取学生当天的每日练习"""
    current_date = today()

    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == current_date,
        )
    )

    if not session:
        return None

    return PracticeSessionSchema.model_validate(session)


async def get_session_detail(db: AsyncSession, session_id: int) -> Dict:
    """
    根据练习会话ID查询会话详情
    包括：会话基本信息、问题列表、已完成练习的报告
    """
    # 查询会话基本信息
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    # 查询答题记录和题目信息
    answer_records = await db.scalars(
        select(PracticeAnswer).where(PracticeAnswer.session_id == session_id).order_by(PracticeAnswer.question_order)
    )

    # 获取所有题目ID
    answers = answer_records.all()
    question_ids = [answer.question_id for answer in answers]

    # 查询题目详情
    questions = await db.scalars(select(Question).where(Question.id.in_(question_ids)))
    question_dict = {q.id: q for q in questions.all()}

    # 构建答题记录列表（包含题目信息）
    answer_list = []
    for answer in answers:
        question = question_dict.get(answer.question_id)
        answer_data = {
            "id": answer.id,
            "session_id": answer.session_id,
            "question_id": answer.question_id,
            "question_order": answer.question_order,
            "text_answer": answer.text_answer,
            "status": answer.status,
            "time_spent": answer.time_spent,
            "submit_time": answer.submit_time,
        }

        # 添加题目信息
        if question:
            answer_data["question"] = QuestionSchema.model_validate(question).model_dump()

        answer_list.append(answer_data)

    # 查询报告（如果练习已完成）
    report = None
    if session.status == 2:
        report_obj = await db.scalar(select(PracticeReport).where(PracticeReport.session_id == session_id))
        if report_obj:
            report = PracticeReportSchema.model_validate(report_obj).model_dump()

    # 构建返回结果
    session_dict = PracticeSessionSchema.model_validate(session).model_dump()
    # 将 id 字段映射为 session_id，以符合前端接口定义
    session_dict["session_id"] = session_dict.pop("id", session.id)

    result = {
        "session": session_dict,
        "answers": answer_list,
        "report": report,
    }

    logger.info(f"[Admin] 获取会话详情成功: session_id={session_id}, question_count={len(answer_list)}")

    return result


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
