"""
练习相关模型

包含 Practice、PracticeAnswer、PracticeReport

练习类型分类：
- ability_practice: 能力练习 - 基于原子能力 code 生成题目
- unit_practice: 单元练习 - 基于单元 ID 生成题目
"""

import uuid
from typing import TYPE_CHECKING, Optional

from .base import (
    BaseModel,
    Integer,
    Mapped,
    String,
    Text,
    mapped_column,
    now,
    relationship,
)

if TYPE_CHECKING:
    from .question import Question
    from .student import Student


def generate_session_id() -> str:
    """生成练习会话 ID (UUID v4)"""
    return str(uuid.uuid4())


class Practice(BaseModel):
    """练习表

    练习类型 (practice_type):
    - ability_practice: 能力练习 - 基于原子能力 code 列表生成
    - unit_practice: 单元练习 - 基于单元 ID 生成

    生成状态 (generate_status):
    - 0: 生成中
    - 1: 已完成
    - -1: 生成失败
    """

    __tablename__ = "ah_practice"

    # 使用 UUID v4 作为主键
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_session_id, comment="会话ID (UUID v4)"
    )
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    practice_type: Mapped[str] = mapped_column(
        String(50), index=True, comment="练习类型: ability_practice/unit_practice"
    )

    # 练习参数字段
    subject: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, index=True, comment="科目"
    )
    grade: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True, comment="年级")
    ability_code: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True, comment="原子能力代码"
    )
    unit_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True, comment="单元ID"
    )

    # 题目统计
    question_count: Mapped[int] = mapped_column(default=0, comment="题目数量")
    answer_count: Mapped[int] = mapped_column(default=0, comment="回答数量")
    correct_count: Mapped[int] = mapped_column(default=0, comment="正确数量")

    # 状态字段
    status: Mapped[int] = mapped_column(
        default=0, index=True, comment="未开始: 0, 进行中: 1, 已完成: 2, 已废弃: 3"
    )
    generate_status: Mapped[int] = mapped_column(
        default=0, index=True, comment="生成中: 0, 已完成: 1, 生成失败: -1"
    )
    generate_time: Mapped[Optional[int]] = mapped_column(nullable=True, comment="生成耗时(秒)")
    start_time: Mapped[int] = mapped_column(default=now, comment="开始时间")
    end_time: Mapped[Optional[int]] = mapped_column(nullable=True, comment="结束时间")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")

    # 关联关系
    student: Mapped["Student"] = relationship(
        "Student",
        primaryjoin="foreign(Practice.student_id) == Student.id",
        lazy="select",
    )


class PracticeAnswer(BaseModel):
    """答题记录表"""

    __tablename__ = "ah_practice_answer"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 基础关联字段 - session_id 改为 str 类型 (UUID v4)
    session_id: Mapped[str] = mapped_column(String(36), index=True, comment="会话ID (UUID v4)")
    question_id: Mapped[str] = mapped_column(String(255), index=True, comment="题目ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    question_order: Mapped[int] = mapped_column(comment="题目顺序")

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
        primaryjoin="foreign(PracticeAnswer.question_id) == Question.id",
        lazy="joined",
    )


class PracticeReport(BaseModel):
    """练习报告表"""

    __tablename__ = "ah_practice_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(36), unique=True, index=True, comment="会话ID (UUID v4)"
    )
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
    "PracticeAnswer",
    "PracticeReport",
    "generate_session_id",
]
