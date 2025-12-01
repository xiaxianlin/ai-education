from typing import Optional
from pydantic import BaseModel

from enum import Enum


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
    count: int = 15
    unit_id: Optional[int] = None


class AnswerQuestionSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int  # 答题耗时，单位秒
    is_audio_answer: bool = False  # 是否为音频回答
    audio_data: Optional[str] = None  # 音频数据（base64编码字符串）
