from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateManangeSchema, UpdateManangeSchema
from admin.services import manager
from shared.core.database import Database


manager_router = APIRouter(prefix="/manager")


@manager_router.get("/all")
async def find_all(db: AsyncSession = Database):
    """获取所有管理员"""
    return await manager.find_all(db)


@manager_router.post("/")
async def create_manager(params: CreateManangeSchema, db: AsyncSession = Database):
    """创建管理员"""
    return await manager.create_manager(db, params)


@manager_router.post("/{id}/reset")
async def reset_manager_password(id: str, db: AsyncSession = Database):
    """重置管理员密码"""
    return await manager.reset_manager_password(db, id)


@manager_router.patch("/{id}")
async def update_manager_type(id: str, params: UpdateManangeSchema, db: AsyncSession = Database):
    """更新管理员"""
    await manager.update_manager(db, id, params)

@manager_router.delete("/{id}")
async def remove(id: str, db: AsyncSession = Database):
    """删除管理员"""
    await manager.delete_manager(db, id)
