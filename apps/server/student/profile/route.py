from fastapi import APIRouter, Request
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import StudentProfileSchema
from .services import practice, textbook

profile_router = APIRouter()


@profile_router.get(
    "/profile",
    tags=["个人中心"],
    summary="获取个人资料",
    description="获取当前登录学生的详细个人资料及教材订阅信息",
)
async def get_profile(request: Request, db: AsyncSession = Database):
    student = request.state.student
    textbooks = await textbook.query_student_textbooks(db, student.id)
    practices = await practice.get_student_practices(db, student.id)

    return StudentProfileSchema(
        name=student.name,
        phone=student.phone,
        grade=student.grade,
        textbooks=textbooks,
        practices=practices,
    )
