from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import (
    SavePracticeSchema,
    SearchPracticeSchema,
    SavePracticeConfigSchema,
)
from shared.core.database import Database
from admin.services import practice

practice_router = APIRouter(prefix="/practice", tags=["练习管理"])


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


@practice_router.patch("/{id}/config")
async def update_practice_config(id: int, params: SavePracticeConfigSchema, db: AsyncSession = Database):
    """更新练习配置"""
    return await practice.update_practice_config(db, id, params)


@practice_router.delete("/{id}")
async def delete_practice(id: int, db: AsyncSession = Database):
    """删除练习"""
    return await practice.delete_practice(db, id)
