"""
题型与题目 Schema
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class QuestionTypeSchema(BaseModel):
    """题型配置 Schema"""

    id: int
    code: str
    name: str
    description: Optional[str] = None

    # 分类与学科
    category: str = "ability_practice"
    subject: str
    grade_band: Optional[str] = None

    # 能力关联
    ability_code: Optional[str] = None

    # 媒体与脚手架配置
    media_context: Optional[dict] = None
    scaffolding_config: Optional[dict] = None

    # 答案配置
    answer_type: str
    answer_config: Optional[dict] = None

    # 评估配置
    evaluation_modes: Optional[list] = None
    rubric_criteria: Optional[list] = None

    # AI生成
    ai_prompt: Optional[str] = None

    # 时间戳
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

    # 能力关联
    ability_code: Optional[str] = None

    # 题目内容
    content: dict
    resources: Optional[list] = None

    # 答案
    answer: dict
    explanation: Optional[str] = None

    # 时间戳
    create_time: int
    update_time: int

    # 关联关系
    question_type: Optional["QuestionTypeSchema"] = None

    model_config = {"from_attributes": True}


# ==================== 题目结构 Schema ====================


class AnswerSchema(BaseModel):
    """答案结构"""

    type: str = Field(default="exact", description="答案类型：exact/fuzzy/rubric/ai/composite")
    correct_answers: Optional[List[str]] = Field(default=None, description="正确答案列表")
    accept_answers: Optional[List[str]] = Field(default=None, description="可接受答案")
    scoring: Optional[Dict[str, Any]] = Field(default=None, description="评分规则")
    rubric: Optional[Dict[str, Any]] = Field(default=None, description="评分标准（主观题）")


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
    resource_type: str = Field(..., description="资源归属类型：'stem'/'option'")
    option_id: Optional[str] = Field(default=None, description="关联的选项ID")
    size: Optional[Dict[str, int]] = Field(default=None, description="尺寸")
    style: Optional[Dict[str, Any]] = Field(default=None, description="样式")
    duration: Optional[int] = Field(default=None, description="时长（秒）")
    transcript: Optional[str] = Field(default=None, description="文字记录")


class ContentSchema(BaseModel):
    """题目内容结构"""

    stem: str = Field(..., description="题干文本")
    rich_text: Optional[str] = Field(default=None, description="富文本题干")
    options: Optional[List[OptionSchema]] = Field(default=None, description="选项列表")
    blanks: Optional[List[Dict[str, Any]]] = Field(default=None, description="填空配置")
    sub_questions: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题列表")


class SubQuestionSchema(BaseModel):
    """子题结构 - 用于复合题"""

    id: str = Field(..., description="子题ID")
    order: int = Field(..., description="显示顺序")
    stem: Dict[str, Any] = Field(..., description="子题题干")
    question_type_code: str = Field(..., description="子题题型")
    options: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题选项")
    resources: Optional[List[Dict[str, Any]]] = Field(default=None, description="子题资源")
    answer: Dict[str, Any] = Field(..., description="子题答案")
    explanation: Optional[str] = Field(default=None, description="子题解析")


__all__ = [
    "QuestionTypeSchema",
    "QuestionSchema",
    "AnswerSchema",
    "OptionSchema",
    "ResourceSchema",
    "ContentSchema",
    "SubQuestionSchema",
]
