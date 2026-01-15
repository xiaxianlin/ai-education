"""
题型系统 Pydantic Schema

包含请求/响应的数据验证和序列化定义
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS
from shared.core.schema import (
    SearchSchema,
)

# ============ 题型 Schema ============


class QuestionTypeSaveSchema(BaseModel):
    """创建题型"""

    id: Optional[int] = Field(default=None, description="题型ID，不传则自动生成")
    code: str = Field(..., description="题型编码，如 pinyin_choice")
    name: str = Field(..., description="题型名称，如 看图选拼音")
    category: str = Field(..., description="题型分类: ability_practice / unit_practice")

    description: Optional[str] = Field(default=None, description="题型描述")
    subject: Optional[str] = Field(default=None, description="科目")
    ability_code: Optional[str] = Field(default=None, description="关联能力代码")

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v):
        if v is not None and v not in SUBJECTS:
            raise ValueError(f"科目必须是 {SUBJECTS} 之一")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v not in ["ability_practice", "unit_practice"]:
            raise ValueError("题型分类必须是 ability_practice 或 unit_practice")
        return v


class AbilityPracticeSearchSchema(BaseModel):
    """搜索能力练习题型"""

    subject: str = Field(..., description="科目（必需）")
    grade: int = Field(..., description="年级 1-12（必需）")

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v):
        if v not in SUBJECTS:
            raise ValueError(f"科目必须是 {SUBJECTS} 之一")
        return v

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, v):
        if v not in range(1, 13):
            raise ValueError("年级必须在 1-12 之间")
        return v


class QuestionTypePromptUpdateSchema(BaseModel):
    """更新题型 prompt"""

    prompt: str = Field(..., description="prompt 内容")


class QuestionTypeConfigsUpdateSchema(BaseModel):
    """更新题型 configs"""

    configs: Dict[str, Any] = Field(..., description="configs 配置")


# ============ 题目 Schema ============


class QuestionUpdateSchema(BaseModel):
    """更新题目"""

    id: Optional[str] = Field(default=None, description="题目ID")
    content: Optional[Dict[str, Any]] = Field(default=None, description="题目内容")
    answer: Optional[Dict[str, Any]] = Field(default=None, description="答案配置")
    explanation: Optional[str] = Field(default=None, description="解析")


class QuestionSearchSchema(SearchSchema):
    """搜索题目"""

    id: Optional[str] = None
    question_type_code: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
