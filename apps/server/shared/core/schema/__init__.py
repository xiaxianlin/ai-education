"""
Schema 模块

统一导出所有 Schema，保持向后兼容性。
"""

# 通用模块
# 认证模块
from .auth import ManagerSchema
from .common import ResponseSchema, SearchResultSchema, SearchSchema, T

# 练习模块
from .practice import (
    PracticeAnswerSchema,
    PracticeDataSchema,
    PracticeParameterSchema,
    PracticeReportSchema,
    PracticeSchema,
    QuestionTypeConfigItem,
    TemplateVariableSchema,
)

# 题目模块
from .question import (
    AnswerSchema,
    FeedbackConfigSchema,
    FeedbackItemSchema,
    OptionSchema,
    QuestionSchema,
    QuestionTypeSchema,
    ResourceSchema,
    StemSchema,
    SubQuestionSchema,
    SubStemSchema,
)

# 学生模块
from .student import StudentSchema, StudentTextbookConfigSchema

# 教材模块
from .textbook import KnowledgeSchema, TeacherBookSchema, TextbookSchema, UnitSchema

# 能力模块
from .ability import (
    AbilityAtomicSchema,
    AbilityDomainSchema,
)

# 掌握度模块
from .mastery import (
    MasteryLevelEnum,
    StudentAbilityMasterySchema,
    StudentAbilityMasteryWithInfoSchema,
    DomainMasterySchema,
    MasterySummarySchema,
)

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
    # 题目
    "QuestionTypeSchema",
    "QuestionSchema",
    "AnswerSchema",
    "SubStemSchema",
    "OptionSchema",
    "ResourceSchema",
    "SubQuestionSchema",
    "StemSchema",
    "FeedbackItemSchema",
    "FeedbackConfigSchema",
    # 练习
    "PracticeParameterSchema",
    "QuestionTypeConfigItem",
    "TemplateVariableSchema",
    "PracticeSchema",
    "PracticeAnswerSchema",
    "PracticeReportSchema",
    "PracticeDataSchema",
    # 学生
    "StudentSchema",
    "StudentTextbookConfigSchema",
    # 能力
    "AbilityDomainSchema",
    "AbilityAtomicSchema",
    # 掌握度
    "MasteryLevelEnum",
    "StudentAbilityMasterySchema",
    "StudentAbilityMasteryWithInfoSchema",
    "DomainMasterySchema",
    "MasterySummarySchema",
]
