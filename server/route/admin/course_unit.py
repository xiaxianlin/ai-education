from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.course_unit import CourseUnitService
from schema.admin.course_unit import (
    CourseUnitCreate, 
    CourseUnitUpdate, 
    CourseUnitResponse, 
    CourseUnitListResponse
)
from store.database import AsyncSessionLocal

router = APIRouter(prefix="/course-units", tags=["课程单元管理"])


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.post("", response_model=CourseUnitResponse, status_code=status.HTTP_201_CREATED)
async def create_course_unit(
    unit: CourseUnitCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建课程单元"""
    try:
        new_unit = await CourseUnitService.create(
            db=db,
            textbook_id=unit.textbook_id,
            name=unit.name,
            content=unit.content
        )
        return new_unit
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{unit_id}", response_model=CourseUnitResponse)
async def get_course_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取单个课程单元"""
    unit = await CourseUnitService.get_by_id(db=db, unit_id=unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程单元不存在"
        )
    return unit


@router.get("", response_model=CourseUnitListResponse)
async def list_course_units(
    textbook_id: Optional[int] = Query(None, description="教材ID"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    status: Optional[int] = Query(None, description="状态: 1-启用, 0-禁用"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db)
):
    """获取课程单元列表"""
    if keyword or (textbook_id is None and keyword):
        units, total = await CourseUnitService.search(
            db=db,
            keyword=keyword,
            textbook_id=textbook_id,
            page=page,
            size=size,
            status=status
        )
    elif textbook_id:
        units, total = await CourseUnitService.get_by_textbook(
            db=db,
            textbook_id=textbook_id,
            page=page,
            size=size,
            status=status
        )
    else:
        units, total = await CourseUnitService.search(
            db=db,
            page=page,
            size=size,
            status=status
        )
    
    return CourseUnitListResponse(
        items=units,
        total=total,
        page=page,
        size=size
    )


@router.put("/{unit_id}", response_model=CourseUnitResponse)
async def update_course_unit(
    unit_id: int,
    unit_update: CourseUnitUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新课程单元"""
    unit = await CourseUnitService.update(
        db=db,
        unit_id=unit_id,
        name=unit_update.name,
        content=unit_update.content,
        status=unit_update.status
    )
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程单元不存在"
        )
    
    return unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_db)
):
    """删除课程单元"""
    success = await CourseUnitService.delete(db=db, unit_id=unit_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程单元不存在"
        )