from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS
from shared.core.schema import SearchSchema


class UpdateQuestionSchema(BaseModel):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    subtype: Optional[str] = None
    content: Optional[str] = None
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    knowledge: Optional[str] = None
    unit_id: Optional[int] = None
    textbook_id: Optional[int] = None


class CreateQuestionSchema(BaseModel):
    subject: str
    grade: int
    type: str
    subtype: str
    content: str
    options: Optional[str] = None
    answer: str
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    knowledge: Optional[str] = None
    unit_id: Optional[int] = None
    textbook_id: Optional[int] = None


class SearchQuestionSchema(SearchSchema):
    question_id: Optional[str] = None
    content: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    resource_type: Optional[str] = None
    resource_generated: Optional[bool] = None


class CreateQuestionTypeSchema(BaseModel):
    title: str = Field(..., description="题型标题，如：看图选词、根据首字母填空")
    scene: str = Field(..., description="类型，如：选择题、填空题、判断题、口语题、应用题")
    subject: str = Field(..., description="科目")
    grade: int = Field(..., description="年级")
    description: Optional[str] = Field(None, description="题型描述")
    resource_type: Optional[str] = Field(None, description="资源类型: image/audio")
    prompt: Optional[str] = Field(None, description="生成该题型的 AI 指令")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 7):
            raise ValueError("年级只能选择1-6")
        return v

    @field_validator("resource_type")
    @classmethod
    def valid_resource_type(cls, v):
        if v and v not in ["image", "audio"]:
            raise ValueError("资源类型只能选择 image 或 audio")
        return v


class UpdateQuestionTypeSchema(BaseModel):
    title: Optional[str] = None
    scene: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    prompt: Optional[str] = None  # 生成该题型的 AI 指令

    @field_validator("resource_type")
    @classmethod
    def valid_resource_type(cls, v):
        if v is not None and v not in ["image", "audio", ""]:
            raise ValueError("资源类型只能选择 image、audio 或空字符串")
        return v


class SearchQuestionTypeSchema(BaseModel):
    scene: Optional[str] = None  # 按类型筛选
    subject: Optional[str] = None
    grade: Optional[int] = None
