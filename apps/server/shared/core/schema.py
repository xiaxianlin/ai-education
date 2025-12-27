from typing import Any, Generic, List, Optional, TypeVar, Dict

from pydantic import BaseModel, ConfigDict, Field, field_validator

from shared.core.constants import (
    Stage,
    InteractionType,
    CognitiveLevel,
    Difficulty,
    ResourceType,
    AnswerType,
)

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


class QuestionTypeSchema(BaseModel):
    """题型配置 Schema"""

    id: int
    code: str
    name: str
    description: Optional[str] = None

    # 适用范围
    subject: str
    stages: list = Field(default_factory=list)
    grades: list = Field(default_factory=list)

    # 交互配置
    interaction_type: str
    interaction_config: Optional[dict] = None

    # 资源配置
    resource_type: str = "none"
    resource_config: Optional[dict] = None

    # 答案配置
    answer_type: str
    answer_config: Optional[dict] = None

    # 反馈配置
    feedback_config: Optional[dict] = None

    # 认知与能力
    cognitive_levels: Optional[list] = None
    ability_dimensions: Optional[list] = None

    # AI生成
    ai_prompt: Optional[str] = None
    output_schema: Optional[dict] = None

    # 元数据
    sort_order: int = 0
    is_active: bool = True
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    """题目 Schema"""

    id: str

    # 题型关联
    question_type_id: int
    question_type_code: str

    # 基础信息
    subject: str
    grade: int
    stage: str

    # 教材关联
    textbook_id: Optional[int] = None
    unit_id: Optional[int] = None

    # 题目内容
    stem: dict
    options: Optional[list] = None
    blanks: Optional[list] = None

    # 资源
    resources: Optional[list] = None

    # 答案
    answer: dict
    explanation: Optional[str] = None

    # 难度与认知
    difficulty: str
    cognitive_level: Optional[str] = None

    # 知识点
    knowledge_points: Optional[list] = None
    ability_tags: Optional[list] = None

    # 来源
    source: str = "ai"
    prompt_id: Optional[int] = None

    # 统计
    usage_count: int = 0
    correct_rate: Optional[str] = None
    avg_time_spent: Optional[int] = None

    # 元数据
    is_active: bool = True
    create_time: int
    update_time: int

    # 关联关系
    question_type: Optional["QuestionTypeSchema"] = None
    textbook: Optional["TextbookSchema"] = None
    unit: Optional["UnitSchema"] = None

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


class PromptSchema(BaseModel):
    id: int
    name: str
    slug: str
    type: str
    description: Optional[str] = None
    template_content: str
    negative_content: Optional[str] = None
    model_params: dict = {}
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


# ======================== 题目结构 Schema ======================== #


class AnswerSchema(BaseModel):
    """答案结构"""

    type: str = Field(default="exact", description="答案类型：exact/fuzzy/rubric/ai/composite")
    correct_answers: Optional[List[str]] = Field(default=None, description="正确答案列表")
    accept_answers: Optional[List[str]] = Field(default=None, description="可接受答案")
    scoring: Optional[Dict[str, Any]] = Field(default=None, description="评分规则")
    rubric: Optional[Dict[str, Any]] = Field(default=None, description="评分标准（主观题）")


class SubStemSchema(BaseModel):
    """子题题干结构（简化版）"""

    text: str = Field(..., description="子题题干文本")
    rich_text: Optional[str] = Field(default=None, description="富文本题干")
    hints: Optional[List[str]] = Field(default=None, description="提示信息")


class OptionSchema(BaseModel):
    """选项结构"""

    id: str = Field(..., description="选项ID，如A/B/C/D")
    text: Optional[str] = Field(default=None, description="选项文本")
    image_url: Optional[str] = Field(default=None, description="选项图片")
    audio_url: Optional[str] = Field(default=None, description="选项音频")
    is_correct: bool = Field(default=False, description="是否正确答案")
    feedback: Optional[str] = Field(default=None, description="选择后的反馈")


class ResourceSchema(BaseModel):
    """资源结构"""

    id: str = Field(..., description="资源ID")
    type: str = Field(..., description="资源类型：none/image/audio/video/animation")
    url: str = Field(..., description="资源URL")
    alt: Optional[str] = Field(default=None, description="替代文本")
    position: str = Field(default="stem", description="位置：stem/option/background")
    size: Optional[Dict[str, int]] = Field(default=None, description="尺寸")
    style: Optional[Dict[str, Any]] = Field(default=None, description="样式")
    duration: Optional[int] = Field(default=None, description="时长（秒，音视频）")
    transcript: Optional[str] = Field(default=None, description="文字记录（音频）")


class SubQuestionSchema(BaseModel):
    """子题结构 - 用于复合题/应用题"""

    id: str = Field(..., description="子题ID，如 sub_1, sub_2")
    order: int = Field(..., description="显示顺序")
    stem: Dict[str, Any] = Field(..., description="子题题干")
    interaction_type: str = Field(..., description="子题交互类型")
    interaction_config: Optional[Dict[str, Any]] = Field(default=None, description="子题交互配置")
    options: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题选项（选择题）")
    resources: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题专属资源")
    answer: Dict[str, Any] = Field(..., description="子题答案")
    explanation: Optional[str] = Field(default=None, description="子题解析")


class StemSchema(BaseModel):
    """题干结构"""

    text: str = Field(..., description="纯文本题干")
    rich_text: Optional[str] = Field(default=None, description="富文本题干")
    audio_url: Optional[str] = Field(default=None, description="题干朗读音频")
    highlight_words: Optional[List[str]] = Field(default=None, description="高亮词汇")
    hints: Optional[List[str]] = Field(default=None, description="提示信息")
    sub_questions: Optional[List[Dict[str, Any]]] = Field(
        default=None, description="子题列表（复合题）"
    )


class FeedbackItemSchema(BaseModel):
    """反馈项"""

    sound: Optional[str] = Field(default=None, description="音效文件")
    animation: Optional[str] = Field(default=None, description="动画类型")
    messages: Optional[List[str]] = Field(default=None, description="反馈消息列表")
    points: Optional[int] = Field(default=None, description="得分")
    show_hint: Optional[bool] = Field(default=None, description="是否显示提示")
    max_attempts: Optional[int] = Field(default=None, description="最大尝试次数")


class FeedbackConfigSchema(BaseModel):
    """反馈配置"""

    correct: Optional[Dict[str, Any]] = Field(default=None, description="正确反馈")
    incorrect: Optional[Dict[str, Any]] = Field(default=None, description="错误反馈")
    partial: Optional[Dict[str, Any]] = Field(default=None, description="部分正确反馈")


# ======================== 题目模板 ======================== #


class QuestionTemplateSchema(BaseModel):
    """题目模板 Schema - 用于AI批量生成"""

    id: int
    question_type_id: int

    # 模板内容
    name: str
    description: Optional[str] = None

    # 生成配置
    variables: Optional[dict] = None
    constraints: Optional[dict] = None
    examples: Optional[list] = None

    # AI配置
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    output_schema: Optional[dict] = None

    # 质量控制
    quality_rules: Optional[dict] = None

    # 元数据
    is_active: bool = True
    create_time: int
    update_time: int

    # 关联关系
    question_type: Optional["QuestionTypeSchema"] = None

    model_config = {"from_attributes": True}
