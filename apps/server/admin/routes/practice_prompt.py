from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import (
    SavePracticePromptSchema,
    SearchPracticePromptSchema,
)
from shared.core.database import Database
from admin.services import practice_prompt

practice_prompt_router = APIRouter(prefix="/practice_prompt", tags=["练习提示词管理"])


@practice_prompt_router.get("/list")
async def list_practice_prompts(params: SearchPracticePromptSchema = Depends(), db: AsyncSession = Database):
    """列表查询练习提示词关联"""
    return await practice_prompt.list_practice_prompts(db, params)


@practice_prompt_router.get("/{id}")
async def get_practice_prompt(id: int, db: AsyncSession = Database):
    """获取练习提示词关联详情"""
    return await practice_prompt.get_practice_prompt(db, id)


@practice_prompt_router.post("")
async def create_practice_prompt(params: SavePracticePromptSchema, db: AsyncSession = Database):
    """创建练习提示词关联"""
    return await practice_prompt.create_practice_prompt(db, params)


@practice_prompt_router.put("/{id}")
async def update_practice_prompt(id: int, params: SavePracticePromptSchema, db: AsyncSession = Database):
    """更新练习提示词关联"""
    return await practice_prompt.update_practice_prompt(db, id, params)


@practice_prompt_router.delete("/{id}")
async def delete_practice_prompt(id: int, db: AsyncSession = Database):
    """删除练习提示词关联"""
    return await practice_prompt.delete_practice_prompt(db, id)
