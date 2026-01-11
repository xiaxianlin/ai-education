"""
数据库模型模块

统一导出所有数据库模型，保持向后兼容性。
"""

# SQLAlchemy 类型（向后兼容导出）
from sqlalchemy.ext.asyncio import AsyncSession

# 基础模块
from .base import (
    async_engine,
    AsyncSessionLocal,
    init_database,
    get_db,
    get_async_session,
    Database,
    Base,
    BaseModel,
)

# 认证模块
from .auth import Manager

# 教材模块
from .textbook import Textbook, Unit, Knowledge, TeacherBook

# 练习模块
from .practice import (
    Practice,
    PracticeAnswer,
    PracticeReport,
    generate_session_id,
)

# 学生模块
from .student import Student, StudentSubjectVersion

# 题目模块
from .question import QuestionType, Question

# 能力模块
from .ability import AbilityDomain, AbilityAtomic

# 掌握度模块
from .mastery import StudentAbilityMastery


__all__ = [
    # SQLAlchemy
    "AsyncSession",
    # 基础
    "async_engine",
    "AsyncSessionLocal",
    "init_database",
    "get_db",
    "get_async_session",
    "Database",
    "Base",
    "BaseModel",
    # 认证
    "Manager",
    # 教材
    "Textbook",
    "Unit",
    "Knowledge",
    "TeacherBook",
    # 练习
    "Practice",
    "PracticeAnswer",
    "PracticeReport",
    "generate_session_id",
    # 学生
    "Student",
    "StudentSubjectVersion",
    # 题目
    "QuestionType",
    "Question",
    # 能力
    "AbilityDomain",
    "AbilityAtomic",
    # 掌握度
    "StudentAbilityMastery",
]
