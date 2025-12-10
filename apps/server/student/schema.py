from typing import Optional
from pydantic import BaseModel, Field

from enum import Enum

from sqlalchemy.ext.asyncio import AsyncSession


class PracticeType(str, Enum):
    daily = "daily_practice"
    unit = "unit_practice"
    assessment = "assessment"


class LoginSchema(BaseModel):
    phone: str
    password: str


class CreatePracticeSchema(BaseModel):
    type: PracticeType
    textbook_id: int
    unit_id: Optional[int] = None


class AnswerQuestionSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int  # 答题耗时，单位秒
    is_audio_answer: bool = False  # 是否为音频回答（口语题）
    audio_match: Optional[bool] = None  # 音频理解结果：是否匹配题目要求（仅口语题）
    audio_analysis: Optional[str] = None  # 音频理解结果：综合分析（包含原因和改进建议，仅口语题）


class AnswerResultSchema(BaseModel):
    is_correct: bool
    correct_answer: str
    user_answer: str
    analysis: Optional[str] = None


class PracticeSubmitParams(BaseModel):
    """练习提交请求（用于 Celery 任务序列化）"""

    type: str = Field(..., description="练习类型: daily_practice/unit_practice/assessment")
    student_id: str = Field(..., description="学生ID")
    textbook_id: int = Field(..., description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID")
