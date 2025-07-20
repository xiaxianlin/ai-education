from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.user.question import UserQuestionService
from schema import ResponseSchema
from schema.user import QuestionRequestSchema
from core.auth import get_current_user


router = APIRouter(prefix="/question")


@router.post("/get-questions")
async def get_questions(
    params: QuestionRequestSchema, 
    db: AsyncSession = GetDB,
    current_user: dict = Depends(get_current_user)
):
    """获取问题（优先数据库，不足时AI生成）"""
    result = await UserQuestionService.get_questions(db, current_user["id"], params)
    return ResponseSchema(data=result.model_dump())


@router.get("/generation-status/{task_id}")
async def get_generation_status(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取问题生成任务状态"""
    # 验证用户权限（当前简单实现，可以根据需要添加更多验证）
    _ = current_user  # 标记参数已使用
    status = await UserQuestionService.get_generation_status(task_id)
    return ResponseSchema(data=status)


@router.post("/by-subject")
async def get_questions_by_subject(
    subject: str,
    count: int = 10,
    grade: int = None,
    question_type: str = None,
    difficulty: str = None,
    db: AsyncSession = GetDB,
    current_user: dict = Depends(get_current_user)
):
    """根据科目获取问题"""
    params = QuestionRequestSchema(
        subject=subject,
        count=count,
        grade=grade,
        question_type=question_type,
        difficulty=difficulty
    )
    result = await UserQuestionService.get_questions(db, current_user["id"], params)
    return ResponseSchema(data=result.model_dump())


@router.post("/by-unit")
async def get_questions_by_unit(
    course_unit_id: int,
    count: int = 10,
    question_type: str = None,
    difficulty: str = None,
    db: AsyncSession = GetDB,
    current_user: dict = Depends(get_current_user)
):
    """根据课程单元获取问题"""
    params = QuestionRequestSchema(
        course_unit_id=course_unit_id,
        count=count,
        question_type=question_type,
        difficulty=difficulty
    )
    result = await UserQuestionService.get_questions(db, current_user["id"], params)
    return ResponseSchema(data=result.model_dump())


@router.post("/by-knowledge")
async def get_questions_by_knowledge(
    knowledge_id: int,
    count: int = 10,
    question_type: str = None,
    difficulty: str = None,
    db: AsyncSession = GetDB,
    current_user: dict = Depends(get_current_user)
):
    """根据知识点获取问题"""
    params = QuestionRequestSchema(
        knowledge_id=knowledge_id,
        count=count,
        question_type=question_type,
        difficulty=difficulty
    )
    result = await UserQuestionService.get_questions(db, current_user["id"], params)
    return ResponseSchema(data=result.model_dump())


@router.post("/by-textbook")
async def get_questions_by_textbook(
    textbook_id: int,
    count: int = 10,
    question_type: str = None,
    difficulty: str = None,
    db: AsyncSession = GetDB,
    current_user: dict = Depends(get_current_user)
):
    """根据教材获取问题"""
    params = QuestionRequestSchema(
        textbook_id=textbook_id,
        count=count,
        question_type=question_type,
        difficulty=difficulty
    )
    result = await UserQuestionService.get_questions(db, current_user["id"], params)
    return ResponseSchema(data=result.model_dump())