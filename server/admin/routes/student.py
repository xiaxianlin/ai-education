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
from common.schema import ResponseSchema


student_router = APIRouter(prefix="/student")


@student_router.get("/search")
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    res = await student.search_student(db, params)
    return ResponseSchema(data=res)


@student_router.get("/{id}/subjects")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    data = await student.query_student_textbook(db, id)
    return ResponseSchema(data=data)


@student_router.post("/")
async def create_student(params: CreateStudentSchema, db: AsyncSession = Database):
    password = await student.create_student(db, params)
    return ResponseSchema(data=password)


@student_router.post("/{id}/subjects")
async def create_student(id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database):
    await student.save_student_textbook(db, id, params.ids)
    return ResponseSchema()


@student_router.patch("/{id}")
async def update_student(id: str, params: UpdateStudentSchema, db: AsyncSession = Database):
    await student.update_student(db, id, params)
    return ResponseSchema()


@student_router.delete("/{id}")
async def delete_student(id: str, db: AsyncSession = Database):
    await student.delete_student(db, id)
    return ResponseSchema()
