from loguru import logger
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from shared.utils.time import now, today
from shared.core.constants import GENERATE_QUESTION_COUNT
from shared.core.database import (
    PracticeSession,
    Question,
    Textbook,
    PracticeAnswer,
    Unit,
)
from generation.question import invoke_generate_workflow


async def create_answer_records(
    db: AsyncSession, session: PracticeSession, questions: list[Question]
):
    """为练习会话创建答题记录"""

    await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session.id))
    await db.flush()  # 确保删除操作完成

    # 批量创建答题记录
    answer_records = []
    for index, question in enumerate(questions):
        answer_record = PracticeAnswer(
            session_id=session.id,
            question_id=question.id,
            student_id=session.student_id,
            question_order=index + 1,
            # 题目相关信息（冗余存储）
            unit_id=question.unit_id,
            knowledge=question.knowledge,
            textbook_id=question.textbook_id,
            status=0,
            time_spent=0,
        )
        answer_records.append(answer_record)

    db.add_all(answer_records)

    logger.info(f"预生成答题记录完成: session_id={session.id}, count={len(answer_records)}")


async def generate_practice_session(
    db: AsyncSession,
    type: str,
    student_id: str,
    textbook_id: int,
    unit_id: int = None,
):
    """
    生成练习会话

    Args:
        db: 数据库会话
        type: 练习类型
        student_id: 学生ID
        textbook_id: 教材ID
        unit_id: 单元ID（可选）
    """

    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

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
    await db.commit()
    await db.refresh(session)

    try:
        count = GENERATE_QUESTION_COUNT[textbook.grade][type]
        if not count:
            raise ValueError("生成数量异常")

        logger.info(f"开始生成练习会话: session_id={session.id}, type={type}")
        questions = await invoke_generate_workflow(
            db=db,
            type=type,
            count=count,
            unit=unit,
            textbook=textbook,
            student_id=student_id,
        )

        await create_answer_records(db, session, questions)

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


@staticmethod
async def regenerate_practice_session(db: AsyncSession, session_id: int):
    # 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))
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

        logger.info(f"开始重新生成练习会话: session_id={session_id}, type={type}")

        unit_id = session.target_id if session.session_type == "unit_practice" else None

        questions = await invoke_generate_workflow(
            db=db,
            type=session.session_type,
            count=session.question_count,
            unit_id=unit_id,
            textbook_id=session.textbook_id,
            student_id=session.student_id,
        )
        await create_answer_records(db, session.id, questions)

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


async def create_daily_practice(*, db: AsyncSession, student_id: str, textbook_id: int, **kwargs):
    """为学生生成日常练习"""
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
        raise ValueError("当天日常练习已存在")

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
            f"找到未完成的日常练习，准备重置: student_id={student_id},session_id={uncompleted_session.id}"
        )

        try:
            # 重置所有答题记录的信息
            answer_records = await db.scalars(
                select(PracticeAnswer).where(PracticeAnswer.session_id == uncompleted_session.id)
            )
            for answer in answer_records.all():
                answer.text_answer = None
                answer.status = 0
                answer.time_spent = 0
                answer.submit_time = None
                answer.audio_answer = None
                # 重置错题相关字段
                answer.correct_answer = None
                answer.analysis = None
                answer.is_corrected = 0
                answer.corrected_time = None

            # 重置进度并更新为当天的日常练习
            uncompleted_session.target_id = current_date
            uncompleted_session.status = 0
            uncompleted_session.answer_count = 0
            uncompleted_session.correct_count = 0
            uncompleted_session.start_time = 0
            uncompleted_session.end_time = None

            await db.commit()

            logger.info(
                f"未完成日常练习已重置为当天:student_id={student_id}, session_id={uncompleted_session.id}"
            )

            return uncompleted_session.id

        except Exception as e:
            await db.rollback()
            logger.error(
                f"重置未完成日常练习失败: student_id={student_id}, session_id={uncompleted_session.id}, error={e}"
            )
            raise ValueError(f"重置未完成日常练习失败: {str(e)}")

    logger.info(f"开始创建日常练习: student_id={student_id}")
    session = await generate_practice_session(
        db=db,
        type="daily_practice",
        student_id=student_id,
        textbook_id=textbook_id,
    )

    return session.id


async def create_unit_practice(
    *, db: AsyncSession, student_id: str, textbook_id: int, unit_id: int, **kwargs
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


async def create_assessment(*, db: AsyncSession, student_id: str, textbook_id: int, **kwargs):
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
