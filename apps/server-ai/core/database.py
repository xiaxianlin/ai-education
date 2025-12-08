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
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[int] = mapped_column(default=0)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)


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


class TeacherBook(BaseModel):
    __tablename__ = "ah_teacher_book"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[str] = mapped_column(String(255), nullable=False)
    file: Mapped[str] = mapped_column(String(255), nullable=True)
    index_file_id: Mapped[str] = mapped_column(String(255), nullable=True)


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


class Student(BaseModel):
    __tablename__ = "ah_student"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), default="")
    token: Mapped[str] = mapped_column(String(255), index=True)
    grade: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)


class StudentTextbook(BaseModel):
    __tablename__ = "ah_student_textbook"
    __table_args__ = (
        # 添加联合唯一索引，防止重复绑定
        {"mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False, index=True)

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(StudentTextbook.textbook_id) == Textbook.id",
        lazy="joined",
    )


# 练习会话表，合并单元练习、每日练习、能力评估
class PracticeSession(BaseModel):
    __tablename__ = "ah_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="会话ID")
    student_id: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True, comment="学生ID"
    )
    session_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="会话类型:daily_practice/unit_practice/assessment",
    )

    target_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID或者时间戳")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")
    question_count: Mapped[int] = mapped_column(default=0, comment="题目数量")
    answer_count: Mapped[int] = mapped_column(default=0, comment="回答数量")
    correct_count: Mapped[int] = mapped_column(default=0, comment="正确数量")

    status: Mapped[int] = mapped_column(
        default=0, index=True, comment="会话状态:0 - 未开始，1 - 作答中，2 - 已完成"
    )
    generate_status: Mapped[int] = mapped_column(
        default=0, index=True, comment="生成状态 0 - 生成中；1 - 生成成功 "
    )
    start_time: Mapped[int] = mapped_column(default=now, comment="开始时间")
    end_time: Mapped[int] = mapped_column(nullable=True, comment="结束时间")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(PracticeSession.textbook_id) == Textbook.id",
        lazy="joined",
    )


# 答题记录表
class PracticeAnswer(BaseModel):
    __tablename__ = "ah_practice_answer"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="会话ID")
    question_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="题目ID")
    question_order: Mapped[int] = mapped_column(nullable=False, comment="题目顺序")

    # 答题信息
    text_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="文本答案")
    status: Mapped[int] = mapped_column(default=0, comment="答题状态: 0-未答 1-正确 2-错误")
    time_spent: Mapped[int] = mapped_column(default=0, comment="耗时(秒)")
    submit_time: Mapped[int] = mapped_column(nullable=True, comment="提交时间")
    audio_answer: Mapped[str] = mapped_column(
        String(255), nullable=True, comment="语音回答（OSS 存储路径）"
    )

    question: Mapped["Question"] = relationship(
        "Question",
        primaryjoin="foreign(PracticeAnswer.question_id) == Question.id",
        lazy="joined",
    )


# 学生错题记录表（每次答错都记录）
class PracticeWrongRecord(BaseModel):
    __tablename__ = "ah_practice_wrong_record"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True, comment="学生ID"
    )
    question_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="题目ID")
    session_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="练习会话ID")

    # 题目相关信息（冗余存储，避免关联查询）
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")

    # 答题信息
    user_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="用户答案")
    correct_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="正确答案")
    analysis: Mapped[str] = mapped_column(Text, nullable=True, comment="错题分析")
    time_spent: Mapped[int] = mapped_column(default=0, comment="答题耗时(秒)")

    # 状态信息
    is_corrected: Mapped[int] = mapped_column(default=0, comment="是否已订正（再次答对）")
    corrected_time: Mapped[int] = mapped_column(default=0, comment="订正时间")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, comment="更新时间")


# 练习报告表
class PracticeReport(BaseModel):
    __tablename__ = "ah_practice_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(nullable=False, unique=True, index=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False, comment="学生ID")

    # 总体统计
    total_questions: Mapped[int] = mapped_column(default=0, comment="题目数量")
    correct_questions: Mapped[int] = mapped_column(default=0, comment="正确数量")
    total_time: Mapped[int] = mapped_column(default=0, comment="总耗时(秒)")
    overall_score: Mapped[float] = mapped_column(default=0.0, comment="总得分")

    # 能力评估（主要用于assessment）
    current_ability: Mapped[float] = mapped_column(default=0.0, comment="当前能力值（-3到+3）")
    confidence: Mapped[float] = mapped_column(default=0.0, comment="置信度")
    ability_level: Mapped[str] = mapped_column(String(50), default="", comment="能力等级")
    percentile: Mapped[int] = mapped_column(default=0, comment="百分位排名")

    # 详细分析 - JSON格式
    knowledge_scores: Mapped[str] = mapped_column(Text, default="{}", comment="知识点掌握情况")
    question_distribution: Mapped[str] = mapped_column(Text, default="{}", comment="题目来源分布")
    ability_breakdown: Mapped[str] = mapped_column(Text, default="{}", comment="能力分解（按难度）")
    learning_speed: Mapped[float] = mapped_column(default=0.0, comment="学习速度")
    consistency: Mapped[float] = mapped_column(default=0.0, comment="稳定性")

    # 建议 - JSON格式
    strengths: Mapped[str] = mapped_column(Text, default="[]", comment="优势")
    weaknesses: Mapped[str] = mapped_column(Text, default="[]", comment="薄弱点")
    recommendations: Mapped[str] = mapped_column(Text, default="[]", comment="学习建议")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
