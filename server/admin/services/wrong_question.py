from sqlalchemy import and_, select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from core.database import StudentWrongRecord, Question, PracticeSession


class WrongRecordSchema:
    def __init__(self, wrong_record, question=None, session=None):
        self.id = wrong_record.id
        self.student_id = wrong_record.student_id
        self.question_id = wrong_record.question_id
        self.session_id = wrong_record.session_id
        self.unit_id = wrong_record.unit_id
        self.knowledge = wrong_record.knowledge
        self.textbook_id = wrong_record.textbook_id
        self.user_answer = wrong_record.user_answer
        self.correct_answer = wrong_record.correct_answer
        self.time_spent = wrong_record.time_spent
        self.is_corrected = wrong_record.is_corrected
        self.corrected_time = wrong_record.corrected_time
        self.create_time = wrong_record.create_time
        self.update_time = wrong_record.update_time
        self.question_content = question.content if question else ""
        self.session_type = session.session_type if session else ""
        self.unit_name = session.unit.name if session and session.unit else ""


async def get_student_wrong_records(
    db: AsyncSession,
    student_id: str,
    is_corrected: int = None,
    session_type: str = None,
    limit: int = 50,
    offset: int = 0,
):
    """获取学生的错题记录"""
    query = (
        select(StudentWrongRecord)
        .options(joinedload(StudentWrongRecord.session))
        .where(StudentWrongRecord.student_id == student_id)
    )

    if is_corrected is not None:
        query = query.where(StudentWrongRecord.is_corrected == is_corrected)

    if session_type:
        query = query.join(PracticeSession).where(PracticeSession.session_type == session_type)

    query = query.order_by(desc(StudentWrongRecord.create_time)).limit(limit).offset(offset)

    result = await db.scalars(query)
    wrong_records = result.all()

    output = []
    for record in wrong_records:
        question = await db.scalar(select(Question).where(Question.id == record.question_id))
        output.append(WrongRecordSchema(record, question, record.session))

    return output


async def mark_wrong_record_corrected(db: AsyncSession, record_id: int, student_id: str):
    """标记错题记录为已订正"""
    wrong_record = await db.scalar(
        select(StudentWrongRecord).where(
            and_(
                StudentWrongRecord.id == record_id,
                StudentWrongRecord.student_id == student_id,
            )
        )
    )

    if not wrong_record:
        raise ValueError("错题记录不存在")

    from shared.utils.time import now

    wrong_record.is_corrected = 1
    wrong_record.corrected_time = now()
    wrong_record.update_time = now()

    await db.commit()
    await db.refresh(wrong_record)

    return wrong_record


async def get_wrong_record_stats(db: AsyncSession, student_id: str):
    """获取学生的错题统计信息"""
    # 总错题记录数
    total_wrong = await db.scalar(
        select(func.count(StudentWrongRecord.id)).where(StudentWrongRecord.student_id == student_id)
    )

    # 已订正的错题数
    corrected_wrong = await db.scalar(
        select(func.count(StudentWrongRecord.id)).where(
            and_(
                StudentWrongRecord.student_id == student_id,
                StudentWrongRecord.is_corrected == 1,
            )
        )
    )

    # 未订正的错题数
    uncorrected_wrong = total_wrong - corrected_wrong

    # 按知识点统计
    knowledge_stats = await db.execute(
        select(StudentWrongRecord.knowledge, func.count(StudentWrongRecord.id))
        .where(
            and_(
                StudentWrongRecord.student_id == student_id,
                StudentWrongRecord.knowledge.isnot(None),
            )
        )
        .group_by(StudentWrongRecord.knowledge)
    )

    knowledge_breakdown = {row[0]: row[1] for row in knowledge_stats.all()}

    return {
        "total_wrong": total_wrong,
        "corrected_wrong": corrected_wrong,
        "uncorrected_wrong": uncorrected_wrong,
        "knowledge_breakdown": knowledge_breakdown,
    }


async def get_wrong_records_by_question(db: AsyncSession, student_id: str, question_id: int):
    """获取特定题目的错题记录"""
    result = await db.scalars(
        select(StudentWrongRecord)
        .options(joinedload(StudentWrongRecord.session))
        .where(
            and_(
                StudentWrongRecord.student_id == student_id,
                StudentWrongRecord.question_id == question_id,
            )
        )
        .order_by(desc(StudentWrongRecord.create_time))
    )

    wrong_records = result.all()
    question = await db.scalar(select(Question).where(Question.id == question_id))

    output = []
    for record in wrong_records:
        output.append(WrongRecordSchema(record, question, record.session))

    return output
