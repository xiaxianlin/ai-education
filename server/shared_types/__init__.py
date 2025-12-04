"""
共享类型定义模块
从 TypeScript 类型自动生成的 Pydantic 模型
"""

# 使用修复版本的模型（解决前向引用问题）
from .models_fixed import *

# 导出所有模型，方便其他模块使用
__all__ = [
    # 枚举
    'Status',
    'Gender',
    'Subject',
    'Grade',
    'Semester',
    'QuestionType',
    'Difficulty',
    'ResourceType',
    'PracticeType',
    'PracticeSessionStatus',
    'PracticeGenerateStatus',
    'AnswerStatus',

    # 基础
    'BaseEntity',
    'ApiResponse',
    'PaginatedResponse',

    # 用户
    'Admin',
    'LoginRequest',
    'LoginResponse',
    'Student',
    'StudentLoginRequest',
    'StudentLoginResponse',
    'StudentStatistics',

    # 教育
    'Textbook',
    'Unit',
    'Knowledge',
    'Question',

    # 练习
    'PracticeSession',
    'CreatePracticeRequest',
    'PracticeAnswer',
    'SubmitAnswerRequest',
    'SubmitAnswerResponse',
    'WrongRecord',
]