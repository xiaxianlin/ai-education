"""
提示词 Schema
"""

from typing import Optional

from pydantic import BaseModel


class PromptSchema(BaseModel):
    """提示词信息"""

    id: int
    name: str
    slug: str
    type: str
    description: Optional[str] = None
    template_content: str
    negative_content: Optional[str] = None
    model_params: dict = {}
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


__all__ = ["PromptSchema"]
