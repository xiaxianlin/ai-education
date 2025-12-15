from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateQuestionTypeSchema,
    UpdateQuestionTypeSchema,
    SearchQuestionTypeSchema,
)
from admin.services import question_type
from shared.core.database import Database

question_type_router = APIRouter(prefix="/question_type", tags=["题型管理"])


@question_type_router.post("/")
async def create_question_type(
    params: CreateQuestionTypeSchema,
    db: AsyncSession = Database,
):
    """创建题型"""
    return await question_type.create_question_type(db, params)


@question_type_router.patch("/{id}")
async def update_question_type(
    id: int,
    params: UpdateQuestionTypeSchema,
    db: AsyncSession = Database,
):
    """更新题型"""
    return await question_type.update_question_type(db, id, params)


@question_type_router.delete("/{id}")
async def delete_question_type(
    id: int,
    db: AsyncSession = Database,
):
    """删除题型"""
    await question_type.delete_question_type(db, id)


@question_type_router.get("/search")
async def search_question_types(
    params: SearchQuestionTypeSchema = Depends(),
    db: AsyncSession = Database,
):
    """搜索题型"""
    return await question_type.search_question_types(db, params)


@question_type_router.get("/{id}")
async def get_question_type(
    id: int,
    db: AsyncSession = Database,
):
    """获取题型详情"""
    return await question_type.get_question_type(db, id)
