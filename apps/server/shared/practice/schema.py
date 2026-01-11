"""练习相关 Schema 定义"""

from typing import Any, Optional

from pydantic import BaseModel, Field


class SubmitAnswerSchema(BaseModel):
    """提交答案请求"""

    session_id: str = Field(..., description="练习会话 ID (UUID v4)")
    question_id: str = Field(..., description="题目 ID")
    answer: Any = Field(..., description="学生答案（单值、列表或 JSON 字典）")
    time_spent: int = Field(..., description="答题耗时（秒）")
    audio_url: Optional[str] = Field(default=None, description="音频答案URL")


class AnswerAnalysisSchema(BaseModel):
    """答题分析响应（AI 返回格式）"""

    is_correct: bool = Field(default=False, description="是否正确")
    analysis: str = Field(default="", description="错题分析")


class CorrectAnswerSchema(BaseModel):
    """结构化正确答案

    根据题目的 interaction_type 返回对应格式的正确答案，
    前端可根据 type 字段选择渲染方式。
    """

    type: str = Field(..., description="与 interaction_type 对应")
    value: Optional[Any] = Field(default=None, description="单值答案（单选题等）")
    values: Optional[list] = Field(default=None, description="多值答案（多选题等）")
    options: Optional[list] = Field(
        default=None,
        description="选项详情（含文本），格式: [{'id': 'A', 'text': '选项内容'}]",
    )
    sub_answers: Optional[list] = Field(
        default=None,
        description="复合题子答案，格式: [{'sub_id': '1', 'is_correct': bool, 'value': 'A'}]",
    )


class RubricCriterionSchema(BaseModel):
    """评分标准条目"""

    points: int = Field(..., description="分值")
    description: str = Field(..., description="评分描述")


class RubricAnswerSchema(BaseModel):
    """评分量表"""

    criteria: list[RubricCriterionSchema] = Field(..., description="评分标准列表")
    total_points: int = Field(..., description="总分")


class AnswerFeedbackSchema(BaseModel):
    """答题反馈

    错题时返回的完整反馈信息，包含：
    - 结构化正确答案（供前端渲染）
    - 题目自带解析
    - AI 针对性分析
    """

    correct_answer: CorrectAnswerSchema = Field(..., description="结构化正确答案")
    explanation: Optional[str] = Field(default=None, description="题目自带解析")
    analysis: Optional[str] = Field(default=None, description="AI 针对性分析")


class AIRubricEvaluationSchema(BaseModel):
    """AI Rubric 评分结果（LLM 返回格式）

    用于主观题的 AI 评分，返回总分和反馈。
    """

    score: float = Field(..., description="得分（0 到 full_score 之间）")
    is_pass: bool = Field(..., description="是否及格（达到 60% 即为及格）")
    feedback: str = Field(..., description="评分反馈，说明得分/扣分原因")


__all__ = [
    "SubmitAnswerSchema",
    "AnswerAnalysisSchema",
    "CorrectAnswerSchema",
    "AnswerFeedbackSchema",
    "AIRubricEvaluationSchema",
]
