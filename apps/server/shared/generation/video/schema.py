"""Video Generation Schema

Type definitions and state models for video generation workflow.
"""

from enum import Enum
from typing import NotRequired, Optional, TypedDict
from pydantic import BaseModel, Field


class VideoGenerationType(str, Enum):
    """视频生成类型枚举"""

    CUSTOM = "custom"  # 自定义
    EDUCATION = "education"  # 教育类视频


class VideoGenerateRequest(BaseModel):
    """视频生成请求"""

    prompt: str = Field(description="视频生成提示词")
    duration: int = Field(default=5, description="视频时长（秒）")
    oss_path: Optional[str] = Field(None, description="OSS 存储路径")
    type: VideoGenerationType = Field(
        default=VideoGenerationType.CUSTOM, description="生成类型"
    )


class VideoGenerationState(TypedDict, total=False):
    """视频生成流程的状态"""

    # 视频生成提示词
    prompt: str
    # 视频时长（秒）
    duration: int
    # OSS 存储路径
    oss_path: NotRequired[str]
    # 生成类型
    type: NotRequired[str]
    # 生成的视频 URL（临时 URL）
    video_url: NotRequired[str]
    # 上传后的 OSS 路径
    final_path: NotRequired[str]
