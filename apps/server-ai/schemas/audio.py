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


class AudioAnalysisResponse(BaseModel):
    """音频理解响应"""

    recognized_text: str = Field(description="用户说的内容（转写文本）")
    match: bool = Field(description="是否匹配题目要求")
    analysis: str = Field(description="综合分析文本（同时包含原因说明和改进建议）")
