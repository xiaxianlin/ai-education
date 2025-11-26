from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from student.schema import LoginSchema
from student.services import auth


auth_router = APIRouter()


@auth_router.get("/check")
async def check(request: Request, db: AsyncSession = Database):
    """检查当前学生登录状态，并返回学生信息以及当前使用的教材"""
    student = request.state.student
    active_textbook = request.state.student_textbook
    return {"student": student, "textbook": active_textbook}


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await auth.student_login(db, params.phone, params.password)
