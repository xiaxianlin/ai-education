"""
题型与题目 Schema
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .textbook import TextbookSchema, UnitSchema


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
    resource_type: str = "text"
    resource_config: Optional[dict] = None

    # 答案配置
    answer_type: str
    answer_config: Optional[dict] = None

    # 反馈配置
    feedback_config: Optional[dict] = None

    # 认知与能力
    cognitive_levels: Optional[list] = None
    ability_dimensions: Optional[list] = None

    # 难度
    difficulty: Optional[str] = None

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


# ==================== 题目结构 Schema ====================


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
    sub_questions: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题列表（复合题）")


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


__all__ = [
    "QuestionTypeSchema",
    "QuestionSchema",
    "AnswerSchema",
    "SubStemSchema",
    "OptionSchema",
    "ResourceSchema",
    "SubQuestionSchema",
    "StemSchema",
    "FeedbackItemSchema",
    "FeedbackConfigSchema",
]
