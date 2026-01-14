"""
题型与题目相关模型

包含 QuestionType、Question
"""

from typing import TYPE_CHECKING

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
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="题型描述")

    # 适用范围
    subject: Mapped[str] = mapped_column(String(50), nullable=False, comment="科目")
    stages: Mapped[list] = mapped_column(JSON, nullable=False, comment="适用学段列表")
    grades: Mapped[list] = mapped_column(JSON, nullable=False, comment="适用年级列表")

    # 交互配置
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="交互类型")
    interaction_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="交互配置")

    # 资源配置
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, default="text", comment="资源类型")
    resource_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="资源配置")

    # 答案配置
    answer_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="答案类型")
    answer_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="答案配置")

    # 反馈配置
    feedback_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="反馈配置")

    # 认知与能力
    cognitive_levels: Mapped[list] = mapped_column(JSON, nullable=True, comment="认知层次列表")
    
    # 能力关联
    ability_atomic_codes: Mapped[list] = mapped_column(
        JSON, 
        nullable=True, 
        comment="关联的能力代码列表（对应 Ability.code）"
    )

    # 难度
    difficulty: Mapped[str] = mapped_column(String(20), nullable=True, comment="难度：easy/medium/hard")

    # AI生成
    ai_prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="AI生成指令")
    output_schema: Mapped[dict] = mapped_column(JSON, nullable=True, comment="AI输出JSON Schema")

    # 元数据
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    __table_args__ = ()


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


__all__ = ["QuestionType", "Question"]
