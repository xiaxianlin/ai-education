"""练习管理服务 - Admin端"""

from typing import Optional, List, Dict
from loguru import logger
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from core.database import (
    PracticeSession,
    PracticeAnswer,
    PracticeReport,
    Question,
    StudentTextbook,
    Unit,
)
from core.schema import PracticeSessionSchema, PracticeReportSchema, QuestionSchema
from student.schema import PracticeStatsSchem, PracticeHistorySchema
from shared.utils.time import today
from shared.services.practice import PracticeService


async def get_practice_history(
    db: AsyncSession, student_id: str, practice_type: str, limit: int = 30
) -> List[PracticeHistorySchema]:
    """根据学生ID和练习类型获取最近 30 条练习记录"""
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id, PracticeSession.session_type == practice_type
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
        f"[Admin] 获取练习历史: student_id={student_id}, type={practice_type}, count={len(result)}"
    )
    return result


async def get_daily_practice(db: AsyncSession, student_id: str) -> Optional[PracticeStatsSchem]:
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
        logger.info(f"[Admin] 未找到当天每日练习: student_id={student_id}")
        return None

    logger.info(f"[Admin] 找到当天每日练习: session_id={session.id}, student_id={student_id}")

    return PracticeStatsSchem(
        session_id=session.id,
        status=session.status,
        total_questions=session.question_count,
        completed_questions=session.answer_count,
        right_questions=session.correct_count,
        times=0,  # Admin端不需要统计练习次数
    )


async def create_daily_practice(db: AsyncSession, student_id: str) -> PracticeStatsSchem:
    """为学生生成每日练习"""
    # 检查是否已存在当天的每日练习
    existing = await get_daily_practice(db, student_id)
    if existing:
        logger.warning(
            f"[Admin] 当天每日练习已存在: student_id={student_id}, session_id={existing.session_id}"
        )
        return existing

    # 获取学生当前激活的教材
    active_textbook = await db.scalar(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
    )

    if not active_textbook or not active_textbook.textbook:
        raise ValueError("学生未设置激活教材")

    textbook = active_textbook.textbook

    logger.info(f"[Admin] 开始创建每日练习: student_id={student_id}, textbook_id={textbook.id}")

    try:
        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="daily_practice",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=15,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询刚创建的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        if not session:
            raise ValueError("创建每日练习失败")

        logger.info(f"[Admin] 每日练习创建成功: session_id={session_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(f"[Admin] 创建每日练习失败: student_id={student_id}, error={e}")
        raise ValueError(f"创建每日练习失败: {str(e)}")


async def regenerate_daily_practice(db: AsyncSession, student_id: str) -> PracticeStatsSchem:
    """重新生成学生的每日练习"""
    # 获取当天的每日练习
    current_date = today()
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == current_date,
        )
    )

    if not session:
        raise ValueError("当天每日练习不存在，请先创建")

    # 获取学生当前激活的教材
    active_textbook = await db.scalar(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
    )

    if not active_textbook or not active_textbook.textbook:
        raise ValueError("学生未设置激活教材")

    textbook = active_textbook.textbook

    logger.info(f"[Admin] 开始重新生成每日练习: student_id={student_id}, session_id={session.id}")

    try:
        # 调用重新生成方法
        session_id = await PracticeService.regenerate_practice_session(
            db=db,
            session_id=session.id,
            type="daily_practice",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=15,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询更新后的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        logger.info(f"[Admin] 每日练习重新生成成功: session_id={session_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(f"[Admin] 重新生成每日练习失败: student_id={student_id}, error={e}")
        raise ValueError(f"重新生成每日练习失败: {str(e)}")


async def create_unit_practice(
    db: AsyncSession, student_id: str, unit_id: int
) -> PracticeStatsSchem:
    """为学生生成单元练习"""
    # 获取单元信息
    unit = await db.scalar(
        select(Unit).options(joinedload(Unit.textbook)).where(Unit.id == unit_id)
    )

    if not unit:
        raise ValueError("单元不存在")

    textbook = unit.textbook
    if not textbook:
        raise ValueError("教材信息不存在")

    # 检查是否已存在未完成的单元练习
    existing = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status != 2,  # 未完成的练习
        )
    )

    if existing:
        logger.warning(
            f"[Admin] 单元练习已存在: student_id={student_id}, unit_id={unit_id}, session_id={existing.id}"
        )
        return PracticeStatsSchem(
            session_id=existing.id,
            status=existing.status,
            total_questions=existing.question_count,
            completed_questions=existing.answer_count,
            right_questions=existing.correct_count,
            times=0,
        )

    logger.info(f"[Admin] 开始创建单元练习: student_id={student_id}, unit_id={unit_id}")

    try:
        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="unit_practice",
            subject=textbook.subject,
            grade=textbook.grade,
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

        # 更新 target_id 为 unit_id
        session.target_id = unit_id
        await db.commit()

        logger.info(f"[Admin] 单元练习创建成功: session_id={session_id}, unit_id={unit_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(
            f"[Admin] 创建单元练习失败: student_id={student_id}, unit_id={unit_id}, error={e}"
        )
        raise ValueError(f"创建单元练习失败: {str(e)}")


async def regenerate_unit_practice(
    db: AsyncSession, student_id: str, unit_id: int
) -> PracticeStatsSchem:
    """重新生成学生的单元练习"""
    # 获取未完成的单元练习
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.target_id == unit_id,
            PracticeSession.status != 2,
        )
    )

    if not session:
        raise ValueError("单元练习不存在，请先创建")

    # 获取单元信息
    unit = await db.scalar(
        select(Unit).options(joinedload(Unit.textbook)).where(Unit.id == unit_id)
    )

    if not unit:
        raise ValueError("单元不存在")

    textbook = unit.textbook
    if not textbook:
        raise ValueError("教材信息不存在")

    logger.info(
        f"[Admin] 开始重新生成单元练习: student_id={student_id}, unit_id={unit_id}, session_id={session.id}"
    )

    try:
        # 调用重新生成方法
        session_id = await PracticeService.regenerate_practice_session(
            db=db,
            session_id=session.id,
            type="unit_practice",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=15,
            unit_id=unit_id,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询更新后的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        logger.info(f"[Admin] 单元练习重新生成成功: session_id={session_id}, unit_id={unit_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(
            f"[Admin] 重新生成单元练习失败: student_id={student_id}, unit_id={unit_id}, error={e}"
        )
        raise ValueError(f"重新生成单元练习失败: {str(e)}")


async def create_assessment(db: AsyncSession, student_id: str) -> PracticeStatsSchem:
    """为学生生成能力评估"""
    # 检查是否已存在未完成的能力评估
    existing = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status != 2,  # 未完成的练习
        )
        .order_by(desc(PracticeSession.create_time))
    )

    if existing:
        logger.warning(f"[Admin] 能力评估已存在: student_id={student_id}, session_id={existing.id}")
        return PracticeStatsSchem(
            session_id=existing.id,
            status=existing.status,
            total_questions=existing.question_count,
            completed_questions=existing.answer_count,
            right_questions=existing.correct_count,
            times=0,
        )

    # 获取学生当前激活的教材
    active_textbook = await db.scalar(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
    )

    if not active_textbook or not active_textbook.textbook:
        raise ValueError("学生未设置激活教材")

    textbook = active_textbook.textbook

    logger.info(f"[Admin] 开始创建能力评估: student_id={student_id}, textbook_id={textbook.id}")

    try:
        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="assessment",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=0,  # 能力评估不需要复习题
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询刚创建的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        if not session:
            raise ValueError("创建能力评估失败")

        logger.info(f"[Admin] 能力评估创建成功: session_id={session_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(f"[Admin] 创建能力评估失败: student_id={student_id}, error={e}")
        raise ValueError(f"创建能力评估失败: {str(e)}")


async def regenerate_assessment(db: AsyncSession, student_id: str) -> PracticeStatsSchem:
    """重新生成学生的能力评估"""
    # 获取未完成的能力评估
    session = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status != 2,
        )
        .order_by(desc(PracticeSession.create_time))
    )

    if not session:
        raise ValueError("能力评估不存在，请先创建")

    # 获取学生当前激活的教材
    active_textbook = await db.scalar(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
    )

    if not active_textbook or not active_textbook.textbook:
        raise ValueError("学生未设置激活教材")

    textbook = active_textbook.textbook

    logger.info(f"[Admin] 开始重新生成能力评估: student_id={student_id}, session_id={session.id}")

    try:
        # 调用重新生成方法
        session_id = await PracticeService.regenerate_practice_session(
            db=db,
            session_id=session.id,
            type="assessment",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=0,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询更新后的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        logger.info(f"[Admin] 能力评估重新生成成功: session_id={session_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=0,
        )

    except Exception as e:
        logger.error(f"[Admin] 重新生成能力评估失败: student_id={student_id}, error={e}")
        raise ValueError(f"重新生成能力评估失败: {str(e)}")


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
        select(PracticeAnswer)
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
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
            "is_correct": answer.is_correct,
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
        report_obj = await db.scalar(
            select(PracticeReport).where(PracticeReport.session_id == session_id)
        )
        if report_obj:
            report = PracticeReportSchema.model_validate(report_obj).model_dump()

    # 构建返回结果
    result = {
        "session": PracticeSessionSchema.model_validate(session).model_dump(),
        "answers": answer_list,
        "report": report,
    }

    logger.info(
        f"[Admin] 获取会话详情成功: session_id={session_id}, question_count={len(answer_list)}"
    )

    return result
