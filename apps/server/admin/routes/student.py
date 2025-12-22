from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateStudentSchema, SearchStudentSchema, UpdateStudentSchema
from admin.services import student
from admin.services import practice_session
from shared.core.database import Database


student_router = APIRouter(prefix="/student")

# ======================== 学生管理 ======================== #


@student_router.post("", tags=["学生管理"], summary="创建学生信息", description="创建一名新的学生账号")
async def create_student(params: CreateStudentSchema, db: AsyncSession = Database):
    return await student.create_student(db, params)


@student_router.patch("/{id}", tags=["学生管理"], summary="更新学生信息", description="更新指定学生的基本信息")
async def update_student(id: str, params: UpdateStudentSchema, db: AsyncSession = Database):
    await student.update_student(db, id, params)


@student_router.delete("/{id}", tags=["学生管理"], summary="删除学生信息", description="删除指定的学生账号")
async def delete_student(id: str, db: AsyncSession = Database):
    await student.delete_student(db, id)


@student_router.post(
    "/{id}/reset_password", tags=["学生管理"], summary="重置学生密码", description="将指定学生的密码重置为默认值"
)
async def reset_student_password(id: str, db: AsyncSession = Database):
    return await student.reset_student_password(db, id)


@student_router.get("/search", tags=["学生管理"], summary="搜索学生信息", description="根据条件查询学生列表")
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    return await student.search_student(db, params)


@student_router.get("/{id}", tags=["学生管理"], summary="获取学生详情", description="获取指定学生的详细资料")
async def get_student_detail(id: str, db: AsyncSession = Database):
    return await student.get_student_detail(db, id)


# ======================== 学生教材管理 ======================== #


@student_router.post(
    "/{id}/textbook/{textbook_id}", tags=["学生教材管理"], summary="保存学生教材", description="为学生关联指定的教材"
)
async def add_student_textbook(id: str, textbook_id: int, db: AsyncSession = Database):
    await student.add_student_textbook(db, id, textbook_id)


@student_router.delete(
    "/{id}/textbook/{textbook_id}",
    tags=["学生教材管理"],
    summary="删除学生教材",
    description="取消学生与指定教材的关联",
)
async def remove_student_textbook(id: str, textbook_id: int, db: AsyncSession = Database):
    await student.remove_student_textbook(db, id, textbook_id)


@student_router.get(
    "/{id}/textbooks", tags=["学生教材管理"], summary="查询学生教材", description="获取学生已关联的所有教材列表"
)
async def get_student_textbooks(id: str, db: AsyncSession = Database):
    return await student.get_student_textbooks(db, id)


@student_router.get(
    "/{id}/unused_textbooks",
    tags=["学生教材管理"],
    summary="查询学生未选教材",
    description="获取系统中学生尚未关联的教材列表",
)
async def get_student_unused_textbooks(id: str, db: AsyncSession = Database):
    return await student.get_student_unused_textbooks(db, id)


# ======================== 学生练习管理 ======================== #


@student_router.get(
    "/{id}/practice_sessions/{session_type}",
    tags=["学生练习管理"],
    summary="查询学生练习历史",
    description="获取指定学生在不同练习模式下的练习记录",
)
async def get_student_practice_sessions(id: str, session_type: str, db: AsyncSession = Database):
    return await practice_session.get_student_practice_sessions(db, id, session_type)


@student_router.post(
    "/{id}/practice/{practice_id}", tags=["学生练习管理"], summary="保存学生练习", description="为学生关联指定的练习"
)
async def add_student_practice(id: str, practice_id: int, db: AsyncSession = Database):
    await student.add_student_practice(db, id, practice_id)


@student_router.delete(
    "/{id}/practice/{practice_id}",
    tags=["学生练习管理"],
    summary="删除学生练习",
    description="取消学生与指定练习的关联",
)
async def remove_student_practice(id: str, practice_id: int, db: AsyncSession = Database):
    await student.remove_student_practice(db, id, practice_id)


@student_router.get(
    "/{id}/practices", tags=["学生练习管理"], summary="查询学生练习", description="获取学生已关联的所有练习列表"
)
async def get_student_practices(id: str, db: AsyncSession = Database):
    return await student.get_student_practices(db, id)


@student_router.get(
    "/{id}/unused_practices",
    tags=["学生练习管理"],
    summary="查询学生未选练习",
    description="获取系统中学生尚未关联的练习列表",
)
async def get_student_unused_practices(id: str, db: AsyncSession = Database):
    return await student.get_student_unused_practices(db, id)
