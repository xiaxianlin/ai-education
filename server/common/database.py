from fastapi import Depends
from sqlalchemy import String, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column, DeclarativeBase, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from common.settings import envs
from utils.time import now

async_engine = create_async_engine(
    envs.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
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


class Manager(BaseModel):
    __tablename__ = "ah_manager"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(255))
    type: Mapped[int] = mapped_column(default=0)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()


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
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)


class Unit(BaseModel):
    __tablename__ = "ah_unit"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Unit.textbook_id) == Textbook.id",
        lazy="joined",
    )


class Knowledge(BaseModel):
    __tablename__ = "ah_knowledge"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    unit_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()

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
    resource: Mapped[str] = mapped_column(String(255), comment="资源路径")
    resource_type: Mapped[str] = mapped_column(String(50), comment="资源类型：image-图片，audio-语音，空-无资源", nullable=True)
    resource_content: Mapped[str] = mapped_column(Text, comment="资源内容（录音文本等）", nullable=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    unit_id: Mapped[int] = mapped_column()
    knowledge: Mapped[str] = mapped_column(String(255), comment="知识点")
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()

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


#### ================================= 分割线 ================================= ####


class Student(BaseModel):
    __tablename__ = "ah_student"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(255), nullable=False)
    password: Mapped[str] = mapped_column(String(255), default="")
    token: Mapped[str] = mapped_column(String(255))
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column()


class StudentTextbook(BaseModel):
    __tablename__ = "ah_student_textbook"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    create_time: Mapped[int] = mapped_column(default=now)

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(StudentTextbook.textbook_id) == Textbook.id",
        lazy="joined",
    )


class StudentWrongQuestion(BaseModel):
    __tablename__ = "ah_student_wrong_question"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    question_id: Mapped[int] = mapped_column(nullable=False)

    wrong_count: Mapped[int] = mapped_column(default=1)
    last_wrong_time: Mapped[int] = mapped_column(default=now)
    is_mastered: Mapped[int] = mapped_column(default=0)
    mastered_time: Mapped[int] = mapped_column(default=0)

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)


class StudentProfile(BaseModel):
    __tablename__ = "ah_student_profile"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    current_textbook_id: Mapped[int] = mapped_column(nullable=True)

    preferred_subjects: Mapped[str] = mapped_column(String(500), default="")
    difficulty_preference: Mapped[str] = mapped_column(String(50), default="普通")

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)


class StudentStats(BaseModel):
    __tablename__ = "ah_student_stats"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    total_practice: Mapped[int] = mapped_column(default=0)
    total_questions: Mapped[int] = mapped_column(default=0)
    correct_questions: Mapped[int] = mapped_column(default=0)
    accuracy: Mapped[float] = mapped_column(default=0.0)

    current_streak: Mapped[int] = mapped_column(default=0)
    max_streak: Mapped[int] = mapped_column(default=0)
    last_study_date: Mapped[int] = mapped_column(default=0)

    total_study_duration: Mapped[int] = mapped_column(default=0)

    achievements: Mapped[str] = mapped_column(Text, default="")

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)


class StudyRecord(BaseModel):
    __tablename__ = "ah_study_record"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)

    textbook_id: Mapped[int] = mapped_column(nullable=False)
    unit_id: Mapped[int] = mapped_column(nullable=True)
    knowledge: Mapped[str] = mapped_column(String(255), comment="知识点", nullable=True)
    question_id: Mapped[int] = mapped_column(nullable=True)

    is_correct: Mapped[int] = mapped_column(default=0)
    score: Mapped[float] = mapped_column(default=0.0)
    time_spent: Mapped[int] = mapped_column(default=0)

    study_date: Mapped[int] = mapped_column(default=now)
    create_time: Mapped[int] = mapped_column(default=now)


class UnitPracticeSession(BaseModel):
    __tablename__ = "ah_unit_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_id: Mapped[int] = mapped_column(nullable=False)
    practice_date: Mapped[int] = mapped_column(default=now)

    # 练习统计
    total_questions: Mapped[int] = mapped_column(default=0)
    correct_questions: Mapped[int] = mapped_column(default=0)
    total_time: Mapped[int] = mapped_column(default=0)
    score: Mapped[float] = mapped_column(default=0.0)

    # 知识点掌握情况 - JSON格式
    knowledge_scores: Mapped[str] = mapped_column(Text, default="{}")

    # 难度级别
    difficulty: Mapped[str] = mapped_column(String(50), default="adaptive")

    # 题目列表 - JSON格式存储题目ID数组
    question_ids: Mapped[str] = mapped_column(Text, default="[]")

    # 答案记录 - JSON格式，记录每道题的答题情况
    answers: Mapped[str] = mapped_column(Text, default="{}")

    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress/completed
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(UnitPracticeSession.unit_id) == Unit.id",
        lazy="joined",
    )
