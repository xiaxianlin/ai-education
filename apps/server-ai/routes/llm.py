"""LLM 路由"""
from fastapi import APIRouter, HTTPException
from loguru import logger

from schemas.llm import (
    LLMGenerateRequest,
    LLMGenerateResponse,
    LLMStructuredRequest,
    LLMStructuredResponse,
)
from services.llm_service import LLMService

router = APIRouter(prefix="/api/v1/llm", tags=["LLM"])


@router.post("/generate", response_model=LLMGenerateResponse)
async def generate_text(request: LLMGenerateRequest):
    """生成文本"""
    try:
        content = await LLMService.generate_text(
            prompt_text=request.prompt,
            model_name=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        
        return LLMGenerateResponse(
            content=content,
            model=request.model,
        )
    except Exception as e:
        logger.error(f"文本生成失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/structured", response_model=LLMStructuredResponse)
async def generate_structured(request: LLMStructuredRequest):
    """结构化输出"""
    try:
        result = await LLMService.generate_structured(
            prompt_text=request.prompt,
            schema=request.schema,
            model_name=request.model,
            temperature=request.temperature,
        )
        
        return LLMStructuredResponse(
            result=result,
            model=request.model,
        )
    except Exception as e:
        logger.error(f"结构化输出失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

