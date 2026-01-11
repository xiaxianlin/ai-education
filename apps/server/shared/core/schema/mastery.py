"""
掌握度相关 Schema

包含 StudentAbilityMasterySchema, MasterySummarySchema
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MasteryLevelEnum(str, Enum):
    """掌握等级枚举"""

    UNLEARNED = "unlearned"  # 0-39: 未掌握
    BEGINNER = "beginner"  # 40-59: 初步掌握
    PROFICIENT = "proficient"  # 60-79: 基本掌握
    MASTERED = "mastered"  # 80-100: 熟练掌握


class StudentAbilityMasterySchema(BaseModel):
    """学生能力掌握度 Schema"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: str
    ability_code: str
    mastery_score: float = Field(ge=0, le=100, description="掌握度 0-100")
    mastery_level: str = Field(description="掌握等级")
    correct_count: int = Field(ge=0, description="正确次数")
    wrong_count: int = Field(ge=0, description="错误次数")
    last_practice_time: Optional[int] = None
    create_time: int
    update_time: int


class StudentAbilityMasteryWithInfoSchema(StudentAbilityMasterySchema):
    """学生能力掌握度（含能力信息）"""

    ability_name: Optional[str] = Field(default=None, description="能力名称")
    ability_domain: Optional[str] = Field(default=None, description="能力域")
    subject: Optional[str] = Field(default=None, description="科目")
    grade: Optional[int] = Field(default=None, description="年级")


class DomainMasterySchema(BaseModel):
    """能力域掌握度统计"""

    domain_code: str = Field(description="能力域代码")
    domain_name: str = Field(description="能力域名称")
    avg_mastery_score: float = Field(description="平均掌握度")
    ability_count: int = Field(description="能力数量")
    mastered_count: int = Field(description="已掌握数量")


class MasterySummarySchema(BaseModel):
    """能力掌握度概览"""

    total_abilities: int = Field(description="总能力数")
    practiced_abilities: int = Field(description="已练习能力数")
    avg_mastery_score: float = Field(description="平均掌握度")
    level_distribution: dict[str, int] = Field(description="等级分布")
    domain_stats: list[DomainMasterySchema] = Field(description="能力域统计")


__all__ = [
    "MasteryLevelEnum",
    "StudentAbilityMasterySchema",
    "StudentAbilityMasteryWithInfoSchema",
    "DomainMasterySchema",
    "MasterySummarySchema",
]
