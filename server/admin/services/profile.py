from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from admin.schema import (
    CreateStudentProfileSchema,
    UpdateStudentProfileSchema,
    StudentProfileSchema,
)
from core.database import StudentProfile, Student, PracticeSession
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
    
    # 记录旧的教材ID，用于判断是否需要清除今日练习
    old_textbook_id = profile.current_textbook_id if profile else None
    textbook_changed = False

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
        if params.current_textbook_id is not None and params.current_textbook_id != old_textbook_id:
            profile.current_textbook_id = params.current_textbook_id
            textbook_changed = True
        if params.preferred_subjects is not None:
            profile.preferred_subjects = params.preferred_subjects
        if params.difficulty_preference is not None:
            profile.difficulty_preference = params.difficulty_preference
        profile.update_time = now()

    await db.commit()
    await db.refresh(profile)
    
    # 如果教材发生变化，清除今日练习（删除今天的未完成练习）
    if textbook_changed:
        today = int(datetime.now().strftime("%Y%m%d"))
        result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                    PracticeSession.target_id == today,  # target_id 存储日期
                    PracticeSession.status == "in_progress"
                )
            )
        )
        sessions_to_delete = result.scalars().all()
        for session in sessions_to_delete:
            await db.delete(session)
        await db.commit()

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
