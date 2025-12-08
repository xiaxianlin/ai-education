from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from student.services import textbook

profile_router = APIRouter()


@profile_router.get("/profile")
async def get_profile(request: Request, db: AsyncSession = Database):
    """检查当前学生登录状态，并返回学生信息以及当前使用的教材"""
    student = request.state.student
    textbooks = await textbook.query_student_textbooks(db, student.id)
    return {"student": student, "textbooks": textbooks}
