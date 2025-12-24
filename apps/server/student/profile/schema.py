from pydantic import BaseModel
from shared.core.schema import PracticeSchema, TextbookSchema


class StudentProfileSchema(BaseModel):
    name: str
    phone: str
    grade: int

    textbooks: list[TextbookSchema]
    practices: list[PracticeSchema]
