from pydantic import BaseModel, Field
from typing import Optional


class KnowledgeCreate(BaseModel):
    course_unit_id: int = Field(..., description="课程单元ID")
    content: str = Field(..., description="知识点内容")
    analysis_text: Optional[str] = Field(default=None, description="分析文本")
    analysis_audio: Optional[str] = Field(default=None, description="分析音频文件地址")
    analysis_video: Optional[str] = Field(default=None, description="分析视频文件地址")


class KnowledgeUpdate(BaseModel):
    content: Optional[str] = Field(None, description="知识点内容")
    analysis_text: Optional[str] = Field(None, description="分析文本")
    analysis_audio: Optional[str] = Field(None, description="分析音频文件地址")
    analysis_video: Optional[str] = Field(None, description="分析视频文件地址")
    status: Optional[int] = Field(None, description="状态: 1-启用, 0-禁用")


class KnowledgeResponse(BaseModel):
    id: str
    course_unit_id: int
    content: str
    analysis_text: Optional[str]
    analysis_audio: Optional[str]
    analysis_video: Optional[str]
    status: int
    create_time: int
    update_time: Optional[int]

    class Config:
        from_attributes = True


class KnowledgeListResponse(BaseModel):
    items: list[KnowledgeResponse]
    total: int
    page: int
    size: int