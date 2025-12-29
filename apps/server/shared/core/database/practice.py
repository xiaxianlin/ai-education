"""
练习相关模型

包含 Practice、PracticeSession、PracticeSessionAnswer、PracticeSessionReport
"""

from typing import TYPE_CHECKING

from .base import (
    JSON,
    BaseModel,
    Boolean,
    Integer,
    Mapped,
    String,
    Text,
    column_property,
    mapped_column,
    now,
    relationship,
)

if TYPE_CHECKING:
    from .question import Question


class Practice(BaseModel):
    """练习表"""

    __tablename__ = "ah_practice"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础信息
    name: Mapped[str] = mapped_column(String(100), comment="练习名称")
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, comment="练习标识")
    type: Mapped[str] = mapped_column(String(20), index=True, comment="类型：system/custom")
    icon: Mapped[str] = mapped_column(String(255), nullable=True, comment="图标URL")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="描述")

    # 场景类型
    scene_type: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
        index=True,
        comment="场景类型：daily_training/unit_test/comprehensive_assessment",
    )

    # 适用范围
    subject: Mapped[str] = mapped_column(String(50), nullable=True, index=True, comment="科目")
    stages: Mapped[list] = mapped_column(JSON, default=list, comment="适用学段列表")
    grades: Mapped[list] = mapped_column(JSON, default=list, comment="适用年级列表")

    # 配置
    question_count_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="题量配置")
    difficulty_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="难度配置")
    ability_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="能力维度配置")
    feedback_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="反馈配置")
    parameters: Mapped[list] = mapped_column(JSON, default=list, comment="运行时配置参数")
    prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="提示词模板内容")

    # 元数据
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否启用")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


class PracticeSession(BaseModel):
    """练习会话表"""

    __tablename__ = "ah_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="会话ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    practice_id: Mapped[int] = mapped_column(comment="练习ID")
    practice_slug: Mapped[str] = mapped_column(String(50), comment="练习标识")
    parameters: Mapped[dict] = mapped_column(JSON, default=dict, comment="练习参数")

    question_count: Mapped[int] = mapped_column(default=0, comment="题目数量")
    answer_count: Mapped[int] = mapped_column(default=0, comment="回答数量")
    correct_count: Mapped[int] = mapped_column(default=0, comment="正确数量")

    status: Mapped[int] = mapped_column(default=0, index=True, comment="未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3")
    generate_status: Mapped[int] = mapped_column(default=0, index=True, comment="未生成: 0, 生成中: 1, 已生成: 2")
    generate_time: Mapped[int] = mapped_column(nullable=True, comment="生成时间")
    start_time: Mapped[int] = mapped_column(default=now, comment="开始时间")
    end_time: Mapped[int] = mapped_column(nullable=True, comment="结束时间")

    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # parameters 的生成列字段
    textbook_id = column_property(mapped_column(Integer), deferred=False)
    unit_id = column_property(mapped_column(Integer), deferred=False)

    practice: Mapped["Practice"] = relationship(
        "Practice",
        primaryjoin="foreign(PracticeSession.practice_id) == Practice.id",
        lazy="joined",
    )


class PracticeSessionAnswer(BaseModel):
    """答题记录表"""

    __tablename__ = "ah_practice_session_answer"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础关联字段
    session_id: Mapped[int] = mapped_column(index=True, comment="会话ID")
    question_id: Mapped[str] = mapped_column(String(255), index=True, comment="题目ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    question_order: Mapped[int] = mapped_column(comment="题目顺序")

    # 题目相关信息（冗余存储）
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")

    # 答题信息
    text_answer: Mapped[str] = mapped_column(Text, nullable=True, comment="学生答案")
    status: Mapped[int] = mapped_column(default=0, comment="答题状态: 0-未答 1-正确 2-错误")
    time_spent: Mapped[int] = mapped_column(default=0, comment="耗时(秒)")
    submit_time: Mapped[int] = mapped_column(nullable=True, comment="提交时间")

    # 错题相关字段
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


class PracticeSessionReport(BaseModel):
    """练习报告表"""

    __tablename__ = "ah_practice_session_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(unique=True, index=True)
    student_id: Mapped[str] = mapped_column(String(255), comment="学生ID")

    # 总体统计
    total_questions: Mapped[int] = mapped_column(default=0, comment="题目数量")
    correct_questions: Mapped[int] = mapped_column(default=0, comment="正确数量")
    total_time: Mapped[int] = mapped_column(default=0, comment="总耗时(秒)")
    overall_score: Mapped[float] = mapped_column(default=0.0, comment="总得分")

    # 综合评估
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


__all__ = [
    "Practice",
    "PracticeSession",
    "PracticeSessionAnswer",
    "PracticeSessionReport",
]
