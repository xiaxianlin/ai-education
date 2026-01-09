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


class StudentTextbookSchema(BaseModel):
    """学生教材关联"""

    id: int
    student_id: str
    textbook_id: int

    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


__all__ = [
    "StudentSchema",
    "StudentTextbookSchema",
]
