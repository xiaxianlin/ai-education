from pydantic import BaseModel, Field


class SubmitAnswerSchema(BaseModel):
    """提交答案请求"""
    
    session_id: str = Field(..., description="练习会话 ID (UUID v4)")
    question_id: str = Field(..., description="题目 ID")
    answer: str = Field(..., description="学生答案")
    time_spent: int = Field(..., description="答题耗时（秒）")
    is_audio_answer: bool = Field(default=False, description="是否为音频回答")
    audio_data: bytes = Field(default=None, description="音频数据")


class AnswerAnalysisSchema(BaseModel):
    """答题分析响应"""

    is_correct: bool = Field(default=False, description="是否正确")
    analysis: str = Field(default="", description="错题分析")
