from fastapi import APIRouter, Depends
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import SearchPracticeSchema
from .services import practice

practice_router = APIRouter(prefix="/practice", tags=["练习管理"])


@practice_router.get(
    "/search",
    summary="搜索练习列表",
    description="根据条件查询练习会话列表",
)
async def search_practices(params: SearchPracticeSchema = Depends(), db: AsyncSession = Database):
    return await practice.search_practices(db, params)


@practice_router.get(
    "/{id}",
    summary="获取练习详情",
    description="获取指定练习会话的详细信息，包括题目和答题记录",
)
async def get_practice_detail(id: str, db: AsyncSession = Database):
    return await practice.get_practice_detail(db, id)


@practice_router.delete(
    "/{id}",
    summary="删除练习",
    description="删除指定的练习会话及其相关数据",
)
async def delete_practice(id: str, db: AsyncSession = Database):
    return await practice.delete_practice(db, id)


@practice_router.post(
    "/{id}/reset",
    summary="重置练习",
    description="重置练习的所有答题记录为初始状态",
)
async def reset_practice(id: str, db: AsyncSession = Database):
    return await practice.reset_practice(db, id)


@practice_router.post(
    "/{id}/answer/{question_id}/reset",
    summary="重置题目答案",
    description="重置指定题目的答案记录为未作答状态",
)
async def reset_practice_answer(
    id: str,
    question_id: str,
    db: AsyncSession = Database,
):
    return await practice.reset_practice_answer(db, id, question_id)
