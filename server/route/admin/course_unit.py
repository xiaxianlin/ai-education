from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.course_unit import CourseUnitService
from store.database import GetDB
from schema import (
    SearchSchema,
    ResponseSchema,
    CourseUnitCreateSchema,
    CourseUnitSchema,
    CourseUnitUpdateSchema,
)

router = APIRouter(prefix="/course_unit", tags=["课程单元管理"])


@router.post("/")
async def create_course_unit(create: CourseUnitCreateSchema, db: AsyncSession = GetDB):
    """创建课程单元"""
    res = await CourseUnitService.create(db, create)
    return ResponseSchema(data=res)


@router.get("/{unit_id}")
async def get_course_unit(unit_id: int, db: AsyncSession = GetDB):
    """获取单个课程单元"""
    unit = await CourseUnitService.get_by_id(db=db, unit_id=unit_id)
    return ResponseSchema(data=CourseUnitSchema.model_validate(unit))


@router.put("/{unit_id}")
async def update_course_unit(
    unit_id: int,
    unit_update: CourseUnitUpdateSchema,
    db: AsyncSession = GetDB,
):
    """更新课程单元"""
    await CourseUnitService.update(db, unit_id, unit_update)
    return ResponseSchema()


@router.delete("/{unit_id}")
async def delete_course_unit(unit_id: int, db: AsyncSession = GetDB):
    """删除课程单元"""
    await CourseUnitService.delete(db=db, unit_id=unit_id)
    return ResponseSchema()


@router.get("/search")
async def list_course_units(params: SearchSchema = Depends(), db: AsyncSession = GetDB):
    """获取课程单元列表"""
    data = CourseUnitService.search(db, params)
    return ResponseSchema(data=data)
