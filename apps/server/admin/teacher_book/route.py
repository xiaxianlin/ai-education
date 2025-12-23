from fastapi import APIRouter, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from .schema import SaveTeacherBookSchema
from .services import teacher_book

teacher_book_router = APIRouter(prefix="/teacher_book")


@teacher_book_router.post(
    "",
    tags=["教师用书管理"],
    summary="创建教师用书",
    description="录入新的教师用书基本信息",
)
async def create_teacher_book(params: SaveTeacherBookSchema, db: AsyncSession = Database):
    return await teacher_book.create_teacher_book(db, params)


@teacher_book_router.post(
    "/{id}/upload",
    tags=["教师用书管理"],
    summary="上传教师用书文件",
    description="上传教师用书对应的 PDF 或其他格式资源文件",
)
async def upload_teacher_book(id: int, file: UploadFile, db: AsyncSession = Database):
    await teacher_book.upload_teacher_book(db, id, file)


@teacher_book_router.put(
    "/{id}",
    tags=["教师用书管理"],
    summary="修改教师用书信息",
    description="更新已录入教师用书的元数据",
)
async def modify_teacher_book(id: int, params: SaveTeacherBookSchema, db: AsyncSession = Database):
    await teacher_book.modify_teacher_book(db, id, params)


@teacher_book_router.delete(
    "/{id}",
    tags=["教师用书管理"],
    summary="删除教师用书",
    description="删除指定的教师用书记录及其资源",
)
async def delete_teacher_book(id: int, db: AsyncSession = Database):
    await teacher_book.delete_teacher_book(db, id)


@teacher_book_router.get(
    "/search",
    tags=["教师用书管理"],
    summary="搜索教师用书",
    description="根据学科和年级查询教师用书",
)
async def search(subject: str, grade: int, db: AsyncSession = Database):
    return await teacher_book.search_teacher_book(db, subject, grade)


@teacher_book_router.get(
    "/{id}",
    tags=["教师用书管理"],
    summary="获取教师用书详情",
    description="获取指定教师用书的所有详细信息",
)
async def get_teacher_book(id: int, db: AsyncSession = Database):
    return await teacher_book.get_teacher_book(db, id)
