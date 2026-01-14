"""
教材相关 Schema
"""

from typing import Optional

from pydantic import BaseModel


class TextbookSchema(BaseModel):
    """教材信息"""

    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: int = 0

    model_config = {"from_attributes": True}


class TeacherBookSchema(BaseModel):
    """教师用书信息"""

    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None

    model_config = {"from_attributes": True}


class UnitSchema(BaseModel):
    """单元信息"""

    id: int
    textbook_id: int
    name: str
    content: str
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


__all__ = [
    "TextbookSchema",
    "TeacherBookSchema",
    "UnitSchema",
]
