"""
Schema 模块

统一导出所有 Schema，保持向后兼容性。
"""

# 通用模块
# 认证模块
# 能力模块
from .ability import (
    AbilitySchema,
)
from .auth import ManagerSchema
from .common import ResponseSchema, SearchResultSchema, SearchSchema, T

# 掌握度模块
from .mastery import (
    MasteryLevelEnum,
    MasterySummarySchema,
    StudentAbilityMasterySchema,
    StudentAbilityMasteryWithInfoSchema,
)

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
    OptionSchema,
    QuestionContentSchema,
    QuestionSchema,
    QuestionTypeSchema,
    ResourceSchema,
)

# 学生模块
from .student import StudentSchema, StudentTextbookConfigSchema

# 教材模块
from .textbook import TeacherBookSchema, TextbookSchema, UnitSchema

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
    # 题目
    "QuestionTypeSchema",
    "QuestionSchema",
    "QuestionContentSchema",
    "OptionSchema",
    "ResourceSchema",
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
    "AbilitySchema",
    # 掌握度
    "MasteryLevelEnum",
    "StudentAbilityMasterySchema",
    "StudentAbilityMasteryWithInfoSchema",
    "MasterySummarySchema",
]
