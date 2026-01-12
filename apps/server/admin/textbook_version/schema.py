"""
教材版本相关 Schema
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS


class SaveTextbookVersionSchema(BaseModel):
    """创建/更新教材版本请求"""

    subject: str = Field(description="科目")
    name: str = Field(description="版本名称")
    revision_year: int = Field(description="修订年份")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("name")
    @classmethod
    def valid_name(cls, v):
        if not v or not v.strip():
            raise ValueError("版本名称不能为空")
        return v.strip()

    @field_validator("revision_year")
    @classmethod
    def valid_revision_year(cls, v):
        if v and (v < 2000 or v > 2100):
            raise ValueError("修订年份必须在2000-2100之间")
        return v


class TextbookVersionSchema(BaseModel):
    """教材版本信息"""

    id: int
    subject: str
    name: str
    revision_year: int
    is_enabled: int
    create_time: Optional[int] = None
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class SearchTextbookVersionSchema(BaseModel):
    """搜索教材版本"""

    subject: Optional[str] = None
