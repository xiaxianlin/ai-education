from sqlalchemy import and_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    UpdateStudentStatsSchema,
    StudentStatsSchema,
)
from core.database import StudentStats, Student, StudyRecord
from core.schema import ResponseSchema
from shared.utils.time import now


async def get_student_stats(db: AsyncSession, student_id: str):
    result = await db.scalar(
        select(StudentStats).where(StudentStats.student_id == student_id)
    )
    if not result:
        return None
    return StudentStatsSchema.model_validate(result)


async def create_student_stats(db: AsyncSession, student_id: str):
    student = await db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise ValueError("学生不存在")

    stats = StudentStats(
        student_id=student_id,
        total_practice=0,
        total_questions=0,
        correct_questions=0,
        accuracy=0.0,
        current_streak=0,
        max_streak=0,
        last_study_date=0,
        total_study_duration=0,
        achievements="",
        create_time=now(),
        update_time=now(),
    )
    db.add(stats)
    await db.commit()
    await db.refresh(stats)

    return StudentStatsSchema.model_validate(stats)


async def update_student_stats(
    db: AsyncSession, student_id: str, params: UpdateStudentStatsSchema
):
    stats = await db.scalar(
        select(StudentStats).where(StudentStats.student_id == student_id)
    )

    if not stats:
        stats = await create_student_stats(db, student_id)

    if params.total_practice is not None:
        stats.total_practice = params.total_practice
    if params.total_questions is not None:
        stats.total_questions = params.total_questions
    if params.correct_questions is not None:
        stats.correct_questions = params.correct_questions
        stats.accuracy = (
            (stats.correct_questions / stats.total_questions * 100)
            if stats.total_questions > 0
            else 0.0
        )
    if params.current_streak is not None:
        stats.current_streak = params.current_streak
    if params.max_streak is not None:
        stats.max_streak = params.max_streak
    if params.last_study_date is not None:
        stats.last_study_date = params.last_study_date
    if params.total_study_duration is not None:
        stats.total_study_duration = params.total_study_duration
    if params.achievements is not None:
        stats.achievements = params.achievements

    stats.update_time = now()

    await db.commit()
    await db.refresh(stats)

    return StudentStatsSchema.model_validate(stats)


async def increment_student_stats(db: AsyncSession, student_id: str, is_correct: bool = False):
    stats = await db.scalar(
        select(StudentStats).where(StudentStats.student_id == student_id)
    )

    if not stats:
        stats = await create_student_stats(db, student_id)

    current_date = now()
    current_date_str = str(current_date)[:8]
    last_date_str = str(stats.last_study_date)[:8] if stats.last_study_date else ""

    stats.total_questions += 1
    if is_correct:
        stats.correct_questions += 1

    stats.accuracy = (
        (stats.correct_questions / stats.total_questions * 100)
        if stats.total_questions > 0
        else 0.0
    )

    if current_date_str != last_date_str:
        if stats.last_study_date == 0:
            stats.current_streak = 1
        else:
            current_date_int = int(current_date_str)
            last_date_int = int(last_date_str)

            if current_date_int - last_date_int == 1:
                stats.current_streak += 1
            else:
                stats.current_streak = 1

        if stats.current_streak > stats.max_streak:
            stats.max_streak = stats.current_streak

        stats.last_study_date = current_date

    stats.update_time = now()

    await db.commit()
    await db.refresh(stats)

    return StudentStatsSchema.model_validate(stats)


async def delete_student_stats(db: AsyncSession, student_id: str):
    stats = await db.scalar(
        select(StudentStats).where(StudentStats.student_id == student_id)
    )

    if stats:
        await db.delete(stats)
        await db.commit()
