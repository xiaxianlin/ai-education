"""
题型系统 Pydantic Schema

包含请求/响应的数据验证和序列化定义
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from enum import Enum

from shared.core.constants import (
    SUBJECTS,
    STAGES,
    INTERACTION_TYPES,
    COGNITIVE_LEVELS,
    RESOURCE_TYPES_V2,
    ANSWER_TYPES,
    DIFFICULTY_LEVELS_V2,
)


# ============ 枚举类型 ============


class Stage(str, Enum):
    PRIMARY_LOW = "primary_low"
    PRIMARY_HIGH = "primary_high"
    JUNIOR = "junior"
    SENIOR = "senior"


class InteractionType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    IMAGE_CHOICE = "image_choice"
    TEXT_INPUT = "text_input"
    HANDWRITING = "handwriting"
    VOICE_INPUT = "voice_input"
    DRAG_DROP = "drag_drop"
    CONNECT_LINE = "connect_line"
    SORT_ORDER = "sort_order"
    TRUE_FALSE = "true_false"
    CORRECT_WRONG = "correct_wrong"
    FOLLOW_READ = "follow_read"
    FREE_SPEAK = "free_speak"
    FILL_BLANK = "fill_blank"
    MULTI_STEP = "multi_step"


class CognitiveLevel(str, Enum):
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ResourceType(str, Enum):
    NONE = "none"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    ANIMATION = "animation"


class AnswerType(str, Enum):
    EXACT = "exact"
    FUZZY = "fuzzy"
    RUBRIC = "rubric"
    AI = "ai"
    COMPOSITE = "composite"


# ============ 答案结构（前置定义） ============


class AnswerSchema(BaseModel):
    """答案结构"""

    type: str = Field(default="exact", description="答案类型：exact/fuzzy/rubric/ai/composite")
    correct_answers: Optional[List[str]] = Field(default=None, description="正确答案列表")
    accept_answers: Optional[List[str]] = Field(default=None, description="可接受答案")
    scoring: Optional[Dict[str, Any]] = Field(default=None, description="评分规则")
    rubric: Optional[Dict[str, Any]] = Field(default=None, description="评分标准（主观题）")


# ============ 子题结构 ============


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
    type: ResourceType = Field(..., description="资源类型")
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
    stem: SubStemSchema = Field(..., description="子题题干")
    interaction_type: InteractionType = Field(..., description="子题交互类型")
    interaction_config: Optional[Dict[str, Any]] = Field(default=None, description="子题交互配置")
    options: Optional[List[OptionSchema]] = Field(default=None, description="子题选项（选择题）")
    resources: Optional[List[ResourceSchema]] = Field(default=None, description="子题专属资源")
    answer: AnswerSchema = Field(..., description="子题答案")
    explanation: Optional[str] = Field(default=None, description="子题解析")


# ============ 题干结构 ============


class StemSchema(BaseModel):
    """题干结构"""

    text: str = Field(..., description="纯文本题干")
    rich_text: Optional[str] = Field(default=None, description="富文本题干")
    audio_url: Optional[str] = Field(default=None, description="题干朗读音频")
    highlight_words: Optional[List[str]] = Field(default=None, description="高亮词汇")
    hints: Optional[List[str]] = Field(default=None, description="提示信息")
    sub_questions: Optional[List[SubQuestionSchema]] = Field(
        default=None, description="子题列表（复合题）"
    )


# ============ 反馈结构 ============


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

    correct: Optional[FeedbackItemSchema] = Field(default=None, description="正确反馈")
    incorrect: Optional[FeedbackItemSchema] = Field(default=None, description="错误反馈")
    partial: Optional[FeedbackItemSchema] = Field(default=None, description="部分正确反馈")


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
    resource_type: str = Field(default="none", description="资源类型")
    resource_config: Optional[Dict[str, Any]] = Field(default=None, description="资源配置")
    answer_type: str = Field(..., description="答案类型")
    answer_config: Optional[Dict[str, Any]] = Field(default=None, description="答案配置")
    feedback_config: Optional[Dict[str, Any]] = Field(default=None, description="反馈配置")
    cognitive_levels: Optional[List[str]] = Field(default=None, description="认知层次列表")
    ability_dimensions: Optional[List[str]] = Field(default=None, description="能力维度列表")
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
        if v not in RESOURCE_TYPES_V2:
            raise ValueError(f"资源类型必须是 {RESOURCE_TYPES_V2} 之一")
        return v

    @field_validator("answer_type")
    @classmethod
    def validate_answer_type(cls, v):
        if v not in ANSWER_TYPES:
            raise ValueError(f"答案类型必须是 {ANSWER_TYPES} 之一")
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
    ability_dimensions: Optional[List[str]] = None
    ai_prompt: Optional[str] = None
    output_schema: Optional[Dict[str, Any]] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class QuestionTypeResponseSchema(BaseModel):
    """题型响应"""

    id: int
    code: str
    name: str
    description: Optional[str] = None
    subject: str
    stages: List[str]
    grades: List[int]
    interaction_type: str
    interaction_config: Optional[Dict[str, Any]] = None
    resource_type: str
    resource_config: Optional[Dict[str, Any]] = None
    answer_type: str
    answer_config: Optional[Dict[str, Any]] = None
    feedback_config: Optional[Dict[str, Any]] = None
    cognitive_levels: Optional[List[str]] = None
    ability_dimensions: Optional[List[str]] = None
    ai_prompt: Optional[str] = None
    sort_order: int
    is_active: bool
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class QuestionTypeSearchSchema(BaseModel):
    """搜索题型"""

    subject: Optional[str] = None
    stage: Optional[str] = None
    grade: Optional[int] = None
    interaction_type: Optional[str] = None
    is_active: Optional[bool] = None


# ============ 题目 Schema ============


class QuestionCreateSchema(BaseModel):
    """创建题目"""

    id: Optional[str] = Field(default=None, description="题目ID，不传则自动生成UUID")
    question_type_id: int = Field(..., description="题型ID")
    question_type_code: str = Field(..., description="题型编码")
    subject: str = Field(..., description="科目")
    grade: int = Field(..., description="年级 1-12")
    stage: str = Field(..., description="学段")
    textbook_id: Optional[int] = Field(default=None, description="教材ID")
    unit_id: Optional[int] = Field(default=None, description="单元ID")
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
        if v not in DIFFICULTY_LEVELS_V2:
            raise ValueError(f"难度必须是 {DIFFICULTY_LEVELS_V2} 之一")
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


class QuestionResponseSchema(BaseModel):
    """题目响应"""

    id: str
    question_type_id: int
    question_type_code: str
    subject: str
    grade: int
    stage: str
    textbook_id: Optional[int] = None
    unit_id: Optional[int] = None
    stem: Dict[str, Any]
    options: Optional[List[Dict[str, Any]]] = None
    blanks: Optional[List[Dict[str, Any]]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    answer: Dict[str, Any]
    explanation: Optional[str] = None
    difficulty: str
    cognitive_level: Optional[str] = None
    knowledge_points: Optional[List[str]] = None
    ability_tags: Optional[List[str]] = None
    source: str
    usage_count: int
    correct_rate: Optional[str] = None
    avg_time_spent: Optional[int] = None
    is_active: bool
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class QuestionSearchSchema(BaseModel):
    """搜索题目"""

    question_type_id: Optional[int] = None
    question_type_code: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    stage: Optional[str] = None
    textbook_id: Optional[int] = None
    unit_id: Optional[int] = None
    difficulty: Optional[str] = None
    cognitive_level: Optional[str] = None
    source: Optional[str] = None
    is_active: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


# ============ 题目模板 Schema ============


class QuestionTemplateCreateSchema(BaseModel):
    """创建题目模板"""

    name: str = Field(..., description="模板名称")
    question_type_id: int = Field(..., description="题型ID")
    description: Optional[str] = Field(default=None, description="模板描述")
    system_prompt: Optional[str] = Field(default=None, description="系统提示词")
    user_prompt_template: Optional[str] = Field(default=None, description="用户提示词模板")
    variables: Optional[Dict[str, Any]] = Field(default=None, description="变量定义")
    output_schema: Optional[Dict[str, Any]] = Field(default=None, description="输出Schema")
    is_active: bool = Field(default=True, description="是否启用")


class QuestionTemplateUpdateSchema(BaseModel):
    """更新题目模板"""

    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    output_schema: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class QuestionTemplateResponseSchema(BaseModel):
    """题目模板响应"""

    id: int
    name: str
    question_type_id: int
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    output_schema: Optional[Dict[str, Any]] = None
    is_active: bool
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}
