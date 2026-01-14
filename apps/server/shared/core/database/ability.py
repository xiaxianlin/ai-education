"""
能力相关模型

包含 Ability
"""

from typing import Optional

from sqlalchemy import Index, UniqueConstraint

from .base import BaseModel, Mapped, String, Text, mapped_column, now


class Ability(BaseModel):
    """能力表"""

    __tablename__ = "ah_ability"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    grade: Mapped[int] = mapped_column(nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    difficulty: Mapped[int] = mapped_column(default=1)  # 1-5
    is_active: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    __table_args__ = (
        UniqueConstraint("subject", "grade", "code", name="uk_ability"),
        Index("ix_subject_grade", "subject", "grade"),
    )


__all__ = ["Ability"]
