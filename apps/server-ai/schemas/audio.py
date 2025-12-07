"""语音生成 API Schema"""
from pydantic import BaseModel, Field


class AudioTTSRequest(BaseModel):
    """文本转语音请求"""
    text: str = Field(description="要转换为语音的文本")
    voice: str = Field(default="Cherry", description="语音角色")
    language: str = Field(default="Chinese", description="语言")


class AudioTTSResponse(BaseModel):
    """文本转语音响应"""
    audio_url: str = Field(description="生成的音频 URL")

