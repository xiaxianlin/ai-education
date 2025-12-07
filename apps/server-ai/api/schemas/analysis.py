"""答题分析 API Schema"""
from pydantic import BaseModel, Field


class AnswerAnalysisRequest(BaseModel):
    """答题分析请求"""
    content: str = Field(description="题目内容")
    options: str = Field(default="", description="选项")
    knowledge: str = Field(default="", description="知识点")
    question_answer: str = Field(description="正确答案")
    student_answer: str = Field(description="学生答案")
    model_name: str = Field(default="qwen3-max-preview", description="模型名称")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="温度参数")


class AnswerAnalysisResponse(BaseModel):
    """答题分析响应"""
    is_correct: bool = Field(description="答案是否正确")
    analysis: str = Field(description="分析内容")

