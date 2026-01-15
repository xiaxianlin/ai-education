"""
题型与题目相关模型

包含 QuestionType、Question
"""

from typing import TYPE_CHECKING, Optional

from .base import (
    JSON,
    BaseModel,
    Mapped,
    String,
    Text,
    mapped_column,
    now,
    relationship,
)

if TYPE_CHECKING:
    from .ability import Ability


class QuestionType(BaseModel):
    """题型配置表"""

    __tablename__ = "ah_question_type"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="题型名称")
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="题型编码")
    category: Mapped[str] = mapped_column(String(50), comment="题型分类: ability_practice/unit_practice")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="题型描述")

    subject: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, comment="科目")
    ability_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, comment="关联能力代码")
    configs: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="题型配置信息")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    ability: Mapped["Ability"] = relationship(
        "Ability",
        primaryjoin="foreign(QuestionType.ability_code) == Ability.code",
        lazy="joined",
    )


class Question(BaseModel):
    """题目表"""

    __tablename__ = "ah_question"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, comment="UUID")
    question_type_code: Mapped[str] = mapped_column(String(50), nullable=False, comment="题型编码")

    subject: Mapped[str] = mapped_column(String(50), nullable=False, comment="科目")
    grade: Mapped[int] = mapped_column(nullable=False, comment="年级 1-12")

    content: Mapped[dict] = mapped_column(JSON, nullable=False, comment="题目内容：包含题干、选项等")
    answer: Mapped[dict] = mapped_column(JSON, nullable=False, comment="答案配置")
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="解析")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    question_type: Mapped["QuestionType"] = relationship(
        "QuestionType",
        primaryjoin="foreign(Question.question_type_code) == QuestionType.code",
        lazy="joined",
    )


__all__ = ["QuestionType", "Question"]
