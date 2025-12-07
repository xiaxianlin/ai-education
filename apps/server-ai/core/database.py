from fastapi import Depends
from sqlalchemy import String, Text
from sqlalchemy.orm import (
    relationship,
    Mapped,
    mapped_column,
    DeclarativeBase,
    sessionmaker,
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from core.settings import envs
from utils.time import now

async_engine = create_async_engine(
    envs.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # 连接池预检查，确保连接有效
    pool_size=envs.DATABASE_POOL_SIZE,  # 连接池大小
    max_overflow=envs.DATABASE_MAX_OVERFLOW,  # 最大溢出连接数
    pool_timeout=envs.DATABASE_POOL_TIMEOUT,  # 连接超时时间
    pool_recycle=3600,  # 连接回收时间（1小时），避免MySQL的wait_timeout问题
)

AsyncSessionLocal = sessionmaker(
    class_=AsyncSession,
    expire_on_commit=False,
    bind=async_engine,
)


async def init_database():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


Database = Depends(get_db)


def get_async_session() -> AsyncSession:
    """获取异步数据库会话（用于后台任务）"""
    return AsyncSessionLocal()


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    __abstract__ = True


class Textbook(BaseModel):
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
    textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, index=True)

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


class Question(BaseModel):
    __tablename__ = "ah_question"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(Text, comment="科目")
    grade: Mapped[int] = mapped_column(comment="年级")
    type: Mapped[str] = mapped_column(String(255), comment="题目类型（主类型）")
    subtype: Mapped[str] = mapped_column(String(255), comment="题目子类型", nullable=True)
    content: Mapped[str] = mapped_column(Text, comment="题目内容")
    options: Mapped[str] = mapped_column(Text, comment="选项")
    answer: Mapped[str] = mapped_column(Text, comment="问题答案")
    difficulty: Mapped[str] = mapped_column(String(255), comment="问题难度")
    resource: Mapped[str] = mapped_column(String(255), nullable=True, comment="资源路径")
    resource_type: Mapped[str] = mapped_column(
        String(50), comment="资源类型：image-图片，audio-语音，空-无资源", nullable=True
    )
    resource_content: Mapped[str] = mapped_column(
        Text, comment="资源内容（录音文本等）", nullable=True
    )
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    unit_id: Mapped[int] = mapped_column(nullable=True)
    knowledge: Mapped[str] = mapped_column(String(255), comment="知识点")

    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(Question.unit_id) == Unit.id",
        lazy="joined",  # 推荐 eager load，性能好
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Question.textbook_id) == Textbook.id",
        lazy="joined",
    )

