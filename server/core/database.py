from fastapi import Depends
from sqlalchemy import String, Text, UniqueConstraint, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column, DeclarativeBase, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from core.settings import envs
from shared.utils.time import now

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
    """知识点模型（简化版，两级结构：单元 -> 知识点）"""
    __tablename__ = "ah_knowledge"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    
    # 知识点属性（简化）
    difficulty: Mapped[str] = mapped_column(String(50), nullable=True, comment="知识点难度（简单/普通/困难）")
    importance: Mapped[int] = mapped_column(default=5, comment="重要性（1-10，10最重要）")
    order: Mapped[int] = mapped_column(default=0, comment="同级知识点排序")
    
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
    
    # 关联关系
    # questions: 题目关联已移除（QuestionKnowledge 表被删除）


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
    resource_type: Mapped[str] = mapped_column(
        String(50), comment="资源类型：image-图片，audio-语音，空-无资源", nullable=True
    )
    resource_content: Mapped[str] = mapped_column(
        Text, comment="资源内容（录音文本等）", nullable=True
    )
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
    
    # 关联关系
    # knowledge_points: 知识点关联已移除（QuestionKnowledge 表被删除）


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





# 学生错题记录表（每次答错都记录）
class StudentWrongRecord(BaseModel):
    __tablename__ = "ah_student_wrong_record"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    question_id: Mapped[int] = mapped_column(nullable=False, index=True)
    session_id: Mapped[int] = mapped_column(nullable=False, index=True)  # 练习会话ID

    # 题目相关信息（冗余存储，避免关联查询）
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True)  # 单元ID
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True)  # 知识点
    textbook_id: Mapped[int] = mapped_column(nullable=True)  # 教材ID

    # 答题信息
    user_answer: Mapped[str] = mapped_column(Text, nullable=True)  # 用户答案
    correct_answer: Mapped[str] = mapped_column(Text, nullable=True)  # 正确答案
    time_spent: Mapped[int] = mapped_column(default=0)  # 耗时(秒)

    # 状态信息
    is_corrected: Mapped[int] = mapped_column(default=0)  # 是否已订正（再次答对）
    corrected_time: Mapped[int] = mapped_column(default=0)  # 订正时间

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    session: Mapped["PracticeSession"] = relationship(
        "PracticeSession",
        backref="wrong_records"
    )


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




# 统一的练习会话表，合并单元练习、每日练习、能力评估
class PracticeSession(BaseModel):
    __tablename__ = "ah_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    session_type: Mapped[str] = mapped_column(String(50), nullable=False)  # daily/unit/assessment

    # 关联目标（单元ID、日期等，根据session_type决定含义）
    target_id: Mapped[int] = mapped_column(nullable=True)  # 单元ID（unit）或日期（daily）
    textbook_id: Mapped[int] = mapped_column(nullable=True)  # 教材ID

    # 会话状态
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress/completed
    start_time: Mapped[int] = mapped_column(default=now)
    end_time: Mapped[int] = mapped_column(nullable=True)

    # 自适应相关（主要用于assessment）
    adaptive: Mapped[int] = mapped_column(default=1)  # 是否自适应
    max_questions: Mapped[int] = mapped_column(default=30)
    min_questions: Mapped[int] = mapped_column(default=30)

    # 难度级别（主要用于unit）
    difficulty: Mapped[str] = mapped_column(String(50), default="adaptive")

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(PracticeSession.target_id) == Unit.id",
        lazy="joined",
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(PracticeSession.textbook_id) == Textbook.id",
        lazy="joined",
    )

    # 关联关系 - 答题记录
    answers: Mapped[list["PracticeAnswer"]] = relationship(
        "PracticeAnswer",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    # 关联关系 - 练习报告
    report: Mapped["PracticeReport"] = relationship(
        "PracticeReport",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )


# 答题记录表
class PracticeAnswer(BaseModel):
    __tablename__ = "ah_practice_answer"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("ah_practice_session.id"), nullable=False, index=True)
    question_id: Mapped[int] = mapped_column(nullable=False, index=True)
    question_order: Mapped[int] = mapped_column(nullable=False)  # 题目顺序

    # 答题信息
    user_answer: Mapped[str] = mapped_column(Text, nullable=True)  # 用户答案
    is_correct: Mapped[int] = mapped_column(default=0)  # 0-未答 1-正确 2-错误
    time_spent: Mapped[int] = mapped_column(default=0)  # 耗时(秒)
    submit_time: Mapped[int] = mapped_column(nullable=True)  # 提交时间
    audio_url: Mapped[str] = mapped_column(String(500), nullable=True)  # 录音URL

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    session: Mapped["PracticeSession"] = relationship(
        "PracticeSession",
        back_populates="answers"
    )


# 练习报告表（统一的练习结果统计和能力分析）
class PracticeReport(BaseModel):
    __tablename__ = "ah_practice_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("ah_practice_session.id"), nullable=False, unique=True, index=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)

    # 总体统计
    total_questions: Mapped[int] = mapped_column(default=0)
    correct_questions: Mapped[int] = mapped_column(default=0)
    total_time: Mapped[int] = mapped_column(default=0)
    overall_score: Mapped[float] = mapped_column(default=0.0)

    # 能力评估（主要用于assessment）
    current_ability: Mapped[float] = mapped_column(default=0.0)  # 当前能力值（-3到+3）
    confidence: Mapped[float] = mapped_column(default=0.0)  # 置信度
    ability_level: Mapped[str] = mapped_column(String(50), default="")  # beginner/intermediate/advanced
    percentile: Mapped[int] = mapped_column(default=0)  # 百分位排名

    # 详细分析 - JSON格式
    knowledge_scores: Mapped[str] = mapped_column(Text, default="{}")  # 知识点掌握情况
    question_distribution: Mapped[str] = mapped_column(Text, default="{}")  # 题目来源分布
    ability_breakdown: Mapped[str] = mapped_column(Text, default="{}")  # 能力分解（按难度）
    learning_speed: Mapped[float] = mapped_column(default=0.0)  # 学习速度
    consistency: Mapped[float] = mapped_column(default=0.0)  # 稳定性

    # 建议 - JSON格式
    strengths: Mapped[str] = mapped_column(Text, default="[]")  # 优势
    weaknesses: Mapped[str] = mapped_column(Text, default="[]")  # 薄弱点
    recommendations: Mapped[str] = mapped_column(Text, default="[]")  # 学习建议

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    session: Mapped["PracticeSession"] = relationship(
        "PracticeSession",
        back_populates="report"
    )


