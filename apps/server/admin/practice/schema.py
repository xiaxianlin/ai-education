from __future__ import annotations

from typing import Any, Optional

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


class PracticeParameterSchema(BaseModel):
    """练习参数配置 Schema"""

    key: str = Field(..., min_length=1, description="参数标识")
    type: str = Field(..., description="参数类型：system/input")
    description: str = Field(default="", description="参数描述")
    value: Any = Field(default=None, description="参数值（字符串格式）")
    required: bool = Field(default=False, description="是否必填")
    value_type: str = Field(..., description="值类型：string/number/object/array")

    @field_validator("type")
    @classmethod
    def valid_type(cls, v):
        if v not in ["system", "input"]:
            raise ValueError("参数类型只能是 system 或 input")
        return v

    @field_validator("value_type")
    @classmethod
    def valid_value_type(cls, v):
        if v not in ["string", "number", "object", "array"]:
            raise ValueError("值类型只能是 string、number、object 或 array")
        return v

    @field_validator("value")
    @classmethod
    def valid_value(cls, v, info):
        """验证 value 格式"""
        value_type = info.data.get("value_type")
        if not value_type:
            return v

        if value_type == "array" and not isinstance(v, list):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是列表")

        if value_type == "object" and not isinstance(v, dict):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是对象")

        if value_type == "number" and not isinstance(v, (int, float)):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是数字")

        if value_type == "string" and not isinstance(v, str):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是字符串")

        if value_type == "boolean" and not isinstance(v, bool):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是布尔值")

        return v


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
