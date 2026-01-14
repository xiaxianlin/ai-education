"""
题型系统 Pydantic Schema

包含请求/响应的数据验证和序列化定义
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS
from shared.core.schema import (
    ContentSchema,
    EvaluationConfigSchema,
    MediaContextSchema,
    ScaffoldingConfigSchema,
    SearchSchema,
)

# ============ 题型 Schema ============


class QuestionTypeCreateSchema(BaseModel):
    """创建题型"""

    code: str = Field(..., description="题型编码，如 pinyin_choice")
    name: str = Field(..., description="题型名称，如 看图选拼音")
    description: Optional[str] = Field(default=None, description="题型描述")
    subject: str = Field(..., description="科目")
    category: str = Field(..., description="题型分类: ability_practice / unit_practice")
    grade_band: Optional[str] = Field(default=None, description="学段: Low/Mid/High")
    ability_code: Optional[str] = Field(default=None, description="关联能力代码")
    media_context: Optional[MediaContextSchema] = Field(default=None, description="媒体配置")
    scaffolding_config: Optional[ScaffoldingConfigSchema] = Field(default=None, description="脚手架配置")
    evaluation_config: Optional[EvaluationConfigSchema] = Field(default=None, description="评估配置")
    prompt: Optional[str] = Field(default=None, description="AI生成指令")

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v):
        if v not in SUBJECTS:
            raise ValueError(f"科目必须是 {SUBJECTS} 之一")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v not in ["ability_practice", "unit_practice"]:
            raise ValueError("题型分类必须是 ability_practice 或 unit_practice")
        return v

    @field_validator("grade_band")
    @classmethod
    def validate_grade_band(cls, v):
        if v is not None and v not in ["Low", "Mid", "High"]:
            raise ValueError("学段必须是 Low、Mid 或 High")
        return v


class QuestionTypeUpdateSchema(BaseModel):
    """更新题型"""

    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    grade_band: Optional[str] = None
    ability_code: Optional[str] = None
    media_context: Optional[MediaContextSchema] = None
    scaffolding_config: Optional[ScaffoldingConfigSchema] = None
    evaluation_config: Optional[EvaluationConfigSchema] = None
    prompt: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v is not None and v not in ["ability_practice", "unit_practice"]:
            raise ValueError("题型分类必须是 ability_practice 或 unit_practice")
        return v

    @field_validator("grade_band")
    @classmethod
    def validate_grade_band(cls, v):
        if v is not None and v not in ["Low", "Mid", "High"]:
            raise ValueError("学段必须是 Low、Mid 或 High")
        return v


class QuestionTypeSearchSchema(SearchSchema):
    """搜索题型"""

    subject: Optional[str] = None
    category: Optional[str] = None
    grade_band: Optional[str] = None
    ability_code: Optional[str] = None


# ============ 题目 Schema ============


class QuestionCreateSchema(BaseModel):
    """创建题目"""

    id: Optional[str] = Field(default=None, description="题目ID，不传则自动生成UUID")
    question_type_code: str = Field(..., description="题型编码")
    subject: str = Field(..., description="科目")
    grade: int = Field(..., description="年级 1-12")
    ability_code: Optional[str] = Field(default=None, description="能力代码")
    content: Dict[str, Any] = Field(..., description="题目内容（包含题干、选项、资源等）")
    answer: Dict[str, Any] = Field(..., description="答案配置")
    explanation: Optional[str] = Field(default=None, description="解析")

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


class QuestionUpdateSchema(BaseModel):
    """更新题目"""

    content: Optional[Dict[str, Any]] = Field(default=None, description="题目内容（包含题干、选项、资源等）")
    answer: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None
    ability_code: Optional[str] = None


class QuestionSearchSchema(SearchSchema):
    """搜索题目"""

    id: Optional[str] = Field(default=None, description="题目ID（精确匹配）")
    name: Optional[str] = Field(default=None, description="题目名称（题干文本，模糊匹配）")
    question_type_code: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    ability_code: Optional[str] = None


class QuestionBatchDeleteSchema(BaseModel):
    """批量删除题目"""

    ids: List[str] = Field(..., description="题目ID列表", min_length=1)


class QuestionBatchUpdateSchema(BaseModel):
    """批量更新题目"""

    ids: List[str] = Field(..., description="题目ID列表", min_length=1)
    # TODO: 如需批量更新功能，需要重新设计（原 is_active 字段已删除）


class QuestionGenerateSchema(BaseModel):
    """生成题目请求"""

    count: int = Field(..., description="生成数量", gt=0, le=100)


class QuestionTypePromptUpdateSchema(BaseModel):
    """更新题型提示词请求"""

    prompt: str = Field(..., description="AI生成指令")
