from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.question import QuestionService
from schema import (
    ResponseSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
)
from store.database import GetDB

router = APIRouter(prefix="/questions", tags=["问题管理"])


@router.get("/search")
async def list_questions(
    params: QuestionSearchSchema = Depends(),
    db: AsyncSession = GetDB,
):
    """获取问题列表"""
    data = await QuestionService.search(db, params)
    return ResponseSchema(data=data)


@router.post("/")
async def create_question(create: QuestionCreateSchema, db: AsyncSession = GetDB):
    """创建问题"""
    id = await QuestionService.create(db, create)
    return ResponseSchema(data=id)


@router.patch("/{question_id}")
async def update_question(
    question_id: str,
    update: QuestionUpdateSchema,
    db: AsyncSession = GetDB,
):
    """更新问题"""
    await QuestionService.update(db, question_id, update)

    return ResponseSchema()


@router.delete("/{question_id}")
async def delete_question(question_id: str, db: AsyncSession = GetDB):
    """删除问题"""
    await QuestionService.delete(db, question_id)
    return ResponseSchema()


@router.get("/knowledge/{knowledge_id}")
async def get_questions_by_knowledge(
    knowledge_id: int,
    current_page: int = 1,
    page_size: int = 10,
    db: AsyncSession = GetDB,
):
    """根据知识点获取问题列表(全量获取)"""
    data = await QuestionService.get_by_knowledge(
        db,
        knowledge_id,
        current_page,
        page_size,
    )
    return ResponseSchema(data=data)


@router.get("/course_unit/{course_unit_id}")
async def get_questions_by_course_unit(
    course_unit_id: int,
    current_page: int = 1,
    page_size: int = 10,
    db: AsyncSession = GetDB,
):
    """根据课程单元获取问题列表"""
    data = await QuestionService.get_by_course_unit(
        db,
        course_unit_id,
        current_page,
        page_size,
    )
    return ResponseSchema(data=data)


@router.get("/textbook/{course_unit_id}")
async def get_questions_by_course_unit(
    textbook_id: int,
    current_page: int = 1,
    page_size: int = 10,
    db: AsyncSession = GetDB,
):
    """根据课程单元获取问题列表"""
    data = await QuestionService.get_by_textbook(
        db,
        textbook_id,
        current_page,
        page_size,
    )
    return ResponseSchema(data=data)


@router.get("/{question_id}")
async def get_question(question_id: str, db: AsyncSession = GetDB):
    """获取单个问题"""
    question = await QuestionService.get_by_id(db, question_id)
    return ResponseSchema(data=question)
