from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from common.database import Database
from student.schema import LoginSchema
from student.services import auth

auth_router = APIRouter()


@auth_router.get("/check")
async def check(request: Request):
    return request.state.student


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await auth.student_login(db, params.phone, params.password)
