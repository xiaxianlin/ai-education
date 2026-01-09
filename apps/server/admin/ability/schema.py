"""
能力管理 Schema
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from shared.core.constants import SUBJECTS


class CreateAbilityDomainSchema(BaseModel):
    """创建能力域"""

    subject: str
    code: str = Field(..., description="能力域标识")
    name: str = Field(..., description="能力域名称")
    description: Optional[str] = Field(None, description="能力域描述")
    sort_order: int = Field(0, description="排序")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v


class UpdateAbilityDomainSchema(BaseModel):
    """更新能力域"""

    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[int] = None


class SearchAbilityDomainSchema(BaseModel):
    """搜索能力域"""

    subject: Optional[str] = None


class CreateAbilityAtomicSchema(BaseModel):
    """创建原子能力"""

    subject: str
    grade: int = Field(..., ge=1, le=6, description="年级（1-6）")
    domain_code: str = Field(..., description="能力域 code")
    code: str = Field(..., description="原子能力标识")
    name: str = Field(..., description="原子能力名称")
    description: Optional[str] = Field(None, description="能力描述")
    difficulty: int = Field(1, ge=1, le=5, description="难度 1-5")
    sort_order: int = Field(0, description="排序")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v


class UpdateAbilityAtomicSchema(BaseModel):
    """更新原子能力"""

    name: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = Field(None, ge=1, le=5)
    sort_order: Optional[int] = None
    is_active: Optional[int] = None


class SearchAbilityAtomicSchema(BaseModel):
    """搜索原子能力"""

    subject: Optional[str] = None
    grade: Optional[int] = Field(None, ge=1, le=6)
    domain_code: Optional[str] = None
