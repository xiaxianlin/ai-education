from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import SavePracticeSchema, SearchPracticeSchema, SearchPracticePromptSchema, SavePracticePromptSchema
from shared.core.database import Database
from admin.services import practice
from admin.services import practice_prompt

practice_router = APIRouter(prefix="/practice", tags=["练习管理"])


# ======================== 练习参数配置 ======================== #


@practice_router.get("/parameters/{id}")
async def get_practice_parameters(id: int, db: AsyncSession = Database):
    """获取练习参数列表"""
    return await practice.get_practice_parameters(db, id)


@practice_router.post("/parameters/{id}/")
async def save_practice_parameters(id: int, parameters: list[dict], db: AsyncSession = Database):
    """保存练习参数"""
    return await practice.save_practice_parameters(db, id, parameters)


# ======================== 练习提示词管理 ======================== #


@practice_router.get("/prompt/list")
async def list_practice_prompts(params: SearchPracticePromptSchema = Depends(), db: AsyncSession = Database):
    """列表查询练习提示词关联"""
    return await practice_prompt.list_practice_prompts(db, params)


@practice_router.get("/prompt/{id}")
async def get_practice_prompt(id: int, db: AsyncSession = Database):
    """获取练习提示词关联详情"""
    return await practice_prompt.get_practice_prompt(db, id)


@practice_router.post("/prompt")
async def create_practice_prompt(params: SavePracticePromptSchema, db: AsyncSession = Database):
    """创建练习提示词关联"""
    return await practice_prompt.create_practice_prompt(db, params)


@practice_router.put("/prompt/{id}")
async def update_practice_prompt(id: int, params: SavePracticePromptSchema, db: AsyncSession = Database):
    """更新练习提示词关联"""
    return await practice_prompt.update_practice_prompt(db, id, params)


@practice_router.delete("/prompt/{id}")
async def delete_practice_prompt(id: int, db: AsyncSession = Database):
    """删除练习提示词关联"""
    return await practice_prompt.delete_practice_prompt(db, id)


# ======================== 练习管理 ======================== #


@practice_router.get("/list")
async def list_practices(params: SearchPracticeSchema = Depends(), db: AsyncSession = Database):
    """列表查询练习"""
    return await practice.list_practices(db, params)


@practice_router.get("/{id}")
async def get_practice(id: int, db: AsyncSession = Database):
    """获取练习详情"""
    return await practice.get_practice(db, id)


@practice_router.post("")
async def create_practice(params: SavePracticeSchema, db: AsyncSession = Database):
    """创建练习"""
    return await practice.create_practice(db, params)


@practice_router.put("/{id}")
async def update_practice(id: int, params: SavePracticeSchema, db: AsyncSession = Database):
    """更新练习"""
    return await practice.update_practice(db, id, params)


@practice_router.delete("/{id}")
async def delete_practice(id: int, db: AsyncSession = Database):
    """删除练习"""
    return await practice.delete_practice(db, id)
