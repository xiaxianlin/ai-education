from pydantic import BaseModel, Field
from typing import Optional


class CourseUnitCreate(BaseModel):
    textbook_id: int = Field(..., description="教材ID")
    name: str = Field(..., description="单元名称")
    content: Optional[str] = Field(default="", description="单元内容")


class CourseUnitUpdate(BaseModel):
    name: Optional[str] = Field(None, description="单元名称")
    content: Optional[str] = Field(None, description="单元内容")
    status: Optional[int] = Field(None, description="状态: 1-启用, 0-禁用")


class CourseUnitResponse(BaseModel):
    id: int
    textbook_id: int
    name: str
    content: str
    status: int
    create_time: int
    update_time: Optional[int]

    class Config:
        from_attributes = True


class CourseUnitListResponse(BaseModel):
    items: list[CourseUnitResponse]
    total: int
    page: int
    size: int