"""Audio Generation Schema

Type definitions and state models for audio generation workflow.
"""

from enum import Enum
from typing import NotRequired, Optional, TypedDict
from pydantic import BaseModel, Field


class AudioGenerationType(str, Enum):
    """音频生成类型枚举"""

    TTS = "tts"  # 文本转语音
    QUESTION = "question"  # 题目语音


class AudioGenerateRequest(BaseModel):
    """音频生成请求"""

    text: str = Field(description="要转换为语音的文本")
    voice: Optional[str] = Field(None, description="语音名称")
    language: str = Field(default="Chinese", description="语言类型")
    oss_path: Optional[str] = Field(None, description="OSS 存储路径")
    type: AudioGenerationType = Field(
        default=AudioGenerationType.TTS, description="生成类型"
    )


class AudioGenerationState(TypedDict, total=False):
    """音频生成流程的状态"""

    # 要转换为语音的文本
    text: str
    # 语音名称
    voice: NotRequired[str]
    # 语言类型
    language: str
    # OSS 存储路径
    oss_path: NotRequired[str]
    # 生成类型
    type: NotRequired[str]
    # 生成的音频 URL（临时 URL）
    audio_url: NotRequired[str]
    # 上传后的 OSS 路径
    final_path: NotRequired[str]
