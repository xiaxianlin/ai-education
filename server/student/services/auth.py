from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request, HTTPException, Depends
from common.database import Student
from utils import encrypt
from utils.time import now


user_ignore_routes = [
    "/user_api/login",
]


def student_router_filter(request: Request):
    path = request.url.path
    if path in user_ignore_routes:
        return

    token = request.headers.get("x-access-token")
    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload or not payload.get("id"):
        raise HTTPException(status_code=401, detail="登录失效")


async def get_current_student(request: Request):
    token = request.headers.get("x-access-token")

    payload = encrypt.decode(token)
    if not payload or not payload.get("id"):
        raise HTTPException(status_code=401, detail="登录失效")

    return payload


async def login(db: AsyncSession, phone: str, password: str):
    student = await db.scalar(select(Student).where(Student.phone == phone))
    if not student:
        raise ValueError("当前用户名或密码错误")

    # 校验密码
    if student.password != encrypt.hash(password):
        raise ValueError("当前用户名或密码错误")

    student.update_time = now()
    await db.commit()

    return encrypt.encode({"id": student.id, "status": student.status})


async def get_student(db: AsyncSession, id: str):
    return await db.scalar(select(Student).where(Student.id == id))


CurrentStudent = Depends(get_current_student)
