from fastapi import Depends
from shared.core.settings import envs
from shared.utils.time import now
from sqlalchemy import JSON, Boolean, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    column_property,
    mapped_column,
    relationship,
    sessionmaker,
)

async_engine = create_async_engine(
    envs.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # 连接池预检查，确保连接有效
    pool_size=envs.DATABASE_POOL_SIZE,  # 连接池大小
    max_overflow=envs.DATABASE_MAX_OVERFLOW,  # 最大溢出连接数
    pool_timeout=envs.DATABASE_POOL_TIMEOUT,  # 连接超时时间
    pool_recycle=envs.DATABASE_POOL_RECYCLE,  # 连接回收时间，避免MySQL的wait_timeout问题
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
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
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
    __tablename__ = "ah_teacher_book"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[str] = mapped_column(String(255), nullable=False)
    file: Mapped[str] = mapped_column(String(255), nullable=True)
    index_file_id: Mapped[str] = mapped_column(String(255), nullable=True)


# ================ Prompt 相关表 ================


class Prompt(BaseModel):
    __tablename__ = "ah_prompt"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), comment="Prompt 名称")
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True, comment="唯一短名")
    type: Mapped[str] = mapped_column(String(64), comment="类型：system/user")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="描述")
    template_content: Mapped[str] = mapped_column(Text, comment="模版内容")
    negative_content: Mapped[str] = mapped_column(Text, nullable=True, comment="用于图像生成类")
    model_params: Mapped[dict] = mapped_column(JSON, default=dict, comment="模型参数")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


# ================ 练习相关表 ================


class Practice(BaseModel):
    """练习表"""

    __tablename__ = "ah_practice"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), comment="练习名称")
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, comment="练习标识")
    type: Mapped[str] = mapped_column(String(20), index=True, comment="类型：system/custom")
    icon: Mapped[str] = mapped_column(String(255), nullable=True, comment="图标URL")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="描述")
    parameters: Mapped[list] = mapped_column(JSON, default=list, comment="配置参数")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


class PracticePrompt(BaseModel):
    """练习提示词关联表"""

    __tablename__ = "ah_practice_prompt"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(50), comment="科目")
    grade: Mapped[int] = mapped_column(comment="年级")
    practice_slug: Mapped[str] = mapped_column(String(50), comment="练习标识")
    prompt_slug: Mapped[str] = mapped_column(String(50), comment="提示词标识")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    practice: Mapped["Practice"] = relationship(
        "Practice",
        primaryjoin="foreign(PracticePrompt.practice_slug) == Practice.slug",
        lazy="joined",
    )
    prompt: Mapped["Prompt"] = relationship(
        "Prompt",
        primaryjoin="foreign(PracticePrompt.prompt_slug) == Prompt.slug",
        lazy="joined",
    )


# 练习会话表，合并单元练习、日常练习、综合评估
class PracticeSession(BaseModel):
    __tablename__ = "ah_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="会话ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    practice_id: Mapped[int] = mapped_column(comment="练习ID")
    practice_slug: Mapped[str] = mapped_column(String(50), comment="练习标识")
    parameters: Mapped[dict] = mapped_column(JSON, default=dict, comment="练习参数")

    question_count: Mapped[int] = mapped_column(default=0, comment="题目数量")
    answer_count: Mapped[int] = mapped_column(default=0, comment="回答数量")
    correct_count: Mapped[int] = mapped_column(default=0, comment="正确数量")

    status: Mapped[int] = mapped_column(
        default=0, index=True, comment="未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3"
    )
    generate_status: Mapped[int] = mapped_column(
        default=0, index=True, comment="未生成: 0, 生成中: 1, 已生成: 2"
    )
    generate_time: Mapped[int] = mapped_column(nullable=True, comment="生成时间")
    start_time: Mapped[int] = mapped_column(default=now, comment="开始时间")
    end_time: Mapped[int] = mapped_column(nullable=True, comment="结束时间")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # ========================== parameters 的生成列字段 ========================== #
    textbook_id = column_property(mapped_column(Integer), deferred=False)
    unit_id = column_property(mapped_column(Integer), deferred=False)

    practice: Mapped["Practice"] = relationship(
        "Practice",
        primaryjoin="foreign(PracticeSession.practice_id) == Practice.id",
        lazy="joined",
    )


# 答题记录表（合并了原 PracticeWrongRecord 的功能）
class PracticeSessionAnswer(BaseModel):
    __tablename__ = "ah_practice_session_answer"

    # 主键
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础关联字段
    session_id: Mapped[int] = mapped_column(index=True, comment="会话ID")
    question_id: Mapped[str] = mapped_column(String(255), index=True, comment="题目ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    question_order: Mapped[int] = mapped_column(comment="题目顺序")

    # 题目相关信息（冗余存储，避免关联查询）
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")

    # 答题信息
    text_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="学生答案")
    status: Mapped[int] = mapped_column(default=0, comment="答题状态: 0-未答 1-正确 2-错误")
    time_spent: Mapped[int] = mapped_column(default=0, comment="耗时(秒)")
    submit_time: Mapped[int] = mapped_column(nullable=True, comment="提交时间")

    # 错题相关字段（仅当 status=2 时有值）
    correct_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="正确答案")
    analysis: Mapped[str] = mapped_column(Text, nullable=True, comment="错题分析")
    is_corrected: Mapped[int] = mapped_column(default=0, comment="是否已订正 0-未订正 1-已订正")
    corrected_time: Mapped[int] = mapped_column(nullable=True, comment="订正时间")

    # 时间字段
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    question: Mapped["Question"] = relationship(
        "Question",
        primaryjoin="foreign(PracticeSessionAnswer.question_id) == Question.id",
        lazy="joined",
    )


# 练习报告表
class PracticeSessionReport(BaseModel):
    __tablename__ = "ah_practice_session_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(unique=True, index=True)
    student_id: Mapped[str] = mapped_column(String(255), comment="学生ID")

    # 总体统计
    total_questions: Mapped[int] = mapped_column(default=0, comment="题目数量")
    correct_questions: Mapped[int] = mapped_column(default=0, comment="正确数量")
    total_time: Mapped[int] = mapped_column(default=0, comment="总耗时(秒)")
    overall_score: Mapped[float] = mapped_column(default=0.0, comment="总得分")

    # 综合评估（主要用于assessment）
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


# ================ 学生相关表 ================


class Student(BaseModel):
    __tablename__ = "ah_student"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), default="")
    token: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    grade: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)


class StudentTextbook(BaseModel):
    __tablename__ = "ah_student_textbook"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), index=True)
    textbook_id: Mapped[int] = mapped_column(index=True)

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(StudentTextbook.textbook_id) == Textbook.id",
        lazy="joined",
    )


class StudentPractice(BaseModel):
    __tablename__ = "ah_student_practice"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), index=True)
    practice_id: Mapped[int] = mapped_column(index=True)

    practice: Mapped["Practice"] = relationship(
        "Practice",
        primaryjoin="foreign(StudentPractice.practice_id) == Practice.id",
        lazy="joined",
    )


# ================ 题型与题目相关表 ================


class QuestionType(BaseModel):
    """题型配置表"""

    __tablename__ = "ah_question_type"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础信息
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="题型编码")
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="题型名称")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="题型描述")

    # 适用范围
    subject: Mapped[str] = mapped_column(String(50), nullable=False, comment="科目")
    stages: Mapped[list] = mapped_column(JSON, nullable=False, comment="适用学段列表")
    grades: Mapped[list] = mapped_column(JSON, nullable=False, comment="适用年级列表")

    # 交互配置
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="交互类型")
    interaction_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="交互配置")

    # 资源配置
    resource_type: Mapped[str] = mapped_column(String(50), default="none", comment="资源类型")
    resource_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="资源配置")

    # 答案配置
    answer_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="答案类型")
    answer_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="答案配置")

    # 反馈配置
    feedback_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="反馈配置")

    # 认知与能力
    cognitive_levels: Mapped[list] = mapped_column(JSON, nullable=True, comment="认知层次列表")
    ability_dimensions: Mapped[list] = mapped_column(JSON, nullable=True, comment="能力维度列表")

    # AI生成
    ai_prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="AI生成指令")
    output_schema: Mapped[dict] = mapped_column(JSON, nullable=True, comment="AI输出JSON Schema")

    # 元数据
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


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
    stage: Mapped[str] = mapped_column(String(20), nullable=False, comment="学段")

    # 教材关联
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")

    # 题目内容
    stem: Mapped[dict] = mapped_column(JSON, nullable=False, comment="题干")
    options: Mapped[list] = mapped_column(JSON, nullable=True, comment="选项列表")
    blanks: Mapped[list] = mapped_column(JSON, nullable=True, comment="填空位置配置")

    # 资源
    resources: Mapped[list] = mapped_column(JSON, nullable=True, comment="资源列表")

    # 答案
    answer: Mapped[dict] = mapped_column(JSON, nullable=False, comment="答案配置")
    explanation: Mapped[str] = mapped_column(Text, nullable=True, comment="解析")

    # 难度与认知
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, comment="难度")
    cognitive_level: Mapped[str] = mapped_column(String(20), nullable=True, comment="认知层次")

    # 知识点
    knowledge_points: Mapped[list] = mapped_column(JSON, nullable=True, comment="知识点列表")
    ability_tags: Mapped[list] = mapped_column(JSON, nullable=True, comment="能力标签")

    # 来源
    source: Mapped[str] = mapped_column(String(50), default="ai", comment="来源")
    prompt_id: Mapped[int] = mapped_column(nullable=True, comment="生成此题的Prompt ID")

    # 统计
    usage_count: Mapped[int] = mapped_column(default=0, comment="使用次数")
    correct_rate: Mapped[str] = mapped_column(String(10), nullable=True, comment="正确率")
    avg_time_spent: Mapped[int] = mapped_column(nullable=True, comment="平均用时(秒)")

    # 元数据
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # 关联关系
    question_type: Mapped["QuestionType"] = relationship(
        "QuestionType",
        primaryjoin="foreign(Question.question_type_id) == QuestionType.id",
        lazy="joined",
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Question.textbook_id) == Textbook.id",
        lazy="joined",
    )

    unit: Mapped["Unit"] = relationship(
        "Unit",
        primaryjoin="foreign(Question.unit_id) == Unit.id",
        lazy="joined",
    )


class QuestionTemplate(BaseModel):
    """题目模板表 - 用于AI批量生成"""

    __tablename__ = "ah_question_template"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 关联
    question_type_id: Mapped[int] = mapped_column(nullable=False, index=True, comment="题型ID")

    # 模板内容
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="模板名称")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="模板描述")

    # 生成配置
    variables: Mapped[dict] = mapped_column(JSON, nullable=True, comment="可变参数定义")
    constraints: Mapped[dict] = mapped_column(JSON, nullable=True, comment="约束条件")
    examples: Mapped[list] = mapped_column(JSON, nullable=True, comment="示例题目")

    # AI配置
    system_prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="System Prompt")
    user_prompt_template: Mapped[str] = mapped_column(
        Text, nullable=True, comment="User Prompt模板"
    )
    output_schema: Mapped[dict] = mapped_column(JSON, nullable=True, comment="输出Schema")

    # 质量控制
    quality_rules: Mapped[dict] = mapped_column(JSON, nullable=True, comment="质量检查规则")

    # 元数据
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # 关联关系
    question_type: Mapped["QuestionType"] = relationship(
        "QuestionType",
        primaryjoin="foreign(QuestionTemplate.question_type_id) == QuestionType.id",
        lazy="joined",
    )
