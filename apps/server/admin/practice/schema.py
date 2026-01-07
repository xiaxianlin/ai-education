from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS, get_ability_types_by_subject
from shared.core.schema import SearchSchema


class SavePracticeSchema(BaseModel):
    """保存练习"""

    name: str = Field(..., min_length=1, max_length=100, description="练习名称")
    slug: str = Field(..., min_length=1, max_length=100, description="练习标识")
    icon: Optional[str] = Field(None, max_length=255, description="图标URL")
    description: Optional[str] = Field(None, max_length=500, description="描述")

    # 专项类型
    specialty_type: Optional[str] = Field(None, description="专项训练类型")

    # 适用范围
    subject: Optional[str] = Field(None, description="科目")
    stages: List[str] = Field(default_factory=list, description="适用学段列表")
    grades: List[int] = Field(default_factory=list, description="适用年级列表")

    # 配置
    question_count_config: Optional[Dict[str, Any]] = Field(None, description="题量配置")
    difficulty_config: Optional[Dict[str, Any]] = Field(None, description="难度配置")
    ability_config: Optional[Dict[str, Any]] = Field(None, description="能力维度配置")
    feedback_config: Optional[Dict[str, Any]] = Field(None, description="反馈配置")
    parameter_config: Optional[List[Dict[str, Any]]] = Field(None, description="参数配置")
    prompt: Optional[str] = Field(None, description="提示词模板内容")
    is_active: bool = Field(default=True, description="是否启用")

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, v):
        if not v or not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("标识只能包含字母、数字、下划线和连字符")
        return v

    @field_validator("specialty_type")
    @classmethod
    def valid_specialty_type(cls, v):
        if v:
            # 检查是否在所有科目的能力类型中（使用能力类型验证）
            all_ability_types = []
            for subject in SUBJECTS:
                all_ability_types.extend(get_ability_types_by_subject(subject))
            if v not in all_ability_types:
                raise ValueError(f"专项类型无效，必须是有效的能力类型")
        return v

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择 {'、'.join(SUBJECTS)}")
        return v


class SearchPracticeSchema(SearchSchema):
    """搜索练习"""

    subject: Optional[str] = None
    grade: Optional[int] = None
