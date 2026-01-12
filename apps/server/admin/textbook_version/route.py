"""
教材版本管理路由
"""

from fastapi import APIRouter, Depends
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    SaveTextbookVersionSchema,
    SearchTextbookVersionSchema,
)
from .services import textbook_version

textbook_version_router = APIRouter(prefix="/textbook_version")


@textbook_version_router.post(
    "",
    tags=["教材版本管理"],
    summary="创建教材版本",
    description="创建新的教材版本",
)
async def create_textbook_version(
    params: SaveTextbookVersionSchema, db: AsyncSession = Database
):
    return await textbook_version.create_textbook_version(db, params)


@textbook_version_router.patch(
    "/{id}",
    tags=["教材版本管理"],
    summary="更新教材版本",
    description="更新指定教材版本的信息",
)
async def update_textbook_version(
    id: int, params: SaveTextbookVersionSchema, db: AsyncSession = Database
):
    await textbook_version.update_textbook_version(db, id, params)


@textbook_version_router.delete(
    "/{id}",
    tags=["教材版本管理"],
    summary="删除教材版本",
    description="删除指定的教材版本（检查是否被使用）",
)
async def delete_textbook_version(id: int, db: AsyncSession = Database):
    await textbook_version.delete_textbook_version(db, id)


@textbook_version_router.patch(
    "/{id}/disable",
    tags=["教材版本管理"],
    summary="停用教材版本",
    description="停用指定的教材版本",
)
async def disable_textbook_version(id: int, db: AsyncSession = Database):
    await textbook_version.disable_textbook_version(db, id)


@textbook_version_router.patch(
    "/{id}/enable",
    tags=["教材版本管理"],
    summary="启用教材版本",
    description="启用指定的教材版本",
)
async def enable_textbook_version(id: int, db: AsyncSession = Database):
    await textbook_version.enable_textbook_version(db, id)


@textbook_version_router.get(
    "/search",
    tags=["教材版本管理"],
    summary="搜索教材版本",
    description="根据条件查询教材版本列表",
)
async def search_textbook_version(
    params: SearchTextbookVersionSchema = Depends(), db: AsyncSession = Database
):
    return await textbook_version.search_textbook_version(db, params)


@textbook_version_router.get(
    "/{id}",
    tags=["教材版本管理"],
    summary="获取教材版本详情",
    description="获取指定教材版本的详细信息",
)
async def get_textbook_version(id: int, db: AsyncSession = Database):
    return await textbook_version.get_textbook_version(db, id)
