"""
练习相关 Schema
"""

from typing import TYPE_CHECKING, Any, Dict, List, Optional

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .question import QuestionSchema


class PracticeSchema(BaseModel):
    """练习 Schema"""

    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None

    # 专项类型
    specialty_type: Optional[str] = None

    # 适用范围
    subject: Optional[str] = None
    stages: List[str] = Field(default_factory=list)
    grades: List[int] = Field(default_factory=list)

    # 配置
    question_count_config: Optional[Dict[str, Any]] = None
    difficulty_config: Optional[Dict[str, Any]] = None
    ability_config: Optional[Dict[str, Any]] = None
    feedback_config: Optional[Dict[str, Any]] = None
    parameter_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="参数配置")

    # 提示词
    prompt: Optional[str] = None

    # 元数据
    is_active: bool = True
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


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


class PracticeSessionSchema(BaseModel):
    """练习会话 Schema"""

    id: int
    student_id: str
    practice_id: int
    practice_slug: str
    parameters: dict = Field(default_factory=dict, description="练习参数")
    question_count: int = 0
    answer_count: int = 0
    correct_count: int = 0
    status: int = 0  # 会话状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: int = 0  # 生成状态: 0-未生成, 1-生成中, 2-已生成
    generate_time: Optional[int] = None
    start_time: int
    end_time: Optional[int] = None
    create_time: int
    update_time: Optional[int] = None

    textbook_id: Optional[int] = None
    unit_id: Optional[int] = None

    practice: Optional["PracticeSchema"] = None

    model_config = {"from_attributes": True}


class PracticeSessionAnswerSchema(BaseModel):
    """答题记录 Schema"""

    id: int
    session_id: int
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


class PracticeSessionReportSchema(BaseModel):
    """练习报告 Schema"""

    id: int
    session_id: int
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


class PracticeSessionDataSchema(BaseModel):
    """练习会话数据"""

    practice: PracticeSchema
    session: PracticeSessionSchema
    questions: list["QuestionSchema"]
    answers: list[PracticeSessionAnswerSchema]
    report: Optional[PracticeSessionReportSchema] = None

    model_config = {"from_attributes": True}


__all__ = [
    "PracticeSchema",
    "QuestionTypeConfigItem",
    "TemplateVariableSchema",
    "PracticeSessionSchema",
    "PracticeSessionAnswerSchema",
    "PracticeSessionReportSchema",
    "PracticeSessionDataSchema",
]
