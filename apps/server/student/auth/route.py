from fastapi import APIRouter, Request
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import LoginSchema
from .services import auth

auth_router = APIRouter()


@auth_router.get(
    "/check",
    tags=["认证"],
    summary="检查登录状态",
    description="检查当前学生的登录状态并返回学生 ID",
)
async def check(request: Request):
    student = request.state.student
    return student.id


@auth_router.post(
    "/login",
    tags=["认证"],
    summary="学生登录",
    description="学生使用手机号和密码进行登录",
)
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await auth.student_login(db, params.phone, params.password)
