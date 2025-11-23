from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import (
    CreateStudentSchema,
    SaveStudentSubjectSchema,
    SearchStudentSchema,
    UpdateStudentSchema,
)
from admin.services import student
from core.database import Database


student_router = APIRouter(prefix="/student")


@student_router.post("/")
async def create_student(params: CreateStudentSchema, db: AsyncSession = Database):
    """创建学生信息"""
    return await student.create_student(db, params)


@student_router.patch("/{id}")
async def update_student(id: str, params: UpdateStudentSchema, db: AsyncSession = Database):
    """更新学生信息"""
    await student.update_student(db, id, params)


@student_router.delete("/{id}")
async def delete_student(id: str, db: AsyncSession = Database):
    """删除学生信息"""
    await student.delete_student(db, id)


@student_router.get("/search")
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    """搜索学生信息"""
    return await student.search_student(db, params)


@student_router.post("/{id}/reset_password")
async def reset_student_password(id: str, db: AsyncSession = Database):
    """重置学生密码"""
    return await student.reset_student_password(db, id)


@student_router.get("/{id}")
async def get_student_detail(id: str, db: AsyncSession = Database):
    """获取学生详情"""
    try:
        return await student.get_student_detail(db, id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@student_router.post("/{id}/textbooks")
async def save_student_textbook(
    id: str, params: SaveStudentSubjectSchema, db: AsyncSession = Database
):
    """保存学生教材"""
    await student.save_student_textbook(db, id, params.ids)


@student_router.get("/{id}/textbooks")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    """查询学生教材"""
    return await student.query_student_textbook(db, id)


@student_router.get("/{id}/profile")
async def get_student_profile(id: str, db: AsyncSession = Database):
    """获取学生资料（包含当前教材信息）"""
    try:
        return await student.get_student_profile(db, id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
