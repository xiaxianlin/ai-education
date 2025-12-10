from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import SaveTeacherBookSchema, SearchTeacherBookSchema
from admin.services import teacher_book
from admin.services.auth import check_super_permission
from shared.core.database import Database

teacher_book_router = APIRouter(prefix="/teacher_book")


@teacher_book_router.post("/")
async def create_teacher_book(
    params: SaveTeacherBookSchema, db: AsyncSession = Database
):
    """创建教师用书"""
    return await teacher_book.create_teacher_book(db, params)


@teacher_book_router.post("/{id}/upload")
async def upload_teacher_book(id: int, file: UploadFile, db: AsyncSession = Database):
    """上传教师用书文件"""
    await teacher_book.upload_teacher_book(db, id, file)


@teacher_book_router.put("/{id}")
async def modify_teacher_book(
    id: int, params: SaveTeacherBookSchema, db: AsyncSession = Database
):
    """修改教师用书信息"""
    await teacher_book.modify_teacher_book(db, id, params)


@teacher_book_router.delete("/{id}", dependencies=[Depends(check_super_permission)])
async def delete_teacher_book(id: int, db: AsyncSession = Database):
    """删除教师用书"""
    await teacher_book.delete_teacher_book(db, id)


@teacher_book_router.get("/search")
async def search(
    params: SearchTeacherBookSchema = Depends(), db: AsyncSession = Database
):
    """搜索教师用书"""
    return await teacher_book.search_teacher_book(db, params)


@teacher_book_router.get("/{id}")
async def get_teacher_book(id: int, db: AsyncSession = Database):
    """获取教师用书详情"""
    return await teacher_book.get_teacher_book(db, id)
