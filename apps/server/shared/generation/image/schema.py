"""Image Generation Schema

Type definitions and state models for image generation workflow.
"""

from enum import Enum
from typing import NotRequired, Optional, TypedDict
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession


class ImageGenerationType(str, Enum):
    """图片生成类型枚举"""

    QUESTION = "question"  # 题目配图
    TEXTBOOK = "textbook"  # 教材配图
    CUSTOM = "custom"  # 自定义


class ImageGenerateRequest(BaseModel):
    """图片生成请求"""

    prompt: str = Field(description="图片生成提示词")
    width: int = Field(default=1328, description="图片宽度")
    height: int = Field(default=1328, description="图片高度")
    optimize_prompt: bool = Field(default=True, description="是否优化提示词")
    oss_path: Optional[str] = Field(None, description="OSS 存储路径")
    type: ImageGenerationType = Field(
        default=ImageGenerationType.CUSTOM, description="生成类型"
    )


class ImageGenerationState(TypedDict, total=False):
    """图片生成流程的状态"""

    # 数据库会话（用于动态加载提示词）
    db: NotRequired[AsyncSession]
    # 原始提示词
    prompt: str
    # 优化后的提示词
    optimized_prompt: NotRequired[str]
    # 图片宽度
    width: int
    # 图片高度
    height: int
    # 是否优化提示词
    optimize_prompt: bool
    # OSS 存储路径
    oss_path: NotRequired[str]
    # 生成类型
    type: NotRequired[str]
    # 生成的图片 URL（临时 URL）
    image_url: NotRequired[str]
    # 上传后的 OSS 路径
    final_path: NotRequired[str]
