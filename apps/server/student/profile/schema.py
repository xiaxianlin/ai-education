from pydantic import BaseModel
from shared.core.schema import TextbookSchema


class StudentProfileSchema(BaseModel):
    name: str
    phone: str
    grade: int

    textbooks: list[TextbookSchema]
