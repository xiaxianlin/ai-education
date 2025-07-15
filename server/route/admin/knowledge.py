from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.knowledge import KnowledgeService
from schema.admin.knowledge import (
    KnowledgeCreate, 
    KnowledgeUpdate, 
    KnowledgeResponse, 
    KnowledgeListResponse
)
from store.database import AsyncSessionLocal

router = APIRouter(prefix="/knowledges", tags=["知识点管理"])


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.post("", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    knowledge: KnowledgeCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建知识点"""
    try:
        new_knowledge = await KnowledgeService.create(
            db=db,
            course_unit_id=knowledge.course_unit_id,
            content=knowledge.content,
            analysis_text=knowledge.analysis_text,
            analysis_audio=knowledge.analysis_audio,
            analysis_video=knowledge.analysis_video
        )
        return new_knowledge
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
async def get_knowledge(
    knowledge_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取单个知识点"""
    knowledge = await KnowledgeService.get_by_id(db=db, knowledge_id=knowledge_id)
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="知识点不存在"
        )
    return knowledge


@router.get("", response_model=KnowledgeListResponse)
async def list_knowledges(
    course_unit_id: Optional[int] = Query(None, description="课程单元ID"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    status: Optional[int] = Query(None, description="状态: 1-启用, 0-禁用"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db)
):
    """获取知识点列表"""
    if keyword or (course_unit_id is None and keyword):
        knowledges, total = await KnowledgeService.search(
            db=db,
            keyword=keyword,
            course_unit_id=course_unit_id,
            page=page,
            size=size,
            status=status
        )
    elif course_unit_id:
        knowledges, total = await KnowledgeService.get_by_course_unit(
            db=db,
            course_unit_id=course_unit_id,
            page=page,
            size=size,
            status=status
        )
    else:
        knowledges, total = await KnowledgeService.search(
            db=db,
            page=page,
            size=size,
            status=status
        )
    
    return KnowledgeListResponse(
        items=knowledges,
        total=total,
        page=page,
        size=size
    )


@router.put("/{knowledge_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    knowledge_id: str,
    knowledge_update: KnowledgeUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新知识点"""
    knowledge = await KnowledgeService.update(
        db=db,
        knowledge_id=knowledge_id,
        content=knowledge_update.content,
        analysis_text=knowledge_update.analysis_text,
        analysis_audio=knowledge_update.analysis_audio,
        analysis_video=knowledge_update.analysis_video,
        status=knowledge_update.status
    )
    
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="知识点不存在"
        )
    
    return knowledge


@router.delete("/{knowledge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge(
    knowledge_id: str,
    db: AsyncSession = Depends(get_db)
):
    """删除知识点"""
    success = await KnowledgeService.delete(db=db, knowledge_id=knowledge_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="知识点不存在"
        )