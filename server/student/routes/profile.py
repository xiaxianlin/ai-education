from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from student.services import auth
from student.services import student as student_service
from admin.services import profile, stats, study_record, wrong_question
from admin.services import unit as unit_service
from admin.services import knowledge as knowledge_service
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
    profile_data = await profile.get_student_profile(db, student.id)
    return profile_data


@profile_router.post("/")
async def update_profile(
    params: CreateStudentProfileSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    profile_data = await profile.create_or_update_student_profile(db, student.id, params)
    return profile_data


@profile_router.get("/stats")
async def get_stats(student=Depends(get_current_student), db: AsyncSession = Database):
    stats_data = await stats.get_student_stats(db, student.id)
    return stats_data


@profile_router.get("/wrong_questions")
async def get_wrong_questions(
    mastered: int | None = None,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    wrong_questions = await wrong_question.get_student_wrong_questions(
        db, student.id, mastered
    )
    return wrong_questions


@profile_router.post("/wrong_questions/{question_id}/master")
async def mark_question_as_mastered(
    question_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    await wrong_question.mark_as_mastered(db, student.id, question_id)
    return {"success": True}


@profile_router.post("/wrong_questions/{question_id}/unmaster")
async def unmark_question_as_mastered(
    question_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    await wrong_question.unmark_as_mastered(db, student.id, question_id)
    return {"success": True}


@profile_router.get("/records")
async def get_records(
    student=Depends(get_current_student), db: AsyncSession = Database
):
    records = await study_record.get_student_study_records(db, student.id, 50)
    return records


@profile_router.post("/records")
async def create_record(
    params: CreateStudyRecordSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    params.student_id = student.id
    record = await study_record.create_study_record(db, params)

    await stats.increment_student_stats(db, student.id, params.is_correct == 1)

    if params.is_correct == 0 and params.question_id:
        await wrong_question.add_wrong_question(db, student.id, params.question_id)

    return record


@profile_router.get("/textbooks")
async def get_textbooks(
    student=Depends(get_current_student), db: AsyncSession = Database
):
    textbooks = await student_service.query_student_textbook(db, student.id)
    return textbooks


@profile_router.get("/units")
async def get_units(
    textbook_id: int | None = None,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """获取单元列表，如果指定了textbook_id则获取该教材的单元，否则获取当前教材的单元"""
    # 如果没有指定textbook_id，从profile中获取当前教材
    if not textbook_id:
        profile_data = await profile.get_student_profile(db, student.id)
        if not profile_data or not profile_data.current_textbook_id:
            return []
        textbook_id = profile_data.current_textbook_id

    # 验证该教材是否属于该学生
    textbooks = await student_service.query_student_textbook(db, student.id)
    if not any(t.id == textbook_id for t in textbooks):
        return []

    units = await unit_service.query_unit_by_textbook(db, textbook_id)

    units_with_knowledge: list[dict] = []
    for unit in units:
        knowledge_list = await knowledge_service.query_knowledge_by_unit(db, unit.id)
        unit_dict = unit.model_dump()
        unit_dict["knowledges"] = [
            knowledge.model_dump() for knowledge in knowledge_list if knowledge.status == 1
        ]
        units_with_knowledge.append(unit_dict)

    return units_with_knowledge

