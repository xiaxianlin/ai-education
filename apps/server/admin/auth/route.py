from fastapi import APIRouter, Request
from shared.core.constants import (
    SEMESTERS,
    SUBJECTS,
)
from shared.core.database import Database
from shared.core.schema import ManagerSchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    CreateManangeSchema,
    LoginSchema,
    ModifyPasswordSchema,
    UpdateManangeSchema,
)
from .services import auth, manager

auth_router = APIRouter()


@auth_router.get(
    "/check",
    tags=["认证"],
    summary="检查登录状态",
    description="检查当前管理员的登录状态并返回管理员信息",
)
async def check(request: Request):
    return request.state.manager


@auth_router.get(
    "/configs",
    tags=["配置"],
    summary="获取全局配置",
    description="获取系统支持的学科、版本、学期、题型等全局配置信息",
)
async def configs():
    return {
        "subjects": SUBJECTS,
        "semesters": SEMESTERS,
        "providers": ["aliyun"],
    }


@auth_router.post(
    "/login",
    tags=["认证"],
    summary="管理员登录",
    description="管理员使用账号密码进行登录",
)
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await auth.admin_login(db, params)


@auth_router.post(
    "/modify_password",
    tags=["认证"],
    summary="修改密码",
    description="修改当前管理员的登录密码",
)
async def modify_password(params: ModifyPasswordSchema, request: Request, db=Database):
    manager: ManagerSchema = request.state.manager
    await auth.update_manager_password(db, manager.id, params)


@auth_router.post(
    "/manager",
    tags=["管理员管理"],
    summary="创建管理员",
    description="创建一个新的管理员账号",
)
async def create_manager(params: CreateManangeSchema, db: AsyncSession = Database):
    return await manager.create_manager(db, params)


@auth_router.post(
    "/manager/{id}/reset",
    tags=["管理员管理"],
    summary="重置管理员密码",
    description="重置指定管理员的密码为默认密码",
)
async def reset_manager_password(id: str, db: AsyncSession = Database):
    return await manager.reset_manager_password(db, id)


@auth_router.patch(
    "/manager/{id}",
    tags=["管理员管理"],
    summary="更新管理员",
    description="更新指定管理员的信息（如类型、状态等）",
)
async def update_manager_type(id: str, params: UpdateManangeSchema, db: AsyncSession = Database):
    await manager.update_manager(db, id, params)


@auth_router.delete(
    "/manager/{id}",
    tags=["管理员管理"],
    summary="删除管理员",
    description="删除指定的管理员账号",
)
async def remove(id: str, db: AsyncSession = Database):
    await manager.delete_manager(db, id)


@auth_router.get(
    "/manager/all",
    tags=["管理员管理"],
    summary="获取所有管理员",
    description="获取系统中所有的管理员列表",
)
async def find_all(db: AsyncSession = Database):
    return await manager.find_all(db)
