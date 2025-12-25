from pydantic import BaseModel, Field


class SubmitAnswerSchema(BaseModel):
    session_id: int
    question_id: str
    answer: str
    time_spent: int
    is_audio_answer: bool
    audio_data: bytes


class AnswerAnalysisSchema(BaseModel):
    """答题分析响应"""

    is_correct: bool = Field(default=False, description="是否正确")
    analysis: str = Field(default="", description="错题分析")
