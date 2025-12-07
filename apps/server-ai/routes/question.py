"""题目生成路由"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from schemas.question import (
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    QuestionSchema,
)
from core.database import Database, Textbook, Unit
from question.graph import invoke_generate_workflow

router = APIRouter(prefix="/api/v1/question", tags=["Question"])


@router.post("/generate", response_model=QuestionGenerateResponse)
async def generate_questions(
    request: QuestionGenerateRequest,
    db: AsyncSession = Database,
):
    """生成题目（供 server-task 调用）"""
    try:
        # 获取教材
        textbook = await db.scalar(
            select(Textbook).where(Textbook.id == request.textbook_id)
        )
        if not textbook:
            raise ValueError(f"教材不存在: {request.textbook_id}")

        # 获取单元（如果需要）
        unit = None
        if request.unit_id:
            unit = await db.scalar(select(Unit).where(Unit.id == request.unit_id))
            if not unit:
                raise ValueError(f"单元不存在: {request.unit_id}")

        # 调用题目生成工作流
        questions = await invoke_generate_workflow(
            db=db,
            type=request.type,
            count=request.count,
            textbook=textbook,
            unit=unit,
            student_id=request.student_id,
        )

        return QuestionGenerateResponse(
            questions=[QuestionSchema.model_validate(q) for q in questions]
        )
    except Exception as e:
        logger.error(f"题目生成失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

