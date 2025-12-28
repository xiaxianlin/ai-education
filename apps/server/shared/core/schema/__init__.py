"""
Schema 模块

统一导出所有 Schema，保持向后兼容性。
"""

# 通用模块
from .common import T, ResponseSchema, SearchSchema, SearchResultSchema

# 认证模块
from .auth import ManagerSchema

# 教材模块
from .textbook import TextbookSchema, TeacherBookSchema, UnitSchema, KnowledgeSchema

# 提示词模块
from .prompt import PromptSchema

# 题目模块
from .question import (
    QuestionTypeSchema,
    QuestionSchema,
    QuestionTemplateSchema,
    AnswerSchema,
    SubStemSchema,
    OptionSchema,
    ResourceSchema,
    SubQuestionSchema,
    StemSchema,
    FeedbackItemSchema,
    FeedbackConfigSchema,
)

# 练习模块
from .practice import (
    PracticeSchema,
    PracticeParameterSchema,
    QuestionTypeConfigItem,
    TemplateVariableSchema,
    PracticePromptSchema,
    PracticeSessionSchema,
    PracticeSessionAnswerSchema,
    PracticeSessionReportSchema,
    PracticeSessionDataSchema,
)

# 学生模块
from .student import StudentSchema, StudentTextbookSchema, StudentPracticeSchema


__all__ = [
    # 通用
    "T",
    "ResponseSchema",
    "SearchSchema",
    "SearchResultSchema",
    # 认证
    "ManagerSchema",
    # 教材
    "TextbookSchema",
    "TeacherBookSchema",
    "UnitSchema",
    "KnowledgeSchema",
    # 提示词
    "PromptSchema",
    # 题目
    "QuestionTypeSchema",
    "QuestionSchema",
    "QuestionTemplateSchema",
    "AnswerSchema",
    "SubStemSchema",
    "OptionSchema",
    "ResourceSchema",
    "SubQuestionSchema",
    "StemSchema",
    "FeedbackItemSchema",
    "FeedbackConfigSchema",
    # 练习
    "PracticeSchema",
    "PracticeParameterSchema",
    "QuestionTypeConfigItem",
    "TemplateVariableSchema",
    "PracticePromptSchema",
    "PracticeSessionSchema",
    "PracticeSessionAnswerSchema",
    "PracticeSessionReportSchema",
    "PracticeSessionDataSchema",
    # 学生
    "StudentSchema",
    "StudentTextbookSchema",
    "StudentPracticeSchema",
]
