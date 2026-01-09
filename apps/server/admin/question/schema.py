"""
题型系统 Pydantic Schema

包含请求/响应的数据验证和序列化定义
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import (
    ANSWER_TYPES,
    COGNITIVE_LEVELS,
    DIFFICULTY_LEVELS,
    INTERACTION_TYPES,
    RESOURCE_TYPES,
    STAGES,
    SUBJECTS,
)
from shared.core.schema import SearchSchema

# ============ 题型 Schema ============


class QuestionTypeCreateSchema(BaseModel):
    """创建题型"""

    code: str = Field(..., description="题型编码，如 pinyin_choice")
    name: str = Field(..., description="题型名称，如 看图选拼音")
    description: Optional[str] = Field(default=None, description="题型描述")
    subject: str = Field(..., description="科目")
    stages: List[str] = Field(..., description="适用学段列表")
    grades: List[int] = Field(..., description="适用年级列表")
    interaction_type: str = Field(..., description="交互类型")
    interaction_config: Optional[Dict[str, Any]] = Field(default=None, description="交互配置")
    resource_type: str = Field(default="text", description="资源类型")
    resource_config: Optional[Dict[str, Any]] = Field(default=None, description="资源配置")
    answer_type: str = Field(..., description="答案类型")
    answer_config: Optional[Dict[str, Any]] = Field(default=None, description="答案配置")
    feedback_config: Optional[Dict[str, Any]] = Field(default=None, description="反馈配置")
    cognitive_levels: Optional[List[str]] = Field(default=None, description="认知层次列表")
    domain_code: Optional[str] = Field(default=None, description="关联的能力域代码")
    ability_atomic_codes: Optional[List[str]] = Field(default=None, description="关联的原子能力代码列表")
    difficulty: Optional[str] = Field(default=None, description="难度：easy/medium/hard")
    ai_prompt: Optional[str] = Field(default=None, description="AI生成指令")
    output_schema: Optional[Dict[str, Any]] = Field(default=None, description="AI输出Schema")
    sort_order: int = Field(default=0, description="排序")

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v):
        if v not in SUBJECTS:
            raise ValueError(f"科目必须是 {SUBJECTS} 之一")
        return v

    @field_validator("stages")
    @classmethod
    def validate_stages(cls, v):
        for stage in v:
            if stage not in STAGES:
                raise ValueError(f"学段必须是 {STAGES} 之一")
        return v

    @field_validator("grades")
    @classmethod
    def validate_grades(cls, v):
        for grade in v:
            if grade not in range(1, 13):
                raise ValueError("年级必须在 1-12 之间")
        return v

    @field_validator("interaction_type")
    @classmethod
    def validate_interaction_type(cls, v):
        if v not in INTERACTION_TYPES:
            raise ValueError(f"交互类型必须是 {INTERACTION_TYPES} 之一")
        return v

    @field_validator("resource_type")
    @classmethod
    def validate_resource_type(cls, v):
        if v not in RESOURCE_TYPES:
            raise ValueError(f"资源类型必须是 {RESOURCE_TYPES} 之一")
        return v

    @field_validator("answer_type")
    @classmethod
    def validate_answer_type(cls, v):
        if v not in ANSWER_TYPES:
            raise ValueError(f"答案类型必须是 {ANSWER_TYPES} 之一")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v):
        if v is not None and v not in DIFFICULTY_LEVELS:
            raise ValueError(f"难度必须是 {DIFFICULTY_LEVELS} 之一")
        return v

    @field_validator("cognitive_levels")
    @classmethod
    def validate_cognitive_levels(cls, v):
        if v is not None:
            for level in v:
                if level not in COGNITIVE_LEVELS:
                    raise ValueError(f"认知层次必须是 {COGNITIVE_LEVELS} 之一，当前值: {level}")
        return v


class QuestionTypeUpdateSchema(BaseModel):
    """更新题型"""

    name: Optional[str] = None
    description: Optional[str] = None
    stages: Optional[List[str]] = None
    grades: Optional[List[int]] = None
    interaction_config: Optional[Dict[str, Any]] = None
    resource_type: Optional[str] = None
    resource_config: Optional[Dict[str, Any]] = None
    answer_config: Optional[Dict[str, Any]] = None
    feedback_config: Optional[Dict[str, Any]] = None
    cognitive_levels: Optional[List[str]] = None
    domain_code: Optional[str] = None
    ability_atomic_codes: Optional[List[str]] = None
    difficulty: Optional[str] = None
    ai_prompt: Optional[str] = None
    output_schema: Optional[Dict[str, Any]] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("cognitive_levels")
    @classmethod
    def validate_cognitive_levels(cls, v):
        if v is not None:
            for level in v:
                if level not in COGNITIVE_LEVELS:
                    raise ValueError(f"认知层次必须是 {COGNITIVE_LEVELS} 之一，当前值: {level}")
        return v


class QuestionTypeSearchSchema(SearchSchema):
    """搜索题型"""

    subject: Optional[str] = None
    grade: Optional[int] = None
    interaction_type: Optional[str] = None


# ============ 题目 Schema ============


class QuestionCreateSchema(BaseModel):
    """创建题目"""

    id: Optional[str] = Field(default=None, description="题目ID，不传则自动生成UUID")
    question_type_id: int = Field(..., description="题型ID")
    question_type_code: str = Field(..., description="题型编码")
    subject: str = Field(..., description="科目")
    grade: int = Field(..., description="年级 1-12")
    stage: str = Field(..., description="学段")
    stem: Dict[str, Any] = Field(..., description="题干")
    options: Optional[List[Dict[str, Any]]] = Field(default=None, description="选项列表")
    blanks: Optional[List[Dict[str, Any]]] = Field(default=None, description="填空位置配置")
    resources: Optional[List[Dict[str, Any]]] = Field(default=None, description="资源列表")
    answer: Dict[str, Any] = Field(..., description="答案配置")
    explanation: Optional[str] = Field(default=None, description="解析")
    difficulty: str = Field(..., description="难度")
    cognitive_level: Optional[str] = Field(default=None, description="认知层次")
    knowledge_points: Optional[List[str]] = Field(default=None, description="知识点列表")
    ability_tags: Optional[List[str]] = Field(default=None, description="能力标签")
    source: str = Field(default="ai", description="来源")
    prompt_id: Optional[int] = Field(default=None, description="生成此题的Prompt ID")

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v):
        if v not in SUBJECTS:
            raise ValueError(f"科目必须是 {SUBJECTS} 之一")
        return v

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, v):
        if v not in range(1, 13):
            raise ValueError("年级必须在 1-12 之间")
        return v

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v):
        if v not in STAGES:
            raise ValueError(f"学段必须是 {STAGES} 之一")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v):
        if v not in DIFFICULTY_LEVELS:
            raise ValueError(f"难度必须是 {DIFFICULTY_LEVELS} 之一")
        return v


class QuestionUpdateSchema(BaseModel):
    """更新题目"""

    stem: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, Any]]] = None
    blanks: Optional[List[Dict[str, Any]]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    answer: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    cognitive_level: Optional[str] = None
    knowledge_points: Optional[List[str]] = None
    ability_tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class QuestionSearchSchema(SearchSchema):
    """搜索题目"""

    question_type_id: Optional[int] = None
    question_type_code: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    stage: Optional[str] = None
    difficulty: Optional[str] = None
    cognitive_level: Optional[str] = None
    source: Optional[str] = None
    is_active: Optional[bool] = None


class QuestionBatchDeleteSchema(BaseModel):
    """批量删除题目"""

    ids: List[str] = Field(..., description="题目ID列表", min_length=1)


class QuestionBatchUpdateSchema(BaseModel):
    """批量更新题目"""

    ids: List[str] = Field(..., description="题目ID列表", min_length=1)
    is_active: Optional[bool] = Field(default=None, description="是否启用")


class QuestionGenerateSchema(BaseModel):
    """生成题目请求"""

    count: int = Field(..., description="生成数量", gt=0, le=100)


class QuestionTypePromptUpdateSchema(BaseModel):
    """更新题型提示词请求"""

    ai_prompt: str = Field(..., description="AI生成指令")
