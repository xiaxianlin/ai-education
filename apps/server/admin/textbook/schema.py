from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SEMESTERS, SUBJECTS


class UnitInfo(BaseModel):
    """单元信息模型"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容摘要")
    topics: List[Dict[str, str]] = Field(
        description="知识点列表，每个知识点包含 topic_name 和 topic_content", default=[]
    )


class UnitExtractionResult(BaseModel):
    """单元提取结果模型 - LLM 返回的 JSON 结构"""

    units: List[UnitInfo] = Field(description="提取的单元列表")


class SaveTextbookSchema(BaseModel):
    subject: str
    version: str
    grade: int
    semester: str

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 13):
            raise ValueError("非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(cls, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{'、'.join(SEMESTERS)}")
        return v


class SearchTextbookSchema(BaseModel):
    """教材搜索"""

    version: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None


class CreateUnitSchema(BaseModel):
    """创建单元"""

    textbook_id: int
    name: str
    content: str


class UpdateUnitSchema(BaseModel):
    """更新单元"""

    name: Optional[str] = None
    content: Optional[str] = None
