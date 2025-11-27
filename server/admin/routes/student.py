from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateStudentSchema, SearchStudentSchema, UpdateStudentSchema
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
    return await student.get_student_detail(db, id)


@student_router.post("/{id}/textbook/{textbook_id}")
async def add_student_textbook(id: str, textbook_id, db: AsyncSession = Database):
    """保存学生教材"""
    await student.add_student_textbook(db, id, textbook_id)


@student_router.delete("/{id}/textbook/{textbook_id}")
async def remove_student_textbook(id: str, textbook_id, db: AsyncSession = Database):
    """保存学生教材"""
    await student.remove_student_textbook(db, id, textbook_id)


@student_router.get("/{id}/textbooks")
async def query_student_textbook(id: str, db: AsyncSession = Database):
    """查询学生教材"""
    return await student.query_student_textbook(db, id)
