"""
管理员 Schema
"""

from typing import Optional

from pydantic import BaseModel


class ManagerSchema(BaseModel):
    """管理员信息"""

    id: str
    username: str
    type: int
    status: int
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


__all__ = ["ManagerSchema"]
