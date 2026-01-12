"""
教材相关模型

包含 Textbook、Unit、Knowledge、TeacherBook
"""

from .base import BaseModel, Mapped, mapped_column, now, relationship, String, Text


class Textbook(BaseModel):
    """教材表"""

    __tablename__ = "ah_textbook"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[str] = mapped_column(String(255), nullable=False)
    file: Mapped[str] = mapped_column(String(255))
    index_file_id: Mapped[str] = mapped_column(String(255))
    is_parsed: Mapped[int] = mapped_column(default=0)


class Unit(BaseModel):
    """单元表"""

    __tablename__ = "ah_unit"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Unit.textbook_id) == Textbook.id",
        lazy="joined",
    )


class Knowledge(BaseModel):
    """知识点模型（简化版，两级结构：单元 -> 知识点）"""

    __tablename__ = "ah_knowledge"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(index=True)
    unit_id: Mapped[int] = mapped_column(index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")

    # 知识点属性（简化）
    difficulty: Mapped[str] = mapped_column(
        String(50), nullable=True, comment="知识点难度（简单/普通/困难）"
    )
    importance: Mapped[int] = mapped_column(default=5, comment="重要性（1-10，10最重要）")
    order: Mapped[int] = mapped_column(default=0, comment="同级知识点排序")

    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(Knowledge.unit_id) == Unit.id",
        lazy="joined",
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Knowledge.textbook_id) == Textbook.id",
        lazy="joined",
    )


class TeacherBook(BaseModel):
    """教师用书表"""

    __tablename__ = "ah_teacher_book"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[str] = mapped_column(String(255), nullable=False)
    file: Mapped[str] = mapped_column(String(255), nullable=True)
    index_file_id: Mapped[str] = mapped_column(String(255), nullable=True)


class TextbookVersion(BaseModel):
    """教材版本表"""

    __tablename__ = "ah_textbook_version"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    revision_year: Mapped[int] = mapped_column(nullable=False)
    is_enabled: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


__all__ = ["Textbook", "Unit", "Knowledge", "TeacherBook", "TextbookVersion"]
