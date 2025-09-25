from typing import Optional
from pydantic import BaseModel


class CreateSchema(BaseModel):
    textbook_id: int
    course_unit_id: int
    name: str
    content: str


class UpdateSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    status: Optional[int] = None
