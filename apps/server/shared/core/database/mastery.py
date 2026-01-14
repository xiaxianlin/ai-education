"""
学生能力掌握度模型

包含 StudentAbilityMastery
"""

from typing import Optional

from sqlalchemy import UniqueConstraint

from .base import BaseModel, Mapped, String, mapped_column, now


class StudentAbilityMastery(BaseModel):
    """学生能力掌握度表

    掌握等级 (mastery_level):
    - unlearned: 未掌握 (0-39)
    - beginner: 初步掌握 (40-59)
    - proficient: 基本掌握 (60-79)
    - mastered: 熟练掌握 (80-100)
    """

    __tablename__ = "ah_student_ability_mastery"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True, comment="学生ID"
    )
    ability_code: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True, comment="能力代码"
    )

    # 掌握度
    mastery_score: Mapped[float] = mapped_column(default=0.0, comment="掌握度 0-100")
    mastery_level: Mapped[str] = mapped_column(String(20), default="unlearned", comment="掌握等级")

    # 统计
    correct_count: Mapped[int] = mapped_column(default=0, comment="正确次数")
    wrong_count: Mapped[int] = mapped_column(default=0, comment="错误次数")

    # 时间
    last_practice_time: Mapped[Optional[int]] = mapped_column(nullable=True, comment="最近练习时间")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    __table_args__ = (UniqueConstraint("student_id", "ability_code", name="uk_student_ability"),)


__all__ = ["StudentAbilityMastery"]
