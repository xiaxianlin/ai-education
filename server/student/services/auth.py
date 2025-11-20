from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request, HTTPException
from loguru import logger
from core.database import AsyncSessionLocal, Student
from core.schema import StudentSchema
from shared.utils import encrypt
from shared.utils.time import now


student_ignore_routes = ["/api/student/login"]


async def student_router_filter(request: Request):
    path = request.url.path
    if path in student_ignore_routes:
        return

    token = request.headers.get("x-access-token")
    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload:
        raise HTTPException(status_code=401, detail="登录失效")

    student = None
    async with AsyncSessionLocal() as db:
        student = await db.scalar(select(Student).where(Student.token == token))
        if student:
            logger.info(f"当前登录学生：{student.name}")

    if not student or student.id != payload.get("id"):
        raise HTTPException(status_code=401, detail="登录失效")

    if student.status == 0:
        raise HTTPException(status_code=403, detail="账号被禁用")

    request.state.student = StudentSchema.model_validate(student)


async def student_login(db: AsyncSession, phone: str, password: str):
    student = await db.scalar(select(Student).where(Student.phone == phone))
    if not student:
        raise ValueError("手机号或密码错误")

    # 校验密码
    if student.password != encrypt.hash(password):
        raise ValueError("手机号或密码错误")

    if student.status == 0:
        raise ValueError("账号被禁用")

    student.update_time = now()

    token = encrypt.encode({"id": student.id, "update_time": student.update_time})
    student.token = token
    await db.commit()

    return token
