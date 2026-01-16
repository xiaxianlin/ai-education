"""
题型与题目 Schema
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

# ==================== 基础结构 Schema ====================


class ResourceSchema(BaseModel):
    """资源结构"""

    type: str = Field(..., description="资源类型：image, audio, video")
    url: str = Field(..., description="资源URL")
    alt: Optional[str] = Field(None, description="替代文本")


class OptionSchema(BaseModel):
    """选项结构"""

    id: str = Field(..., description="选项ID，如 A, B, C, D")
    text: Optional[str] = Field(None, description="选项文本")
    resource: Optional[ResourceSchema] = Field(None, description="选项资源")
    is_correct: Optional[bool] = Field(None, description="是否为正确选项")


class QuestionContentSchema(BaseModel):
    """内容结构"""

    stem: str = Field(..., description="题干文本")
    resource: Optional[ResourceSchema] = Field(None, description="题干资源")
    options: Optional[List[OptionSchema]] = Field(None, description="选项列表")
    sub_questions: Optional["QuestionContentSchema"] = Field(None, description="子题列表（复合题）")


class RubricSchema(BaseModel):
    """评价量表项"""

    dimension: str = Field(..., description="评价维度")
    max_score: float = Field(..., description="最高分值")
    description: Optional[str] = Field(None, description="评分标准描述")


class QuestionAnswerSchema(BaseModel):
    """
    问题答案结构

    value: 学生答案内容，可以是字符串、数字、列表或字典，具体取决于题型
    correct_value: 正确答案参考，可以是字符串、数字、列表或字典，具体取决于题型
    analysis_mode: 答案解析模式，取值可以为 "objective"（客观题）或 "subjective"（主观题）
    explanation: 答案解析文本，提供对答案的详细解释
    rubrics: 评分量表列表，仅适用于主观题，包含多个 RubricSchema 项目
    configs: 其他配置项，存储与答案相关的额外配置信息
    """

    value: Any = Field(..., description="学生答案内容")
    correct_value: Optional[Any] = Field(None, description="正确答案参考")
    analysis_mode: str = Field(..., description="答案解析模式：objective, subjective")
    explanation: Optional[str] = Field(None, description="答案解析")
    rubrics: Optional[List[RubricSchema]] = Field(None, description="评分量表（主观题）")
    configs: Optional[Dict[str, Any]] = None


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

    # 能力关联
    ability_code: Optional[str] = None

    # 配置信息
    configs: Optional[Dict[str, Any]] = None

    # 时间戳
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    """题目 Schema"""

    id: str

    # 题型关联
    question_type_code: str
    # 科目
    subject: str
    # 年级
    grade: int
    # 题目配置
    content: QuestionContentSchema
    # 答案配置
    answer: QuestionAnswerSchema
    # 难度
    difficulty: Optional[str] = None

    create_time: int
    update_time: int

    # 关联关系
    question_type: Optional[QuestionTypeSchema] = None

    model_config = {"from_attributes": True}


__all__ = [
    "QuestionTypeSchema",
    "QuestionSchema",
    "ResourceSchema",
    "OptionSchema",
    "QuestionContentSchema",
    "QuestionAnswerSchema",
    "RubricSchema",
]
