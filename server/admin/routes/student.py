from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from admin.schema import (
    CreateStudentSchema,
    SaveStudentSubjectSchema,
    SearchStudentSchema,
    UpdateStudentSchema,
    CreateStudentProfileSchema,
    UpdateStudentStatsSchema,
    CreateStudyRecordSchema,
)
from core.schema import SearchSchema
from admin.services import student, profile, stats, study_record, wrong_question
from student.services.daily_practice import DailyPracticeService
from student.services.unit_practice import UnitPracticeService
from student.services.assessment import AssessmentService
from core.database import Database, DailyPracticeSession, UnitPracticeSession, AssessmentTest


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


@student_router.get("/{id}")
async def get_student_detail(id: str, db: AsyncSession = Database):
    try:
        return await student.get_student_detail(db, id)
    except ValueError as exc:  # pragma: no cover - simple pass-through
        raise HTTPException(status_code=404, detail=str(exc))


@student_router.post("/{id}/subjects")
async def save_student_textbook(id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database):
    await student.save_student_textbook(db, id, params.ids)


@student_router.get("/{id}/subjects")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    return await student.query_student_textbook(db, id)


@student_router.post("/{id}/reset_password")
async def reset_student_password(id: str, db: AsyncSession = Database):
    return await student.reset_student_password(db, id)


@student_router.get("/{id}/profile")
async def get_student_profile(id: str, db: AsyncSession = Database):
    return await profile.get_student_profile(db, id)


@student_router.post("/{id}/profile")
async def create_or_update_student_profile(
    id: str, params: CreateStudentProfileSchema, db: AsyncSession = Database
):
    return await profile.create_or_update_student_profile(db, id, params)


@student_router.get("/{id}/stats")
async def get_student_stats(id: str, db: AsyncSession = Database):
    return await stats.get_student_stats(db, id)


@student_router.post("/{id}/stats")
async def update_student_stats(
    id: str, params: UpdateStudentStatsSchema, db: AsyncSession = Database
):
    return await stats.update_student_stats(db, id, params)


@student_router.post("/{id}/records")
async def create_study_record(
    id: str, params: CreateStudyRecordSchema, db: AsyncSession = Database
):
    return await study_record.create_study_record(db, params)


@student_router.get("/{id}/records")
async def search_study_records(
    id: str, params: SearchSchema = Depends(), db: AsyncSession = Database
):
    return await study_record.search_study_records(db, id, params)


@student_router.get("/{id}/wrong_questions")
async def get_student_wrong_questions(
    id: str, mastered: int | None = None, db: AsyncSession = Database
):
    return await wrong_question.get_student_wrong_questions(db, id, mastered)


@student_router.post("/{id}/wrong_questions/{question_id}/master")
async def mark_question_as_mastered(
    id: str, question_id: int, db: AsyncSession = Database
):
    return await wrong_question.mark_as_mastered(db, id, question_id)


@student_router.post("/{id}/wrong_questions/{question_id}/unmaster")
async def unmark_question_as_mastered(
    id: str, question_id: int, db: AsyncSession = Database
):
    return await wrong_question.unmark_as_mastered(db, id, question_id)


@student_router.get("/{id}/daily_practices")
async def get_student_daily_practices(
    id: str, limit: int = 30, db: AsyncSession = Database
):
    """获取学生的今日练习列表"""
    history = await DailyPracticeService.get_practice_history(db, id, limit)
    return {
        "data": history,
        "total": len(history),
    }


@student_router.post("/{id}/daily_practices/generate")
async def generate_student_daily_practice(
    id: str, db: AsyncSession = Database
):
    """为学生生成今日练习（30道题）"""
    result = await DailyPracticeService.check_or_create_today_practice(db, id)
    return result


@student_router.get("/{id}/daily_practices/{session_id}")
async def get_daily_practice_detail(
    id: str, session_id: int, db: AsyncSession = Database
):
    """获取今日练习详情（包含问题列表）"""
    session_data = await DailyPracticeService.get_practice_session(
        db, session_id, id
    )
    if not session_data:
        raise ValueError("练习会话不存在")
    return session_data


@student_router.delete("/{id}/daily_practices/{session_id}")
async def delete_daily_practice(
    id: str, session_id: int, db: AsyncSession = Database
):
    """删除日常练习会话"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(DailyPracticeSession).where(
            and_(
                DailyPracticeSession.id == session_id,
                DailyPracticeSession.student_id == id,
            )
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="练习会话不存在")
    
    # 删除会话
    await db.delete(session)
    await db.commit()
    
    return {"message": "删除成功"}


@student_router.post("/{id}/daily_practices/{session_id}/regenerate")
async def regenerate_daily_practice(
    id: str, session_id: int, db: AsyncSession = Database
):
    """重新生成今日练习（重置全部进度）"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(DailyPracticeSession).where(
            and_(
                DailyPracticeSession.id == session_id,
                DailyPracticeSession.student_id == id,
            )
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="练习会话不存在")
    
    # 重置进度
    session.status = "in_progress"
    session.answers = "{}"
    session.correct_questions = 0
    session.total_time = 0
    session.score = 0
    from shared.utils.time import now
    session.update_time = now()
    
    await db.commit()
    
    return {"message": "重新生成成功", "session": session}


@student_router.get("/{id}/unit_practices")
async def get_student_unit_practices(
    id: str, limit: int = 30, db: AsyncSession = Database
):
    """获取学生的单元练习记录列表"""
    from sqlalchemy import desc
    from admin.schema import UnitPracticeSessionSchema
    
    result = await db.execute(
        select(UnitPracticeSession)
        .where(UnitPracticeSession.student_id == id)
        .order_by(desc(UnitPracticeSession.create_time))
        .limit(limit)
    )
    sessions = result.scalars().all()
    
    return {
        "data": [UnitPracticeSessionSchema.model_validate(session) for session in sessions],
        "total": len(sessions),
    }


@student_router.get("/{id}/unit_practices/{session_id}")
async def get_unit_practice_detail(
    id: str, session_id: int, db: AsyncSession = Database
):
    """获取单元练习详情（包含问题列表）"""
    session_data = await UnitPracticeService.get_practice_session(
        db, session_id, id
    )
    if not session_data:
        raise HTTPException(status_code=404, detail="练习会话不存在")
    return session_data


@student_router.post("/{id}/unit_practices/{session_id}/regenerate")
async def regenerate_unit_practice(
    id: str, session_id: int, db: AsyncSession = Database
):
    """重新生成单元练习（重置全部进度）"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(UnitPracticeSession).where(
            and_(
                UnitPracticeSession.id == session_id,
                UnitPracticeSession.student_id == id,
            )
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="练习会话不存在")
    
    # 重置进度
    session.status = "in_progress"
    session.answers = "{}"
    from shared.utils.time import now
    session.update_time = now()
    
    await db.commit()
    
    return {"message": "重新生成成功", "session": session}


@student_router.get("/{id}/assessments")
async def get_student_assessments(
    id: str, limit: int = 30, db: AsyncSession = Database
):
    """获取学生的能力评估记录列表"""
    from sqlalchemy import desc
    from admin.schema import AssessmentTestSchema
    
    result = await db.execute(
        select(AssessmentTest)
        .where(AssessmentTest.student_id == id)
        .order_by(desc(AssessmentTest.create_time))
        .limit(limit)
    )
    assessments = result.scalars().all()
    
    return {
        "data": [AssessmentTestSchema.model_validate(assessment) for assessment in assessments],
        "total": len(assessments),
    }


@student_router.get("/{id}/assessments/{assessment_id}")
async def get_assessment_detail(
    id: str, assessment_id: int, db: AsyncSession = Database
):
    """获取能力评测详情（包含问题列表）"""
    from sqlalchemy import select, and_
    from core.database import AssessmentQuestion, Question
    from admin.schema import AssessmentTestSchema
    import json
    
    # 获取评测会话
    result = await db.execute(
        select(AssessmentTest).where(
            and_(
                AssessmentTest.id == assessment_id,
                AssessmentTest.student_id == id,
            )
        )
    )
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="评测不存在")
    
    # 获取题目列表
    questions_result = await db.execute(
        select(AssessmentQuestion)
        .where(AssessmentQuestion.assessment_id == assessment_id)
        .order_by(AssessmentQuestion.question_order)
    )
    assessment_questions = questions_result.scalars().all()
    
    # 获取题目详情
    question_ids = [aq.question_id for aq in assessment_questions]
    if question_ids:
        questions_result = await db.execute(
            select(Question).where(Question.id.in_(question_ids))
        )
        questions_dict = {q.id: q for q in questions_result.scalars().all()}
        
        questions = []
        for aq in assessment_questions:
            q = questions_dict.get(aq.question_id)
            if q:
                questions.append({
                    "id": q.id,
                    "type": q.type,
                    "subtype": q.subtype,
                    "content": q.content,
                    "options": q.options,
                    "difficulty": q.difficulty,
                    "knowledge": q.knowledge,
                    "resource": q.resource,
                    "resource_type": q.resource_type,
                    "resource_content": q.resource_content,
                    "answer": q.answer,
                    "is_correct": aq.is_correct == 1,
                })
    else:
        questions = []
    
    return {
        "session": AssessmentTestSchema.model_validate(test),
        "questions": questions,
    }


@student_router.post("/{id}/assessments/{assessment_id}/reset")
async def reset_assessment(
    id: str, assessment_id: int, db: AsyncSession = Database
):
    """重置能力评估（重置全部进度）"""
    # 验证评测是否存在且属于该学生
    result = await db.execute(
        select(AssessmentTest).where(
            and_(
                AssessmentTest.id == assessment_id,
                AssessmentTest.student_id == id,
            )
        )
    )
    test = result.scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="评测不存在")
    
    # 重置进度
    test.status = "in_progress"
    test.answered_count = 0
    test.current_ability = 0.0
    test.confidence = 0.0
    test.overall_score = 0.0
    test.ability_level = ""
    from shared.utils.time import now
    test.update_time = now()
    
    # 删除已答题目记录
    from core.database import AssessmentQuestion
    questions_result = await db.execute(
        select(AssessmentQuestion).where(
            AssessmentQuestion.assessment_id == assessment_id
        )
    )
    assessment_questions = questions_result.scalars().all()
    for aq in assessment_questions:
        await db.delete(aq)
    
    await db.commit()
    
    return {"message": "重置成功", "assessment": test}

