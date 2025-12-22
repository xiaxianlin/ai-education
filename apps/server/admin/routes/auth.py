from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import LoginSchema, ModifyPasswordSchema
from admin.services.auth import admin_login
from admin.services.manager import update_manager_password
from shared.core.database import Database
from shared.core.schema import ManagerSchema
from shared.core.constants import (
    SUBJECTS,
    TEXTBOOK_VERSIONS,
    SEMESTERS,
    DIFFICULTY_LEVELS,
    QUESTION_TYPES,
)


auth_router = APIRouter()


@auth_router.get("/check", tags=["认证"], summary="检查登录状态", description="检查当前管理员的登录状态并返回管理员信息")
async def check(request: Request):
    return request.state.manager


@auth_router.post("/login", tags=["认证"], summary="管理员登录", description="管理员使用账号密码进行登录")
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await admin_login(db, params)


@auth_router.post("/modify_password", tags=["认证"], summary="修改密码", description="修改当前管理员的登录密码")
async def modify_password(params: ModifyPasswordSchema, request: Request, db=Database):
    manager: ManagerSchema = request.state.manager
    await update_manager_password(db, manager.id, params)


@auth_router.get("/configs", tags=["配置"], summary="获取全局配置", description="获取系统支持的学科、版本、学期、题型等全局配置信息")
async def configs():
    return {
        "subjects": SUBJECTS,
        "textbook_versions": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_types": QUESTION_TYPES,
        "difficulty_levels": DIFFICULTY_LEVELS,
        "providers": ["aliyun"],
    }
