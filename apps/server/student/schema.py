from typing import Optional
from pydantic import BaseModel, Field

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
    unit_id: Optional[int] = None


class AnswerQuestionSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int  # 答题耗时，单位秒
    is_audio_answer: bool = False  # 是否为音频回答（口语题）
    audio_data: Optional[str] = None  # 音频 OSS 存储路径
    audio_match: Optional[bool] = None  # 音频理解结果：是否匹配题目要求（仅口语题）
    audio_analysis: Optional[str] = (
        None  # 音频理解结果：综合分析（包含原因和改进建议，仅口语题）
    )


class UploadRecordingResultSchema(BaseModel):
    oss_path: str  # OSS 存储路径
    transcription: str  # 语音识别结果（转写文本）
    match: bool  # 是否匹配题目要求
    analysis: str  # 综合分析（包含原因和改进建议）


class AnswerResultSchema(BaseModel):
    is_correct: bool
    correct_answer: str
    user_answer: str
    analysis: Optional[str] = None
