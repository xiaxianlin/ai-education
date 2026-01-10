"""
学生相关模型

包含 Student、StudentSubjectVersion
"""

from typing import TYPE_CHECKING, Optional

from .base import BaseModel, Mapped, String, mapped_column, now, relationship

if TYPE_CHECKING:
    from .textbook import Textbook


class Student(BaseModel):
    """学生表"""

    __tablename__ = "ah_student"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), default="")
    token: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    subject: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)


class StudentSubjectVersion(BaseModel):
    """学生科目版本关联表"""

    __tablename__ = "ah_student_subject_version"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)


__all__ = ["Student", "StudentSubjectVersion"]
