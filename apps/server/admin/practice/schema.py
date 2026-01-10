from typing import Optional

from pydantic import BaseModel, Field


class SearchPracticeSchema(BaseModel):
    """搜索练习请求"""

    page: int = Field(default=1, ge=1, description="页码")
    size: int = Field(default=20, ge=1, le=100, description="每页数量")
    practice_type: Optional[str] = Field(
        default=None, description="练习类型: ability_practice/unit_practice"
    )
    status: Optional[int] = Field(
        default=None, description="状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃"
    )
    student_id: Optional[str] = Field(default=None, description="学生ID")
