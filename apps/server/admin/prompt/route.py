"""
提示词管理 API 路由
"""

from fastapi import APIRouter
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from admin.prompt.schema import (
    PromptOptimizeRequestSchema,
    PromptOptimizeResponseSchema,
)
from admin.prompt.services import question_type

prompt_router = APIRouter(prefix="/prompt", tags=["提示词管理"])


@prompt_router.post(
    "/optimize/question_type",
    summary="优化题型生成提示词",
    description="根据题型编码优化题型生成提示词，考虑题型的完整配置信息",
    response_model=PromptOptimizeResponseSchema,
)
async def optimize_prompt(params: PromptOptimizeRequestSchema, db: AsyncSession = Database):
    """优化题型生成提示词接口"""
    optimized_prompt = await question_type.optimize_question_type_prompt(db, params.code, params.suggestion)
    return PromptOptimizeResponseSchema(optimized_prompt=optimized_prompt)
