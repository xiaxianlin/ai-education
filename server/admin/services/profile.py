from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateStudentProfileSchema,
    UpdateStudentProfileSchema,
    StudentProfileSchema,
)
from core.database import StudentProfile, Student
from core.schema import ResponseSchema
from shared.utils.time import now


async def get_student_profile(db: AsyncSession, student_id: str):
    result = await db.scalar(
        select(StudentProfile).where(StudentProfile.student_id == student_id)
    )
    if not result:
        return None
    return StudentProfileSchema.model_validate(result)


async def create_or_update_student_profile(
    db: AsyncSession, student_id: str, params: CreateStudentProfileSchema
):
    student = await db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise ValueError("学生不存在")

    profile = await db.scalar(
        select(StudentProfile).where(StudentProfile.student_id == student_id)
    )

    if not profile:
        profile = StudentProfile(
            student_id=student_id,
            current_textbook_id=params.current_textbook_id,
            preferred_subjects=params.preferred_subjects,
            difficulty_preference=params.difficulty_preference,
            create_time=now(),
            update_time=now(),
        )
        db.add(profile)
    else:
        if params.current_textbook_id is not None:
            profile.current_textbook_id = params.current_textbook_id
        if params.preferred_subjects is not None:
            profile.preferred_subjects = params.preferred_subjects
        if params.difficulty_preference is not None:
            profile.difficulty_preference = params.difficulty_preference
        profile.update_time = now()

    await db.commit()
    await db.refresh(profile)

    return StudentProfileSchema.model_validate(profile)


async def update_student_profile(
    db: AsyncSession, student_id: str, params: UpdateStudentProfileSchema
):
    profile = await db.scalar(
        select(StudentProfile).where(StudentProfile.student_id == student_id)
    )

    if not profile:
        raise ValueError("学生配置不存在")

    if params.current_textbook_id is not None:
        profile.current_textbook_id = params.current_textbook_id
    if params.preferred_subjects is not None:
        profile.preferred_subjects = params.preferred_subjects
    if params.difficulty_preference is not None:
        profile.difficulty_preference = params.difficulty_preference

    profile.update_time = now()

    await db.commit()
    await db.refresh(profile)

    return StudentProfileSchema.model_validate(profile)


async def delete_student_profile(db: AsyncSession, student_id: str):
    profile = await db.scalar(
        select(StudentProfile).where(StudentProfile.student_id == student_id)
    )

    if profile:
        await db.delete(profile)
        await db.commit()
