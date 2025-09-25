from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.question import QuestionService
from schema import (
    ResponseSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
)
from common.database import GetDB

router = APIRouter(prefix="/question", tags=["问题管理"])


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


@router.get("/search")
async def list_questions(
    params: QuestionSearchSchema = Depends(),
    db: AsyncSession = GetDB,
):
    """获取问题列表"""
    data = await QuestionService.search(db, params)
    return ResponseSchema(data=data)


@router.get("/{question_id}")
async def get_question(question_id: str, db: AsyncSession = GetDB):
    """获取单个问题"""
    question = await QuestionService.get_by_id(db, question_id)
    return ResponseSchema(data=question)
