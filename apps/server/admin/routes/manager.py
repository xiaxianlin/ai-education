from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateManangeSchema, UpdateManangeSchema
from admin.services import manager
from shared.core.database import Database


manager_router = APIRouter(prefix="/manager")


@manager_router.get("/all", tags=["管理员管理"], summary="获取所有管理员", description="获取系统中所有的管理员列表")
async def find_all(db: AsyncSession = Database):
    return await manager.find_all(db)


@manager_router.post("/", tags=["管理员管理"], summary="创建管理员", description="创建一个新的管理员账号")
async def create_manager(params: CreateManangeSchema, db: AsyncSession = Database):
    return await manager.create_manager(db, params)


@manager_router.post("/{id}/reset", tags=["管理员管理"], summary="重置管理员密码", description="重置指定管理员的密码为默认密码")
async def reset_manager_password(id: str, db: AsyncSession = Database):
    return await manager.reset_manager_password(db, id)


@manager_router.patch("/{id}", tags=["管理员管理"], summary="更新管理员", description="更新指定管理员的信息（如类型、状态等）")
async def update_manager_type(id: str, params: UpdateManangeSchema, db: AsyncSession = Database):
    await manager.update_manager(db, id, params)

@manager_router.delete("/{id}", tags=["管理员管理"], summary="删除管理员", description="删除指定的管理员账号")
async def remove(id: str, db: AsyncSession = Database):
    await manager.delete_manager(db, id)
