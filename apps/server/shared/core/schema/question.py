"""
题型与题目 Schema
"""

from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


# ==================== 基础结构 Schema ====================


class ResourceSchema(BaseModel):
    """资源结构"""

    type: str = Field(..., description="资源类型：image, audio, video")
    url: str = Field(..., description="资源URL")
    alt: Optional[str] = Field(None, description="替代文本")


class MediaContextSchema(BaseModel):
    """媒体配置"""

    types: List[str] = Field(
        default_factory=list, description="支持的媒体类型：text, image, audio, video"
    )
    configs: Optional[Dict[str, Any]] = None


class ScaffoldingConfigSchema(BaseModel):
    """脚手架配置"""

    mode: Optional[str] = Field(None, description="选择模式：single, multiple")
    hints: Optional[List[Dict[str, Any]]] = None
    templates: Optional[List[str]] = None
    config: Optional[Dict[str, Any]] = None


class RubricSchema(BaseModel):
    """评价量表项"""

    dimension: str = Field(..., description="评价维度")
    max_score: float = Field(..., description="最高分值")
    description: Optional[str] = Field(None, description="评分标准描述")


class EvaluationConfigSchema(BaseModel):
    """评估与答案配置"""

    mode: str = Field(..., description="评估模式：auto_match, ai_analysis")
    correct_answer: Optional[Any] = Field(None, description="正确答案参考")
    rubrics: Optional[List[RubricSchema]] = Field(None, description="评分量表（主观题）")
    config: Optional[Dict[str, Any]] = None


class OptionSchema(BaseModel):
    """选项结构"""

    id: str = Field(..., description="选项ID，如 A, B, C, D")
    text: Optional[str] = Field(None, description="选项文本")
    resource: Optional[ResourceSchema] = Field(None, description="选项资源")
    is_correct: Optional[bool] = Field(None, description="是否为正确选项")


class ContentSchema(BaseModel):
    """题目内容结构"""

    stem: str = Field(..., description="题干文本")
    resource: Optional[ResourceSchema] = Field(None, description="题干资源")
    options: Optional[List[OptionSchema]] = Field(None, description="选项列表")
    sub_questions: Optional["ContentSchema"] = Field(None, description="子题列表（复合题）")


# ==================== 核心模型 Schema ====================


class QuestionTypeSchema(BaseModel):
    """题型配置 Schema"""

    id: int
    code: str
    name: str
    description: Optional[str] = None

    # 分类与学科
    category: str = Field(..., description="题型分类: ability_practice / unit_practice")
    subject: Optional[str] = None
    grade_band: Optional[str] = None

    # 能力关联
    ability_code: Optional[str] = None

    # 配置信息
    media_context: Optional[MediaContextSchema] = None
    scaffolding_config: Optional[ScaffoldingConfigSchema] = None
    evaluation_config: Optional[EvaluationConfigSchema] = None

    # AI 生成指令
    prompt: Optional[str] = None

    # 时间戳
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    """题目 Schema"""

    id: str

    # 题型关联
    question_type_code: str

    # 基础信息
    subject: str
    grade: int

    # 能力关联
    ability_code: Optional[str] = None

    # 题目内容与资源
    content: ContentSchema

    # 答案与解析
    answer: Dict[str, Any] = Field(..., description="实际答案内容")
    explanation: Optional[str] = None

    # 时间戳
    create_time: int
    update_time: int

    # 关联关系
    question_type: Optional[QuestionTypeSchema] = None

    model_config = {"from_attributes": True}


__all__ = [
    "QuestionTypeSchema",
    "QuestionSchema",
    "MediaContextSchema",
    "ScaffoldingConfigSchema",
    "EvaluationConfigSchema",
    "ContentSchema",
    "ResourceSchema",
]
