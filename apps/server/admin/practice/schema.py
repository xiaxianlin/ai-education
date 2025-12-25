from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS
from shared.core.schema import SearchSchema


class SavePracticeSchema(BaseModel):
    """保存练习"""

    name: str = Field(..., min_length=1, max_length=100, description="练习名称")
    slug: str = Field(..., min_length=1, max_length=100, description="练习标识")
    icon: Optional[str] = Field(None, max_length=255, description="图标URL")
    description: Optional[str] = Field(None, max_length=500, description="描述")
    type: str = Field(..., min_length=1, max_length=20, description="类型：system/custom")
    config: dict = {}  # 配置信息

    @field_validator("type")
    @classmethod
    def valid_type(cls, v):
        if v not in ["system", "custom"]:
            raise ValueError("类型只能是 system 或 custom")
        return v

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, v):
        if not v or not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("标识只能包含字母、数字、下划线和连字符")
        return v


class SearchPracticeSchema(SearchSchema):
    """搜索练习"""

    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None


class SavePracticePromptSchema(BaseModel):
    """保存练习提示词关联"""

    subject: str
    grade: int
    practice_slug: str
    prompt_slug: str

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 13):
            raise ValueError("非法年级")
        return v


class SearchPracticePromptSchema(SearchSchema):
    """搜索练习提示词关联"""

    subject: Optional[str] = None
    grade: Optional[int] = None
    prompt_slug: Optional[str] = None
    practice_slug: Optional[str] = None
