from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")


class ResponseSchema(BaseModel, Generic[T]):
    status: int = 0
    message: str = "success"
    data: Optional[T] = None

    model_config = ConfigDict(extra="ignore", exclude_none=True)


class SearchSchema(BaseModel):
    page: Optional[int] = 1
    size: Optional[int] = 10


class SearchResultSchema(BaseModel, Generic[T]):
    total: int = 0
    data: list[T] = []


class ManagerSchema(BaseModel):
    id: str
    username: str
    type: int
    status: int
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class TextbookSchema(BaseModel):
    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: int = 0

    model_config = {"from_attributes": True}


class TeacherBookSchema(BaseModel):
    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None

    model_config = {"from_attributes": True}


class UnitSchema(BaseModel):
    id: int
    textbook_id: int
    name: str
    content: str
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class KnowledgeSchema(BaseModel):
    id: int
    textbook_id: int
    unit_id: int
    name: str
    content: str
    difficulty: Optional[str] = None
    importance: Optional[int] = 5
    order: Optional[int] = 0

    textbook: Optional["TextbookSchema"] = None
    unit: Optional["UnitSchema"] = None

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    id: str
    type: str
    subtype: Optional[str] = None
    subject: str
    grade: int
    content: str
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None

    unit: Optional["UnitSchema"] = None
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class QuestionTypeSchema(BaseModel):
    id: int
    title: str
    scene: str
    subject: str
    grade: int
    description: Optional[str] = None
    resource_type: Optional[str] = None
    prompt: Optional[str] = None
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


#### ================================= 分割线 ================================= ####


class StudentSchema(BaseModel):
    id: str
    name: str = ""
    phone: str
    grade: int
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentTextbookSchema(BaseModel):
    id: int
    student_id: str
    textbook_id: int
    active: int = 0

    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class StudentPracticeSchema(BaseModel):
    id: int
    student_id: str
    practice_id: int

    practice: Optional["PracticeSchema"] = None

    model_config = {"from_attributes": True}


# ======================== 练习管理 ======================== #


class PracticeSchema(BaseModel):
    """练习 Schema"""

    id: int
    name: str
    type: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    parameters: list = Field(default_factory=list, description="参数列表")
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class PracticeParameterSchema(BaseModel):
    """练习参数配置 Schema"""

    key: str = Field(..., description="参数标识")
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


class PracticePromptSchema(BaseModel):
    """练习提示词关联 Schema"""

    id: int
    subject: str
    grade: int
    practice_slug: str
    prompt_slug: str
    create_time: int
    update_time: int

    practice: Optional["PracticeSchema"] = None
    prompt: Optional["PromptSchema"] = None

    model_config = {"from_attributes": True}


class PracticeSessionSchema(BaseModel):
    id: int
    student_id: str
    practice_id: int
    practice_slug: str
    parameters: dict = Field(default_factory=dict, description="练习参数")
    question_count: int = 0
    answer_count: int = 0
    correct_count: int = 0
    status: int = 0  # 会话状态: 0-未开始, 1-进行中, 2-已完成
    generate_status: int = 0  # 生成状态: 0-失败, 1-生成中, 2-成功
    start_time: int
    end_time: Optional[int] = None
    create_time: int
    update_time: Optional[int] = None

    textbook_id: Optional[int] = None
    unit_id: Optional[int] = None

    model_config = {"from_attributes": True}


class PracticeSessionAnswerSchema(BaseModel):
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
    audio_answer: Optional[str] = None
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

    model_config = {"from_attributes": True}


class PracticeSessionReportSchema(BaseModel):
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
    questions: list[QuestionSchema]
    answers: list[PracticeSessionAnswerSchema]
    report: Optional[PracticeSessionReportSchema] = None

    model_config = {"from_attributes": True}


# ======================== Prompt 管理 ======================== #


class PromptVersionSchema(BaseModel):
    id: int
    prompt_id: int
    template_content: str
    negative_content: Optional[str] = None
    model_params: dict = {}
    changelog: Optional[str] = None
    is_published: int = 0

    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class PromptSchema(BaseModel):
    id: int
    name: str
    slug: str
    type: str
    description: Optional[str] = None
    current_version_id: Optional[int] = None

    version: Optional["PromptVersionSchema"] = None

    model_config = {"from_attributes": True}
