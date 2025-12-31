"""
提示词优化 Schema
"""

from typing import Optional

from pydantic import BaseModel, Field


class PromptOptimizeRequestSchema(BaseModel):
    """提示词优化请求"""

    code: str = Field(..., description="题型编码")
    suggestion: Optional[str] = Field(default=None, description="优化建议（可选）")


class PromptOptimizeResponseSchema(BaseModel):
    """提示词优化响应"""

    optimized_prompt: str = Field(..., description="优化后的提示词")
