"""
学生相关 Schema
"""

from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel

if TYPE_CHECKING:
    from .textbook import TextbookSchema


class StudentSchema(BaseModel):
    """学生信息"""

    id: str
    name: str = ""
    phone: str
    grade: int
    semester: Optional[str] = None
    subject: Optional[str] = None
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentSubjectVersionSchema(BaseModel):
    """学生科目版本关联"""

    subject: str
    version: str

    model_config = {"from_attributes": True}


__all__ = [
    "StudentSchema",
    "StudentSubjectVersionSchema",
]
