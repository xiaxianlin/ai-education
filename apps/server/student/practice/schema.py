"""
练习请求/响应 Schema

练习类型分类：
- ability_practice: 能力练习 - 基于原子能力 code 列表生成
- unit_practice: 单元练习 - 基于单元 ID 生成
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class CreateAbilityPracticeSchema(BaseModel):
    """创建能力练习请求"""

    ability_codes: List[str] = Field(..., description="原子能力 code 列表", min_length=1)
    subject: str = Field(..., description="科目")
    grade: int = Field(..., description="年级")
    generate_count: int = Field(default=15, description="生成题目数量", ge=1, le=50)


class CreateUnitPracticeSchema(BaseModel):
    """创建单元练习请求"""

    unit_id: int = Field(..., description="单元 ID")
    generate_count: int = Field(default=15, description="生成题目数量", ge=1, le=50)


class AnswerQuestionSchema(BaseModel):
    """答题请求"""

    session_id: str = Field(..., description="练习会话 ID (UUID v4)")
    question_id: str = Field(..., description="题目 ID")
    answer: str = Field(..., description="学生答案")
    time_spent: int = Field(..., description="答题耗时，单位秒", ge=0)
    is_audio_answer: bool = Field(default=False, description="是否为音频回答（口语题）")
    audio_match: Optional[bool] = Field(None, description="音频理解结果：是否匹配题目要求（仅口语题）")
    audio_analysis: Optional[str] = Field(None, description="音频理解结果：综合分析（仅口语题）")


class PracticeSubmitParams(BaseModel):
    """练习提交请求（用于 Celery 任务序列化）"""

    practice_type: str = Field(..., description="练习类型: ability_practice/unit_practice")
    student_id: str = Field(..., description="学生 ID")
    # 能力练习参数
    ability_codes: Optional[List[str]] = Field(None, description="原子能力 code 列表（能力练习必填）")
    subject: Optional[str] = Field(None, description="科目（能力练习必填）")
    grade: Optional[int] = Field(None, description="年级（能力练习必填）")
    # 单元练习参数
    unit_id: Optional[int] = Field(None, description="单元 ID（单元练习必填）")
    # 通用参数
    generate_count: int = Field(default=15, description="生成题目数量")


class CreatePracticeResponseSchema(BaseModel):
    """创建练习响应"""

    session_id: str = Field(..., description="练习会话 ID (UUID v4)")
    message: str = Field(default="练习会话创建成功，正在生成题目", description="响应消息")
