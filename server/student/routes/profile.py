from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from common.database import Database
from student.services import auth
from admin.services import profile, stats, study_record, wrong_question
from admin.schema import (
    CreateStudentProfileSchema,
    UpdateStudentStatsSchema,
    CreateStudyRecordSchema,
)

profile_router = APIRouter(prefix="/profile")


async def get_current_student(request: Request, db: AsyncSession = Database):
    student = request.state.student
    if not student:
        raise ValueError("未登录")
    return student


@profile_router.get("/")
async def get_profile(student=Depends(get_current_student), db: AsyncSession = Database):
    profile_data = await profile.get_student_profile(db, student["id"])
    return profile_data


@profile_router.post("/")
async def update_profile(
    params: CreateStudentProfileSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    profile_data = await profile.create_or_update_student_profile(db, student["id"], params)
    return profile_data


@profile_router.get("/stats")
async def get_stats(student=Depends(get_current_student), db: AsyncSession = Database):
    stats_data = await stats.get_student_stats(db, student["id"])
    return stats_data


@profile_router.get("/wrong_questions")
async def get_wrong_questions(
    mastered: int | None = None,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    wrong_questions = await wrong_question.get_student_wrong_questions(
        db, student["id"], mastered
    )
    return wrong_questions


@profile_router.post("/wrong_questions/{question_id}/master")
async def mark_question_as_mastered(
    question_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    await wrong_question.mark_as_mastered(db, student["id"], question_id)
    return {"success": True}


@profile_router.post("/wrong_questions/{question_id}/unmaster")
async def unmark_question_as_mastered(
    question_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    await wrong_question.unmark_as_mastered(db, student["id"], question_id)
    return {"success": True}


@profile_router.get("/records")
async def get_records(
    student=Depends(get_current_student), db: AsyncSession = Database
):
    records = await study_record.get_student_study_records(db, student["id"], 50)
    return records


@profile_router.post("/records")
async def create_record(
    params: CreateStudyRecordSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    params.student_id = student["id"]
    record = await study_record.create_study_record(db, params)

    await stats.increment_student_stats(db, student["id"], params.is_correct == 1)

    if params.is_correct == 0 and params.question_id:
        await wrong_question.add_wrong_question(db, student["id"], params.question_id)

    return record

