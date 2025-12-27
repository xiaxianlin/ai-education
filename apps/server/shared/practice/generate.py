import pendulum
from loguru import logger
from shared.core.database import (
    Practice,
    PracticeSession,
    PracticeSessionAnswer,
    Textbook,
    Unit,
)
from shared.core.database import Question, QuestionType
from shared.generation import invoke_question_generation_workflow
from shared.worker import Executor, submit_task
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .session import get_assess_practices, get_daily_practices, get_unit_practices


def _compose_parameters(
    practice: Practice, textbook: Textbook, student_id: str, unit_id: int | None = None
):
    """组合练习参数"""

    generate_count = 15
    recall_count = 0

    for parameter in practice.parameters:
        value = parameter.get("value", {})
        if parameter["key"] == "generate_count":
            generate_count = value.get(textbook.grade, 15)
        if parameter["key"] == "recall_count":
            recall_count = value.get(textbook.grade, 0)

    return {
        "student_id": student_id,
        "textbook_id": textbook.id,
        "unit_id": unit_id,
        "generate_count": generate_count,
        "recall_count": recall_count,
        "grade": textbook.grade,
        "subject": textbook.subject,
    }


async def _check_daily_practice(db: AsyncSession, student_id: str, textbook_id: int):
    """检查当天日常练习是否存在，如果存在，则废弃之前的练习"""

    sessions = await get_daily_practices(db, student_id, textbook_id)
    if len(sessions) > 0:
        raise ValueError("当天日常练习已存在")

    db.execute(
        update(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.practice_slug == "daily_practice",
            PracticeSession.status != 2,
        )
        .values(status=3)
    )
    await db.commit()


async def _check_unit_practice(db: AsyncSession, student_id: str, textbook_id: int, unit_id: int):
    sessions = await get_unit_practices(db, student_id, textbook_id, unit_id)
    if len(sessions) > 0:
        raise ValueError("单元练习已存在")

    db.execute(
        update(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.unit_id == unit_id,
            PracticeSession.practice_slug == "unit_practice",
            PracticeSession.status != 2,
        )
        .values(status=3)
    )
    await db.commit()


async def _check_assess_practice(db: AsyncSession, student_id: str, textbook_id: int):
    """检查当天能力评测是否存在，如果存在，则废弃之前的练习"""

    sessions = await get_assess_practices(db, student_id, textbook_id)
    if len(sessions) > 0:
        raise ValueError("综合评估练习已存在")

    db.execute(
        update(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.practice_slug == "assess_practice",
            PracticeSession.status != 2,
        )
        .values(status=3)
    )
    await db.commit()


async def _prepare_answer_records(
    db: AsyncSession, session: PracticeSession, questions: list[Question]
):
    """为练习会话创建答题记录"""

    await db.execute(
        delete(PracticeSessionAnswer).where(PracticeSessionAnswer.session_id == session.id)
    )
    await db.flush()  # 确保删除操作完成

    # 批量创建答题记录
    answer_records = []
    for index, question in enumerate(questions):
        # V2: get knowledge from knowledgePoints list
        knowledge = question.knowledge_points[0] if question.knowledge_points else None
        answer_record = PracticeSessionAnswer(
            session_id=session.id,
            question_id=question.id,
            student_id=session.student_id,
            question_order=index + 1,
            # 题目相关信息（冗余存储）
            unit_id=question.unit_id,
            knowledge=knowledge,
            textbook_id=question.textbook_id,
            status=0,
            time_spent=0,
        )
        answer_records.append(answer_record)

    db.add_all(answer_records)

    logger.info(f"预生成答题记录完成: session_id={session.id}, count={len(answer_records)}")


async def _get_question_types(db: AsyncSession, subject: str, grade: int):
    """获取题型列表 (V2)"""
    result = await db.scalars(select(QuestionType).where(QuestionType.subject == subject))
    data = {}
    for item in result.all():
        # V2: scene is replaced by interaction_type
        scene = item.interaction_type or "default"
        types = data.get(scene, [])
        types.append(
            {
                "name": item.name,
                "description": item.description,
                "resource_type": None,  # V2 uses resources differently
            }
        )
        data[scene] = types
    return data


async def execute_generate_practice_session(db: AsyncSession, session_id: int):
    """执行练习会话生成"""

    start_time = pendulum.now()

    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))
    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    textbook = await db.scalar(select(Textbook).where(Textbook.id == session.textbook_id))
    if not textbook:
        raise ValueError(f"教材不存在: textbook_id={session.textbook_id}")

    units = (await db.scalars(select(Unit).where(Unit.textbook_id == textbook.id))).all()
    question_types = await _get_question_types(db, textbook.subject, textbook.grade)

    questions = await invoke_question_generation_workflow(
        db=db,
        session=session,
        textbook=textbook,
        units=units,
        question_types=question_types,
    )

    await _prepare_answer_records(db, session, questions)

    end_time = pendulum.now()

    session.question_count = len(questions)
    session.generate_status = 2
    session.generate_time = int(start_time.diff(end_time).total_seconds())
    await db.commit()

    logger.info(
        f"练习会话生成完成: session_id={session.id}, question_count={session.question_count}, elapsed_time={session.generate_time}s"
    )


async def create_practice_session(
    *,
    db: AsyncSession,
    practice_slug: str,
    student_id: str,
    textbook_id: int,
    unit_id: int | None = None,
    immediately: bool = False,
) -> PracticeSession:
    """生成练习会话"""
    logger.info(
        f"开始生成练习会话 | practice_slug={practice_slug} | student_id={student_id} | textbook_id={textbook_id} | unit_id={unit_id} | immediately={immediately}"
    )

    # 检查教材是否存在
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError(f"教材不存在: textbook_id={textbook_id}")

    # 检查练习是否存在
    practice = await db.scalar(select(Practice).where(Practice.slug == practice_slug))
    if not practice:
        raise ValueError(f"练习不存在: slug={practice_slug}")

    if practice.slug == "daily_practice":
        await _check_daily_practice(db, student_id, textbook_id)

    if practice.slug == "unit_practice":
        await _check_unit_practice(db, student_id, textbook_id, unit_id)

    if practice.slug == "assess_practice":
        await _check_assess_practice(db, student_id, textbook_id)

    # 生成开始前，先创建会话记录
    session = PracticeSession(
        student_id=student_id,
        practice_id=practice.id,
        practice_slug=practice.slug,
        parameters=_compose_parameters(practice, textbook, student_id, unit_id),
        generate_status=1,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    try:
        if immediately:
            await execute_generate_practice_session(db, session.id)
            logger.info(
                f"练习会话生成完成: session_id={session.id}, question_count={session.question_count}"
            )
        else:
            await submit_task(Executor.generate_practice_task, [session.id])
            logger.info(f"练习会话生成任务提交完成: session_id={session.id}")

        return session.id
    except Exception as e:
        await db.delete(session)
        await db.commit()
        logger.error(f"生成练习会话失败: session_id={session.id}, error={e}")
        raise ValueError(f"会话生成失败: session_id={session.id}, error={str(e)}")
