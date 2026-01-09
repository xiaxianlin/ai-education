"""
能力相关模型

包含 AbilityDomain、AbilityAtomic
"""

from typing import Optional

from sqlalchemy import Index, UniqueConstraint

from .base import BaseModel, Integer, Mapped, String, Text, mapped_column, now


class AbilityDomain(BaseModel):
    """能力域表（一级能力）"""

    __tablename__ = "ah_ability_domain"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    __table_args__ = (
        UniqueConstraint("subject", "code", name="uk_subject_code"),
    )


class AbilityAtomic(BaseModel):
    """原子能力表（可评估能力）"""

    __tablename__ = "ah_ability_atomic"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    grade: Mapped[int] = mapped_column(nullable=False, index=True)
    domain_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    difficulty: Mapped[int] = mapped_column(default=1)  # 1-5
    sort_order: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    __table_args__ = (
        UniqueConstraint("subject", "grade", "code", name="uk_ability"),
        Index("ix_subject_grade", "subject", "grade"),
    )


__all__ = ["AbilityDomain", "AbilityAtomic"]
