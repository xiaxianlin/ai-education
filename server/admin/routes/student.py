from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateStudentSchema,
    SaveStudentSubjectSchema,
    SearchStudentSchema,
    UpdateStudentSchema,
    CreateStudentProfileSchema,
    UpdateStudentStatsSchema,
    CreateStudyRecordSchema,
)
from common.schema import SearchSchema
from admin.services import student
from common.database import Database


student_router = APIRouter(prefix="/student")


@student_router.post("/")
async def create_student(params: CreateStudentSchema, db: AsyncSession = Database):
    return await student.create_student(db, params)


@student_router.patch("/{id}")
async def update_student(id: str, params: UpdateStudentSchema, db: AsyncSession = Database):
    await student.update_student(db, id, params)


@student_router.delete("/{id}")
async def delete_student(id: str, db: AsyncSession = Database):
    await student.delete_student(db, id)


@student_router.get("/search")
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    return await student.search_student(db, params)


@student_router.post("/{id}/subjects")
async def create_student(id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database):
    await student.save_student_textbook(db, id, params.ids)


@student_router.get("/{id}/subjects")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    return await student.query_student_textbook(db, id)


@student_router.post("/{id}/reset_password")
async def reset_student_password(id: str, db: AsyncSession = Database):
    return await student.reset_student_password(db, id)


@student_router.get("/{id}/profile")
async def get_student_profile(id: str, db: AsyncSession = Database):
    from admin.services import profile
    return await profile.get_student_profile(db, id)


@student_router.post("/{id}/profile")
async def create_or_update_student_profile(
    id: str, params: CreateStudentProfileSchema, db: AsyncSession = Database
):
    from admin.services import profile
    return await profile.create_or_update_student_profile(db, id, params)


@student_router.get("/{id}/stats")
async def get_student_stats(id: str, db: AsyncSession = Database):
    from admin.services import stats
    return await stats.get_student_stats(db, id)


@student_router.post("/{id}/stats")
async def update_student_stats(
    id: str, params: UpdateStudentStatsSchema, db: AsyncSession = Database
):
    from admin.services import stats
    return await stats.update_student_stats(db, id, params)


@student_router.post("/{id}/records")
async def create_study_record(
    id: str, params: CreateStudyRecordSchema, db: AsyncSession = Database
):
    from admin.services import study_record
    return await study_record.create_study_record(db, params)


@student_router.get("/{id}/records")
async def search_study_records(
    id: str, params: SearchSchema = Depends(), db: AsyncSession = Database
):
    from admin.services import study_record
    return await study_record.search_study_records(db, id, params)


@student_router.get("/{id}/wrong_questions")
async def get_student_wrong_questions(
    id: str, mastered: int | None = None, db: AsyncSession = Database
):
    from admin.services import wrong_question
    return await wrong_question.get_student_wrong_questions(db, id, mastered)


@student_router.post("/{id}/wrong_questions/{question_id}/master")
async def mark_question_as_mastered(
    id: str, question_id: int, db: AsyncSession = Database
):
    from admin.services import wrong_question
    return await wrong_question.mark_as_mastered(db, id, question_id)


@student_router.post("/{id}/wrong_questions/{question_id}/unmaster")
async def unmark_question_as_mastered(
    id: str, question_id: int, db: AsyncSession = Database
):
    from admin.services import wrong_question
    return await wrong_question.unmark_as_mastered(db, id, question_id)

