from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateStudentSchema,
    SaveStudentSubjectSchema,
    SearchStudentSchema,
    UpdateStudentSchema,
)
from admin.services import student
from common.database import Database


student_router = APIRouter(prefix="/student")


@student_router.post("/")
async def create_student(params: CreateStudentSchema, db: AsyncSession = Database):
    return await student.create_student(db, params)


@student_router.patch("/{id}")
async def update_student(id: str, params: UpdateStudentSchema, db: AsyncSession = Database):
    await student.update_student(db, id, params)


@student_router.delete("/{id}")
async def delete_student(id: str, db: AsyncSession = Database):
    await student.delete_student(db, id)


@student_router.get("/search")
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    return await student.search_student(db, params)


@student_router.post("/{id}/subjects")
async def create_student(id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database):
    await student.save_student_textbook(db, id, params.ids)


@student_router.get("/{id}/subjects")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    return await student.query_student_textbook(db, id)


@student_router.post("/{id}/reset_password")
async def reset_student_password(id: str, db: AsyncSession = Database):
    return await student.reset_student_password(db, id)
