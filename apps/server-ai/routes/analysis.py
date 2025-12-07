"""答题分析路由"""

from fastapi import APIRouter, HTTPException
from loguru import logger

from schemas.analysis import AnswerAnalysisRequest, AnswerAnalysisResponse
from services import analysis

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/answer", response_model=AnswerAnalysisResponse)
async def analyze_answer(request: AnswerAnalysisRequest):
    """分析答题情况"""
    try:
        result = await analysis.analyze_answer(
            content=request.content,
            options=request.options,
            knowledge=request.knowledge,
            question_answer=request.question_answer,
            student_answer=request.student_answer,
            model_name=request.model_name,
            temperature=request.temperature,
        )

        return AnswerAnalysisResponse(
            is_correct=result["is_correct"],
            analysis=result["analysis"],
        )
    except Exception as e:
        logger.error(f"答题分析失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report", response_model=AnswerAnalysisResponse)
async def analyze_report(request: AnswerAnalysisRequest):
    """分析练习报告"""
    # TODO: 实现分析练习报告
    pass
