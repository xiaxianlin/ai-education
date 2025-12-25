from typing import Optional

from pydantic import BaseModel, Field


class CreatePracticeSchema(BaseModel):
    slug: str
    textbook_id: int
    unit_id: Optional[int] = None


class AnswerQuestionSchema(BaseModel):
    session_id: int
    question_id: str
    answer: str
    time_spent: int  # 答题耗时，单位秒
    is_audio_answer: bool = False  # 是否为音频回答（口语题）
    audio_match: Optional[bool] = None  # 音频理解结果：是否匹配题目要求（仅口语题）
    audio_analysis: Optional[str] = None  # 音频理解结果：综合分析（包含原因和改进建议，仅口语题）


class PracticeSubmitParams(BaseModel):
    """练习提交请求（用于 Celery 任务序列化）"""

    type: Optional[str] = Field(None, description="练习类型: daily_practice/unit_practice/assessment（兼容旧逻辑）")
    practice_id: Optional[int] = Field(None, description="练习ID（优先使用）")
    student_id: str = Field(..., description="学生ID")
    textbook_id: int = Field(..., description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID")
