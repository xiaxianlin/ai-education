from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from common.schema import ResponseSchema

router = APIRouter(prefix="/unit", tags=["课程单元管理"])


@router.post("/")
async def create_unit(create: CourseUnitCreateSchema, db: AsyncSession = Database):
    """创建课程单元"""
    res = await CourseUnitService.create(db, create)
    return ResponseSchema(data=res)


@router.put("/{unit_id}")
async def update_unit(
    unit_id: int, unit_update: CourseUnitUpdateSchema, db: AsyncSession = Database
):
    """更新课程单元"""
    await CourseUnitService.update(db, unit_id, unit_update)
    return ResponseSchema()


@router.delete("/{unit_id}")
async def delete_unit(unit_id: int, db: AsyncSession = Database):
    """删除课程单元"""
    await CourseUnitService.delete(db=db, unit_id=unit_id)
    return ResponseSchema()


@router.patch("/{id}/status/{status}")
async def update_status(id: int, status: int, db: AsyncSession = Database):
    await CourseUnitService.update_status(db, id, status)
    return ResponseSchema()


@router.get("/search")
async def list_units(params: SearchSchema = Depends(), db: AsyncSession = Database):
    """获取课程单元列表"""
    data = await CourseUnitService.search(db, params)
    return ResponseSchema(data=data)


@router.get("/{id}/knowledges")
async def get_knowledges(id: int, db: AsyncSession = Database):
    """获取PDF处理状态"""
    data = await KnowledgeService.get_by_unit(db, id)
    return ResponseSchema(data=data)


@router.get("/{id}/questions")
async def get_questions(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    """获取PDF处理状态"""
    data = await QuestionService.get_by_unit(db, id, page, size)
    return ResponseSchema(data=data)


@router.get("/{unit_id}")
async def get_unit(unit_id: int, db: AsyncSession = Database):
    """获取单个课程单元"""
    unit = await CourseUnitService.get_by_id(db=db, unit_id=unit_id)
    return ResponseSchema(data=unit)
