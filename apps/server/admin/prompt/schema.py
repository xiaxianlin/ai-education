from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator
from shared.core.schema import SearchSchema


class PromptDetailSchema(BaseModel):
    """提示词详情"""

    id: int
    name: str
    slug: str
    type: str
    description: Optional[str] = None

    last_version_id: int
    version_id: int
    template_content: str
    negative_content: Optional[str] = None
    model_params: Optional[dict] = None
    changelog: Optional[str] = None
    is_published: int = 0

    create_time: int
    update_time: Optional[int] = None


class SavePromptSchema(BaseModel):
    """提示词表单"""

    name: str = Field(..., min_length=1, max_length=128, description="Prompt 名称")
    slug: str = Field(..., min_length=1, max_length=128, description="唯一短名")
    type: str = Field(..., min_length=1, max_length=64, description="类型：system/user")
    description: Optional[str] = Field(None, max_length=1000, description="描述")
    tags: list[str] = []
    template_content: str = Field(..., min_length=1, description="模版内容")
    negative_content: Optional[str] = Field(None, max_length=2000, description="用于图像生成类")
    model_params: dict = {}
    timeout: Optional[int] = None


class PublishPromptSchema(BaseModel):
    """提示词发布表单"""

    changelog: str


class TestPromptSchema(BaseModel):
    """提示词测试表单"""

    input_payload: dict = {}
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    model_params: dict = {}
    generation_type: Optional[str] = "text"

    @field_validator("generation_type")
    @classmethod
    def validate_generation_type(cls, v):
        allowed_types = ["text", "image", "video", "audio"]
        if v and v not in allowed_types:
            raise ValueError(f"生成类型只能选择 {', '.join(allowed_types)}")
        return v or "text"


class SearchPromptSchema(SearchSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None


class SearchPromptVersionSchema(SearchSchema):
    prompt_id: int
