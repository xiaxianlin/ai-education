"""
练习相关 Schema
"""

from typing import TYPE_CHECKING, Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

if TYPE_CHECKING:
    from .question import QuestionSchema


class QuestionTypeConfigItem(BaseModel):
    """题型配置项"""

    question_type_id: Optional[int] = None
    question_type_code: str
    count: int
    difficulty: Optional[str] = None
    description: Optional[str] = None


class TemplateVariableSchema(BaseModel):
    """模板变量"""

    key: str
    name: str
    type: str = "input"  # input/select/range/multiselect
    required: bool = False
    default_value: Optional[Any] = None
    options: Optional[List[Dict[str, Any]]] = None
    options_source: Optional[str] = None  # units/textbooks/knowledge_points/custom


class PracticeSchema(BaseModel):
    """练习 Schema

    练习类型 (practice_type):
    - ability_practice: 能力练习 - 基于原子能力 code 列表生成
    - unit_practice: 单元练习 - 基于单元 ID 生成

    生成状态 (generate_status):
    - 0: 生成中
    - 1: 已完成
    - -1: 生成失败
    """

    id: str = Field(..., description="会话ID (UUID v4)")
    student_id: str
    practice_type: str = Field(..., description="练习类型: ability_practice/unit_practice")
    subject: Optional[str] = Field(None, description="科目")
    grade: Optional[int] = Field(None, description="年级")
    ability_code: Optional[str] = Field(None, description="原子能力代码")
    unit_id: Optional[int] = Field(None, description="单元ID")
    question_count: int = 0
    answer_count: int = 0
    correct_count: int = 0
    status: int = 0  # 会话状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: int = 0  # 生成状态: 0-生成中, 1-已完成, -1-生成失败
    generate_time: Optional[int] = None
    start_time: int
    end_time: Optional[int] = None
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class PracticeAnswerSchema(BaseModel):
    """答题记录 Schema"""

    id: int
    session_id: str = Field(..., description="会话ID (UUID v4)")
    question_id: str
    student_id: str
    question_order: int

    # 题目相关信息（冗余存储）
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None
    textbook_id: Optional[int] = None

    # 答题信息
    text_answer: Optional[str] = None
    status: int = 0  # 答题状态: 0-未答 1-正确 2-错误
    time_spent: int = 0
    submit_time: Optional[int] = None

    # 错题相关字段
    correct_answer: Optional[str] = None
    analysis: Optional[str] = None
    is_corrected: int = 0
    corrected_time: Optional[int] = None

    # 时间字段
    create_time: int
    update_time: Optional[int] = None

    question: Optional["QuestionSchema"] = None

    model_config = {"from_attributes": True}


class PracticeReportSchema(BaseModel):
    """练习报告 Schema"""

    id: int
    session_id: str = Field(..., description="会话ID (UUID v4)")
    student_id: str
    total_questions: int = 0
    correct_questions: int = 0
    total_time: int = 0
    overall_score: float = 0.0
    current_ability: float = 0.0
    confidence: float = 0.0
    ability_level: str = ""
    percentile: int = 0
    knowledge_scores: str = "{}"
    question_distribution: str = "{}"
    ability_breakdown: str = "{}"
    learning_speed: float = 0.0
    consistency: float = 0.0
    strengths: str = "[]"
    weaknesses: str = "[]"
    recommendations: str = "[]"
    create_time: int


class PracticeDataSchema(BaseModel):
    """练习数据"""

    session: PracticeSchema
    questions: list["QuestionSchema"]
    answers: list[PracticeAnswerSchema]
    report: Optional[PracticeReportSchema] = None

    model_config = {"from_attributes": True}


class PracticeParameterSchema(BaseModel):
    """练习参数配置 Schema"""

    key: str = Field(..., description="参数标识")
    description: str = Field(default="", description="参数描述")
    required: bool = Field(default=False, description="是否必填")
    value_type: str = Field(..., description="值类型：string/number/object/array/boolean")
    value: Optional[Any] = Field(default=None, description="参数值")

    @field_validator("value_type")
    @classmethod
    def valid_value_type(cls, v):
        if v not in ["string", "number", "object", "array", "boolean"]:
            raise ValueError("值类型只能是 string、number、object、array 或 boolean")
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


__all__ = [
    "QuestionTypeConfigItem",
    "TemplateVariableSchema",
    "PracticeSchema",
    "PracticeAnswerSchema",
    "PracticeReportSchema",
    "PracticeDataSchema",
    "PracticeParameterSchema",
]
