"""
题型与题目相关模型

包含 QuestionType、Question
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index

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
    pass


class QuestionType(BaseModel):
    """题型配置表"""

    __tablename__ = "ah_question_type"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础信息
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="题型编码")
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="题型名称")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="题型描述")

    # 分类与学科
    category: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ability_practice",
        comment="题型分类: ability_practice / unit_practice",
    )
    subject: Mapped[str] = mapped_column(String(50), nullable=False, comment="科目")
    grade_band: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="学段: Low/Mid/High"
    )

    # 能力关联
    ability_code: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True, comment="关联能力代码"
    )

    # 媒体与脚手架配置
    media_context: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="媒体情境配置"
    )
    scaffolding_config: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="脚手架配置"
    )

    # 答案配置
    answer_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="答案类型")
    answer_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="答案配置")

    # 评估配置
    evaluation_modes: Mapped[Optional[list]] = mapped_column(
        JSON, nullable=True, comment="评估模式列表"
    )
    rubric_criteria: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, comment="评价量表")

    # AI生成
    ai_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="AI生成指令")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    __table_args__ = (
        Index("ix_question_type_category", "category"),
        Index("ix_question_type_subject", "subject"),
    )


class Question(BaseModel):
    """题目表"""

    __tablename__ = "ah_question"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, comment="UUID")

    # 题型关联
    question_type_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="题型ID")
    question_type_code: Mapped[str] = mapped_column(String(50), nullable=False, comment="题型编码")

    # 基础信息
    subject: Mapped[str] = mapped_column(String(50), nullable=False, comment="科目")
    grade: Mapped[int] = mapped_column(nullable=False, comment="年级 1-12")

    # 能力关联
    ability_code: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True, comment="能力代码"
    )

    # 题目内容
    content: Mapped[dict] = mapped_column(
        JSON, nullable=False, comment="题目内容：包含题干、选项等"
    )
    resources: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, comment="资源列表")

    # 答案
    answer: Mapped[dict] = mapped_column(JSON, nullable=False, comment="答案配置")
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="解析")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # 关联关系
    question_type: Mapped["QuestionType"] = relationship(
        "QuestionType",
        primaryjoin="foreign(Question.question_type_id) == QuestionType.id",
        lazy="joined",
    )

    __table_args__ = (Index("ix_question_subject_grade", "subject", "grade"),)


__all__ = ["QuestionType", "Question"]
