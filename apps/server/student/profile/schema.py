from typing import Optional

from pydantic import BaseModel, field_validator
from shared.core.constants import SEMESTERS, SUBJECTS
from shared.core.schema import TextbookSchema


class StudentProfileSchema(BaseModel):
    name: str
    phone: str
    grade: Optional[int] = None
    semester: Optional[str] = None
    subject: Optional[str] = None

    textbooks: list[TextbookSchema]


class UpdateStudentSettingsSchema(BaseModel):
    """更新学生设置"""

    grade: int
    semester: str
    subject: str

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v not in range(1, 13):
            raise ValueError("非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(cls, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{'、'.join(SEMESTERS)}")
        return v

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v
