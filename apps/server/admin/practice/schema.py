from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SCENE_TYPES, SPECIALTY_TYPES_BY_SUBJECT, SUBJECTS
from shared.core.schema import SearchSchema


class SavePracticeSchema(BaseModel):
    """保存练习"""

    name: str = Field(..., min_length=1, max_length=100, description="练习名称")
    slug: str = Field(..., min_length=1, max_length=100, description="练习标识")
    icon: Optional[str] = Field(None, max_length=255, description="图标URL")
    description: Optional[str] = Field(None, max_length=500, description="描述")
    type: str = Field(..., min_length=1, max_length=20, description="类型：system/custom")

    # 场景类型
    scene_type: Optional[str] = Field(None, description="场景类型")

    # 适用范围
    subject: Optional[str] = Field(None, description="科目")
    stages: List[str] = Field(default_factory=list, description="适用学段列表")
    grades: List[int] = Field(default_factory=list, description="适用年级列表")

    # 配置
    question_count_config: Optional[Dict[str, Any]] = Field(None, description="题量配置")
    difficulty_config: Optional[Dict[str, Any]] = Field(None, description="难度配置")
    ability_config: Optional[Dict[str, Any]] = Field(None, description="能力维度配置")
    feedback_config: Optional[Dict[str, Any]] = Field(None, description="反馈配置")
    prompt: Optional[str] = Field(None, description="提示词模板内容")

    # 元数据
    sort_order: int = Field(default=0, description="排序")
    is_active: bool = Field(default=True, description="是否启用")

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

    @field_validator("scene_type")
    @classmethod
    def valid_scene_type(cls, v):
        if v and v not in SCENE_TYPES:
            raise ValueError(f"场景类型只能选择 {'、'.join(SCENE_TYPES)}")
        return v

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择 {'、'.join(SUBJECTS)}")
        return v


class SearchPracticeSchema(SearchSchema):
    """搜索练习"""

    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None
    scene_type: Optional[str] = None
    subject: Optional[str] = None
    is_active: Optional[bool] = None


