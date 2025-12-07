"""LLM API Schema"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class LLMGenerateRequest(BaseModel):
    """LLM 文本生成请求"""
    prompt: str = Field(description="提示词")
    model: str = Field(default="qwen3-max", description="模型名称")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="温度参数")
    max_tokens: int = Field(default=2000, description="最大 token 数")


class LLMGenerateResponse(BaseModel):
    """LLM 文本生成响应"""
    content: str = Field(description="生成的文本内容")
    model: str = Field(description="使用的模型")
    usage: Optional[Dict[str, int]] = Field(default=None, description="Token 使用情况")


class LLMStructuredRequest(BaseModel):
    """LLM 结构化输出请求"""
    prompt: str = Field(description="提示词")
    schema: Dict[str, Any] = Field(description="JSON Schema 定义")
    model: str = Field(default="qwen3-max", description="模型名称")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="温度参数")


class LLMStructuredResponse(BaseModel):
    """LLM 结构化输出响应"""
    result: Dict[str, Any] = Field(description="结构化结果")
    model: str = Field(description="使用的模型")

