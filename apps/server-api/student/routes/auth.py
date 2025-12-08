from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from student.schema import LoginSchema
from student.services import auth


auth_router = APIRouter()


@auth_router.get("/check")
async def check(request: Request):
    """检查当前学生登录状态"""
    student = request.state.student
    return student.id


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await auth.student_login(db, params.phone, params.password)
