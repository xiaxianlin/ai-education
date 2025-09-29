from typing import List
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    question_type: str = Field(description="题型")
    question: str = Field(description="题干内容")
    options: List[QuestionOption] = Field(
        description="题目选项列表，非选择题时可为空数组", default=[]
    )
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度，如 简单/中等/较难")


class QuestionGenerationResult(BaseModel):
    questions: List[GeneratedQuestion] = []
