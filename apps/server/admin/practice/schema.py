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


class SavePracticePromptSchema(BaseModel):
    """保存练习提示词配置"""

    # 基础信息
    name: Optional[str] = Field(None, max_length=100, description="配置名称")
    code: Optional[str] = Field(None, max_length=100, description="配置编码")
    description: Optional[str] = Field(None, description="配置描述")

    # 场景分类
    scene_type: Optional[str] = Field(None, description="场景类型")
    specialty_type: Optional[str] = Field(None, description="专项类型")

    # 适用范围
    subject: str = Field(..., description="科目")
    stages: List[str] = Field(default_factory=list, description="适用学段列表")
    grades: List[int] = Field(default_factory=list, description="适用年级列表")
    semesters: Optional[List[str]] = Field(None, description="适用学期列表")

    # 关联
    practice_id: Optional[int] = Field(None, description="关联练习ID")
    practice_slug: Optional[str] = Field(None, description="练习标识（兼容）")
    prompt_id: Optional[int] = Field(None, description="关联提示词ID")
    prompt_slug: Optional[str] = Field(None, description="提示词标识（兼容）")

    # 配置
    question_type_configs: List[Dict[str, Any]] = Field(
        default_factory=list, description="题型组合配置"
    )
    difficulty_config: Optional[Dict[str, Any]] = Field(None, description="难度配置")
    question_count_config: Optional[Dict[str, Any]] = Field(None, description="题量配置")
    template_variables: Optional[List[Dict[str, Any]]] = Field(None, description="模板变量定义")

    # 元数据
    sort_order: int = Field(default=0, description="排序")
    is_active: bool = Field(default=True, description="是否启用")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择 {'、'.join(SUBJECTS)}")
        return v

    @field_validator("scene_type")
    @classmethod
    def valid_scene_type(cls, v):
        if v and v not in SCENE_TYPES:
            raise ValueError(f"场景类型只能选择 {'、'.join(SCENE_TYPES)}")
        return v

    @field_validator("specialty_type")
    @classmethod
    def valid_specialty_type(cls, v, info):
        if not v:
            return v
        # 如果有科目信息，验证专项类型是否属于该科目
        subject = info.data.get("subject")
        if subject and subject in SPECIALTY_TYPES_BY_SUBJECT:
            valid_types = SPECIALTY_TYPES_BY_SUBJECT[subject]
            if v not in valid_types:
                raise ValueError(f"该科目下的专项类型只能选择 {'、'.join(valid_types)}")
        return v

    @field_validator("grades")
    @classmethod
    def valid_grades(cls, v):
        if v:
            for grade in v:
                if grade not in range(1, 13):
                    raise ValueError("非法年级，年级范围为 1-12")
        return v


class SearchPracticePromptSchema(SearchSchema):
    """搜索练习提示词配置"""

    subject: Optional[str] = None
    scene_type: Optional[str] = None
    specialty_type: Optional[str] = None
    practice_id: Optional[int] = None
    practice_slug: Optional[str] = None
    prompt_id: Optional[int] = None
    prompt_slug: Optional[str] = None
    is_active: Optional[bool] = None
