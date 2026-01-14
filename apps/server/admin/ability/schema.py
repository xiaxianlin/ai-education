"""
能力管理 Schema
"""

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.constants import SUBJECTS


class CreateAbilitySchema(BaseModel):
    """创建能力"""

    subject: str
    grade: int = Field(..., ge=1, le=6, description="年级（1-6）")
    code: str = Field(..., description="能力标识")
    name: str = Field(..., description="能力名称")
    description: Optional[str] = Field(None, description="能力描述")
    difficulty: int = Field(1, ge=1, le=5, description="难度 1-5")

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v


class UpdateAbilitySchema(BaseModel):
    """更新能力"""

    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[int] = None


class SearchAbilitySchema(BaseModel):
    """搜索能力"""

    subject: Optional[str] = None
    grade: Optional[int] = Field(None, ge=1, le=6)


class BatchDeleteAbilitySchema(BaseModel):
    """批量删除能力"""

    ids: List[int] = Field(..., description="能力ID列表", min_length=1)
