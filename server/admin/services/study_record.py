from sqlalchemy import and_, select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateStudyRecordSchema,
    StudyRecordSchema,
    SearchSchema,
)
from common.database import StudyRecord, Student
from common.schema import SearchResultSchema
from utils.time import now


async def create_study_record(db: AsyncSession, params: CreateStudyRecordSchema):
    student = await db.scalar(select(Student).where(Student.id == params.student_id))
    if not student:
        raise ValueError("学生不存在")

    record = StudyRecord(
        student_id=params.student_id,
        textbook_id=params.textbook_id,
        unit_id=params.unit_id,
        knowledge_id=params.knowledge_id,
        question_id=params.question_id,
        is_correct=params.is_correct,
        score=params.score,
        time_spent=params.time_spent,
        study_date=params.study_date or now(),
        create_time=now(),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return StudyRecordSchema.model_validate(record)


async def get_study_record(db: AsyncSession, record_id: int):
    result = await db.scalar(select(StudyRecord).where(StudyRecord.id == record_id))
    if not result:
        return None
    return StudyRecordSchema.model_validate(result)


async def search_study_records(db: AsyncSession, student_id: str, params: SearchSchema):
    query = select(StudyRecord).where(StudyRecord.student_id == student_id)

    conditions = []
    if params.keywords:
        conditions.append(StudyRecord.id.contains(params.keywords))

    if len(conditions) > 0:
        query = query.where(and_(*conditions))

    count_query = select(func.count(StudyRecord.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))

    total = await db.scalar(count_query) or 0

    offset = (params.page - 1) * params.size
    query = query.order_by(
        getattr(StudyRecord, params.sort, StudyRecord.create_time).desc()
        if params.order == "desc"
        else getattr(StudyRecord, params.sort, StudyRecord.create_time).asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[StudyRecordSchema.model_validate(record) for record in result.all()],
    )


async def get_student_study_records(db: AsyncSession, student_id: str, limit: int = 50):
    query = (
        select(StudyRecord)
        .where(StudyRecord.student_id == student_id)
        .order_by(desc(StudyRecord.create_time))
        .limit(limit)
    )

    result = await db.scalars(query)

    return [StudyRecordSchema.model_validate(record) for record in result.all()]


async def get_student_daily_stats(db: AsyncSession, student_id: str, date: str):
    query = select(StudyRecord).where(
        and_(
            StudyRecord.student_id == student_id,
            StudyRecord.study_date >= int(date + "000000"),
            StudyRecord.study_date <= int(date + "235959"),
        )
    )

    result = await db.scalars(query)
    records = result.all()

    total_questions = len(records)
    correct_questions = sum(1 for r in records if r.is_correct == 1)
    total_time = sum(r.time_spent for r in records)

    return {
        "date": date,
        "total_questions": total_questions,
        "correct_questions": correct_questions,
        "accuracy": (correct_questions / total_questions * 100) if total_questions > 0 else 0,
        "total_time": total_time,
    }


async def delete_study_record(db: AsyncSession, record_id: int):
    record = await db.scalar(select(StudyRecord).where(StudyRecord.id == record_id))

    if record:
        await db.delete(record)
        await db.commit()
