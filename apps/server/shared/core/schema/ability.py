"""
能力相关 Schema
"""

from typing import Optional

from pydantic import BaseModel


class AbilityDomainSchema(BaseModel):
    """能力域信息"""

    id: int
    subject: str
    code: str
    name: str
    description: Optional[str] = None
    sort_order: int = 0
    is_active: int = 1
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


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


class AbilityDomainWithAtomicsSchema(BaseModel):
    """能力域信息（包含原子能力列表）"""

    id: int
    subject: str
    code: str
    name: str
    description: Optional[str] = None
    sort_order: int = 0
    is_active: int = 1
    create_time: int
    update_time: int
    atomics: list[AbilityAtomicSchema] = []

    model_config = {"from_attributes": True}


__all__ = [
    "AbilityDomainSchema",
    "AbilityAtomicSchema",
    "AbilityDomainWithAtomicsSchema",
]
