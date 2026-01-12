"""
学生相关 Schema
"""

from typing import Optional

from pydantic import BaseModel


class StudentSchema(BaseModel):
    """学生信息"""

    id: str
    name: str = ""
    phone: str
    grade: Optional[int] = None
    semester: Optional[str] = None
    subject: Optional[str] = None
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentTextbookConfigSchema(BaseModel):
    """学生教材配置"""

    id: int
    student_id: str
    textbook_id: int
    textbook: Optional["TextbookSchema"] = None  # 关联的教材信息
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


# 避免循环导入
from .textbook import TextbookSchema

StudentTextbookConfigSchema.model_rebuild()


__all__ = [
    "StudentSchema",
    "StudentTextbookConfigSchema",
]
