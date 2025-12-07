"""题目生成相关的 Schema"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class QuestionGenerateRequest(BaseModel):
    """题目生成请求"""
    type: str = Field(description="生成类型: daily_practice, unit_practice, assessment")
    count: int = Field(description="生成题目数量")
    textbook_id: int = Field(description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID（单元练习时需要）")
    student_id: Optional[str] = Field(None, description="学生ID（每日练习时需要）")


class QuestionSchema(BaseModel):
    """题目 Schema"""
    id: int
    type: str
    subtype: Optional[str] = None
    subject: str
    grade: int
    content: str
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None

    model_config = {"from_attributes": True}


class QuestionGenerateResponse(BaseModel):
    """题目生成响应"""
    questions: List[QuestionSchema] = Field(description="生成的题目列表")

