"""
能力相关 Schema
"""

from typing import Optional

from pydantic import BaseModel


class AbilitySchema(BaseModel):
    """能力信息"""

    id: int
    subject: str
    grade: int
    code: str
    name: str
    description: Optional[str] = None
    difficulty: int = 1
    is_active: int = 1
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


__all__ = [
    "AbilitySchema",
]
