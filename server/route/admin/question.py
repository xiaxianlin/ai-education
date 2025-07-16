from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.question import QuestionService
from schema import (
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSchema,
    QuestionSearchSchema
)
from store.database import AsyncSessionLocal

router = APIRouter(prefix="/questions", tags=["问题管理"])


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.post("", response_model=QuestionSchema, status_code=status.HTTP_201_CREATED)
async def create_question(
    question: QuestionCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    """创建问题"""
    try:
        new_question = await QuestionService.create(
            db=db,
            question_data=question
        )
        return new_question
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{question_id}", response_model=QuestionSchema)
async def get_question(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取单个问题"""
    question = await QuestionService.get_by_id(db=db, question_id=question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="问题不存在"
        )
    return question


@router.get("", response_model=dict)
async def list_questions(
    keyword: Optional[str] = Query(None, description="搜索关键词(内容)"),
    type: Optional[str] = Query(None, description="问题类型"),
    grade: Optional[int] = Query(None, description="年级(1-12)"),
    subject: Optional[str] = Query(None, description="科目"),
    knowledge_id: Optional[int] = Query(None, description="知识点ID"),
    course_unit_id: Optional[int] = Query(None, description="课程单元ID"),
    source: Optional[str] = Query(None, description="问题来源"),
    status: Optional[int] = Query(None, description="状态: 1-启用, 0-禁用"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页条数"),
    sort: str = Query("create_time", description="排序字段"),
    order: str = Query("desc", description="排序方式"),
    db: AsyncSession = Depends(get_db)
):
    """获取问题列表"""
    search_data = QuestionSearchSchema(
        current_page=page,
        page_size=size,
        keywords=keyword,
        type=type,
        grade=grade,
        subject=subject,
        knowledge_id=knowledge_id,
        course_unit_id=course_unit_id,
        source=source,
        status=status,
        sort=sort,
        order=order
    )
    questions, total = await QuestionService.search(
        db=db,
        search_data=search_data
    )
    
    return {
        "items": questions,
        "total": total,
        "page": search_data.current_page,
        "size": search_data.page_size
    }


@router.get("/knowledge/{knowledge_id}", response_model=List[QuestionSchema])
async def get_questions_by_knowledge(
    knowledge_id: int,
    status: Optional[int] = Query(None, description="状态: 1-启用, 0-禁用"),
    db: AsyncSession = Depends(get_db)
):
    """根据知识点获取问题列表(全量获取)"""
    questions = await QuestionService.get_by_knowledge(
        db=db,
        knowledge_id=knowledge_id,
        status=status
    )
    return questions


@router.get("/course-unit/{course_unit_id}", response_model=SearchSchema)
async def get_questions_by_course_unit(
    course_unit_id: int,
    status: Optional[int] = Query(None, description="状态: 1-启用, 0-禁用"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页条数"),
    db: AsyncSession = Depends(get_db)
):
    """根据课程单元获取问题列表"""
    questions, total = await QuestionService.get_by_course_unit(
        db=db,
        course_unit_id=course_unit_id,
        page=page,
        size=size,
        status=status
    )
    
    return {
        "items": questions,
        "total": total,
        "page": page,
        "size": size
    }


@router.put("/{question_id}", response_model=QuestionSchema)
async def update_question(
    question_id: str,
    question_update: QuestionUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    """更新问题"""
    question = await QuestionService.update(
        db=db,
        question_id=question_id,
        question_data=question_update
    )
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="问题不存在"
        )
    
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    db: AsyncSession = Depends(get_db)
):
    """删除问题"""
    success = await QuestionService.delete(db=db, question_id=question_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="问题不存在"
        )