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
    PracticeSessionSchema,
)
from core.schema import SearchSchema
from admin.services import student, profile, stats, wrong_question
from student.services.practice import PracticeService
from core.database import Database, PracticeSession, PracticeAnswer


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
async def save_student_textbook(
    id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database
):
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


@student_router.get("/{id}/practice_statistics")
async def get_practice_statistics(
    id: str, session_type: str = None, db: AsyncSession = Database
):
    """获取学生的练习统计信息"""
    return await stats.get_practice_statistics(db, id, session_type)


@student_router.get("/{id}/wrong_questions")
async def get_student_wrong_questions(
    id: str, mastered: int | None = None, db: AsyncSession = Database
):
    return await wrong_question.get_student_wrong_questions(db, id, mastered)


@student_router.post("/{id}/wrong_questions/{question_id}/master")
async def mark_question_as_mastered(id: str, question_id: int, db: AsyncSession = Database):
    return await wrong_question.mark_as_mastered(db, id, question_id)


@student_router.post("/{id}/wrong_questions/{question_id}/unmaster")
async def unmark_question_as_mastered(id: str, question_id: int, db: AsyncSession = Database):
    return await wrong_question.unmark_as_mastered(db, id, question_id)


@student_router.get("/{id}/daily_practices")
async def get_student_daily_practices(id: str, limit: int = 30, db: AsyncSession = Database):
    """获取学生的今日练习列表"""
    history = await PracticeService.get_practice_history(db, id, limit)
    return {
        "data": history,
        "total": len(history),
    }


@student_router.post("/{id}/daily_practices/generate")
async def generate_student_daily_practice(id: str, db: AsyncSession = Database):
    """为学生生成今日练习（30道题）"""
    result = await PracticeService.check_or_create_today_practice(db, id)
    return result


@student_router.get("/{id}/daily_practices/{session_id}")
async def get_daily_practice_detail(id: str, session_id: int, db: AsyncSession = Database):
    """获取今日练习详情（包含问题列表）"""
    session_data = await PracticeService.get_practice_session(db, session_id, id)
    if not session_data:
        raise ValueError("练习会话不存在")
    return session_data


@student_router.delete("/{id}/daily_practices/{session_id}")
async def delete_daily_practice(id: str, session_id: int, db: AsyncSession = Database):
    """删除日常练习会话"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.id == session_id,
                PracticeSession.student_id == id,
                PracticeSession.session_type == "daily",
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
async def regenerate_daily_practice(id: str, session_id: int, db: AsyncSession = Database):
    """重新生成今日练习（重置全部进度）"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.id == session_id,
                PracticeSession.student_id == id,
                PracticeSession.session_type == "daily",
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
async def get_student_unit_practices(id: str, limit: int = 30, db: AsyncSession = Database):
    """获取学生的单元练习记录列表"""
    from sqlalchemy import desc
    from admin.schema import UnitPracticeSessionSchema

    result = await db.execute(
        select(PracticeSession)
        .where(
            and_(
                PracticeSession.student_id == id,
                PracticeSession.session_type == "unit",
            )
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )
    sessions = result.scalars().all()

    return {
        "data": [UnitPracticeSessionSchema.model_validate(session) for session in sessions],
        "total": len(sessions),
    }


@student_router.get("/{id}/unit_practices/{session_id}")
async def get_unit_practice_detail(id: str, session_id: int, db: AsyncSession = Database):
    """获取单元练习详情（包含问题列表）"""
    session_data = await PracticeService.get_practice_session(db, session_id, id)
    if not session_data:
        raise HTTPException(status_code=404, detail="练习会话不存在")
    return session_data


@student_router.post("/{id}/unit_practices/{session_id}/regenerate")
async def regenerate_unit_practice(id: str, session_id: int, db: AsyncSession = Database):
    """重新生成单元练习（重置全部进度）"""
    # 验证练习会话是否存在且属于该学生
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.id == session_id,
                PracticeSession.student_id == id,
                PracticeSession.session_type == "unit",
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
async def get_student_assessments(id: str, limit: int = 30, db: AsyncSession = Database):
    """获取学生的能力评估记录列表"""
    from sqlalchemy import desc

    result = await db.execute(
        select(PracticeSession)
        .where(
            and_(
                PracticeSession.student_id == id,
                PracticeSession.session_type == "assessment",
            )
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )
    assessments = result.scalars().all()

    return {
        "data": [PracticeSessionSchema.model_validate(assessment) for assessment in assessments],
        "total": len(assessments),
    }


@student_router.get("/{id}/assessments/{assessment_id}")
async def get_assessment_detail(id: str, assessment_id: int, db: AsyncSession = Database):
    """获取能力评测详情（包含问题列表）"""
    from sqlalchemy import select, and_
    from core.database import PracticeAnswer, Question
    from admin.schema import AssessmentTestSchema

    # 获取评测会话
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.id == assessment_id,
                PracticeSession.student_id == id,
                PracticeSession.session_type == "assessment",
            )
        )
    )
    test = result.scalar_one_or_none()

    if not test:
        raise HTTPException(status_code=404, detail="评测不存在")

    # 获取答题记录
    answers_result = await db.execute(
        select(PracticeAnswer)
        .where(PracticeAnswer.session_id == assessment_id)
        .order_by(PracticeAnswer.question_order)
    )
    answers = answers_result.scalars().all()

    # 获取题目详情
    question_ids = [ans.question_id for ans in answers]
    if question_ids:
        questions_result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
        questions_dict = {q.id: q for q in questions_result.scalars().all()}

        questions = []
        for ans in answers:
            q = questions_dict.get(ans.question_id)
            if q:
                questions.append(
                    {
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
                        "user_answer": ans.user_answer,
                        "is_correct": ans.is_correct == 1,
                        "time_spent": ans.time_spent,
                    }
                )
    else:
        questions = []

    return {
        "session": AssessmentTestSchema.model_validate(test),
        "questions": questions,
    }


@student_router.post("/{id}/assessments/{assessment_id}/reset")
async def reset_assessment(id: str, assessment_id: int, db: AsyncSession = Database):
    """重置能力评估（重置全部进度）"""
    # 验证评测是否存在且属于该学生
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.id == assessment_id,
                PracticeSession.student_id == id,
                PracticeSession.session_type == "assessment",
            )
        )
    )
    test = result.scalar_one_or_none()

    if not test:
        raise HTTPException(status_code=404, detail="评测不存在")

    # 重置进度
    test.status = "in_progress"
    from shared.utils.time import now
    test.update_time = now()

    # 删除答题记录
    answers_result = await db.execute(
        select(PracticeAnswer).where(PracticeAnswer.session_id == assessment_id)
    )
    answers = answers_result.scalars().all()
    for answer in answers:
        await db.delete(answer)

    # 删除练习报告（如果存在）
    from core.database import PracticeReport
    report_result = await db.execute(
        select(PracticeReport).where(PracticeReport.session_id == assessment_id)
    )
    report = report_result.scalar_one_or_none()
    if report:
        await db.delete(report)

    await db.commit()

    return {"message": "重置成功", "assessment": test}
