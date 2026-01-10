from fastapi import APIRouter, Depends, Query, Request
from shared.core.database import Database
from shared.core.schema import StudentSchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    HandleStudentTextbookSchema,
    SaveStudentSchema,
    SearchStudentSchema,
)
from .services import practice, student, textbook

student_router = APIRouter(prefix="/student", dependencies=[Depends(student.check_student)])

# ======================== 学生管理 ======================== #


@student_router.post(
    "",
    tags=["学生管理"],
    summary="创建学生信息",
    description="创建一名新的学生账号",
)
async def create_student(params: SaveStudentSchema, db: AsyncSession = Database):
    return await student.add_student(db, params)


@student_router.put(
    "/{id}",
    tags=["学生管理"],
    summary="更新学生信息",
    description="更新指定学生的基本信息",
)
async def update_student(params: SaveStudentSchema, request: Request, db: AsyncSession = Database):
    await student.update_student(db, request.state.student, params)


@student_router.delete(
    "/{id}",
    tags=["学生管理"],
    summary="删除学生信息",
    description="删除指定的学生账号",
)
async def delete_student(request: Request, db: AsyncSession = Database):
    await student.delete_student(db, request.state.student)


@student_router.post(
    "/{id}/reset_password",
    tags=["学生管理"],
    summary="重置学生密码",
    description="将指定学生的密码重置为默认值",
)
async def reset_student_password(request: Request, db: AsyncSession = Database):
    return await student.reset_student_password(db, request.state.student)


@student_router.get(
    "/search",
    tags=["学生管理"],
    summary="搜索学生信息",
    description="根据条件查询学生列表",
)
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    return await student.search_student(db, params)


@student_router.get(
    "/{id}",
    tags=["学生管理"],
    summary="获取学生详情",
    description="获取指定学生的详细资料",
)
async def get_student_detail(request: Request):
    student = request.state.student
    return StudentSchema.model_validate(student)


# ======================== 学生教材管理 ======================== #


@student_router.post(
    "/{id}/textbook",
    tags=["学生教材管理"],
    summary="保存学生教材",
    description="为学生关联指定的教材",
)
async def add_student_textbook(
    request: Request, params: HandleStudentTextbookSchema, db: AsyncSession = Database
):
    await textbook.add_student_textbook(db, request.state.student, params.ids)


@student_router.delete(
    "/{id}/textbook",
    tags=["学生教材管理"],
    summary="删除学生教材",
    description="取消学生与指定教材的关联",
)
async def remove_student_textbook(
    request: Request, params: HandleStudentTextbookSchema, db: AsyncSession = Database
):
    await textbook.remove_student_textbook(db, request.state.student, params.ids)


@student_router.get(
    "/{id}/textbooks",
    tags=["学生教材管理"],
    summary="查询学生教材",
    description="获取学生已关联的所有教材列表",
)
async def get_student_textbooks(request: Request, db: AsyncSession = Database):
    return await textbook.get_student_textbooks(db, request.state.student)


@student_router.get(
    "/{id}/unused_textbooks",
    tags=["学生教材管理"],
    summary="查询学生未选教材",
    description="获取系统中学生尚未关联的教材列表",
)
async def get_student_unused_textbooks(request: Request, db: AsyncSession = Database):
    return await textbook.get_student_unused_textbooks(db, request.state.student)


# ======================== 学生练习管理 ======================== #


@student_router.get(
    "/{id}/practices",
    tags=["学生练习管理"],
    summary="查询学生练习历史",
    description="获取指定学生的所有练习记录（支持分页）",
)
async def get_student_practices(
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Database,
):
    return await practice.get_student_practice_sessions(
        db, request.state.student, page=page, page_size=page_size
    )


@student_router.get(
    "/{id}/practice/{session_id}",
    tags=["学生练习管理"],
    summary="查询学生练习详情",
    description="获取指定学生的练习详情（session_id 为 UUID v4 格式）",
)
async def get_student_practice_data(request: Request, session_id: str, db: AsyncSession = Database):
    return await practice.get_student_practice_session_data(db, request.state.student, session_id)
