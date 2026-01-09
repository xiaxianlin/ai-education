from fastapi import APIRouter, Request
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import StudentProfileSchema, UpdateStudentSettingsSchema
from .services import settings, textbook

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

    return StudentProfileSchema(
        name=student.name,
        phone=student.phone,
        grade=student.grade,
        semester=student.semester,
        subject=student.subject,
        textbooks=textbooks,
    )


@profile_router.put(
    "/profile",
    tags=["个人中心"],
    summary="更新学生设置",
    description="更新当前登录学生的年级、学期、学科设置",
)
async def update_profile(params: UpdateStudentSettingsSchema, request: Request, db: AsyncSession = Database):
    student = request.state.student
    await settings.update_student_settings(db, student.id, params)
    return {"message": "设置更新成功"}
