from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from admin.services import question
from shared.core.database import Database

question_router = APIRouter(prefix="/question")


@question_router.patch("/{id}")
async def update_question(id: str, update: UpdateQuestionSchema, db: AsyncSession = Database):
    """更新题目"""
    await question.update_question(db, id, update)


@question_router.delete("/{id}")
async def delete_question(id: str, db: AsyncSession = Database):
    """删除题目"""
    await question.delete_question(db, id)


@question_router.get("/search")
async def search_question(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    """搜索题目"""
    return await question.search_question(db, params)


@question_router.get("/resource/search")
async def search_resource_question(
    params: SearchQuestionSchema = Depends(), db: AsyncSession = Database
):
    """搜索资源题目"""
    return await question.search_resource_questions(db, params)


@question_router.get("/{id}")
async def get_question(id: str, db: AsyncSession = Database):
    """获取单个题目详情"""
    return await question.get_question(db, id)
