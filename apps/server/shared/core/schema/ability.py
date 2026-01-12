"""
能力相关 Schema
"""

from typing import Optional

from pydantic import BaseModel


class AbilityAtomicSchema(BaseModel):
    """原子能力信息"""

    id: int
    subject: str
    grade: int
    domain_code: str
    code: str
    name: str
    description: Optional[str] = None
    difficulty: int = 1
    sort_order: int = 0
    is_active: int = 1
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class AbilityDomainSchema(BaseModel):
    """能力域信息"""

    id: int
    subject: str
    code: str
    name: str
    description: Optional[str] = None
    is_active: int = 1
    create_time: int
    update_time: int
    atomics: Optional[list[AbilityAtomicSchema]] = None

    model_config = {"from_attributes": True}


__all__ = [
    "AbilityDomainSchema",
    "AbilityAtomicSchema",
]
