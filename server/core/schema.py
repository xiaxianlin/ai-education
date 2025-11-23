from fastapi import Query
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Generic, TypeVar


T = TypeVar("T")


class ResponseSchema(BaseModel, Generic[T]):
    status: int = 0
    message: str = "success"
    data: Optional[T] = None

    model_config = ConfigDict(extra="ignore", exclude_none=True)


class NameSchema(BaseModel):
    name: str


class StatusSchema(BaseModel):
    status: int


class SearchSchema(BaseModel):
    page: Optional[int] = 1
    size: Optional[int] = 10
    sort: Optional[str] = Query("id", description="排序字段")
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="排序方式")
    keywords: Optional[str] = None


class SearchResultSchema(BaseModel, Generic[T]):
    total: int = 0
    data: list[T] = []


class ManagerSchema(BaseModel):
    id: str
    username: str
    type: int
    status: int
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class TextbookSchema(BaseModel):
    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: int = 0

    course_units: Optional[List["UnitSchema"]] = None

    model_config = {"from_attributes": True}


class UnitSchema(BaseModel):
    id: int
    textbook_id: int
    name: str
    content: str
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class KnowledgeSchema(BaseModel):
    id: int
    textbook_id: int
    unit_id: int
    name: str
    content: str
    difficulty: Optional[str] = None
    importance: Optional[int] = 5
    order: Optional[int] = 0

    textbook: Optional["TextbookSchema"] = None
    unit: Optional["UnitSchema"] = None

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    id: int
    type: str
    subtype: Optional[str] = None
    subject: str
    grade: int
    content: str
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None

    unit: Optional["UnitSchema"] = None
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


#### ================================= 分割线 ================================= ####


class StudentSchema(BaseModel):
    id: str
    name: str = ""
    phone: str
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentTextbookSchema(BaseModel):
    id: int
    student_id: str
    textbook_id: int
    active: int = 0

    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class StudentWrongRecordSchema(BaseModel):
    id: int
    student_id: str
    question_id: int
    session_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None
    textbook_id: Optional[int] = None
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    time_spent: int = 0
    is_corrected: int = 0
    corrected_time: int = 0
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class PracticeSessionSchema(BaseModel):
    id: int
    student_id: str
    session_type: str
    target_id: Optional[int] = None
    textbook_id: Optional[int] = None
    question_count: int = 0
    correct_count: int = 0
    status: str = "in_progress"
    start_time: int
    end_time: Optional[int] = None
    create_time: int

    model_config = {"from_attributes": True}


class PracticeAnswerSchema(BaseModel):
    id: int
    session_id: int
    question_id: int
    question_order: int
    user_answer: Optional[str] = None
    is_correct: int = 0
    time_spent: int = 0
    submit_time: Optional[int] = None
    create_time: int

    model_config = {"from_attributes": True}


class PracticeReportSchema(BaseModel):
    id: int
    session_id: int
    student_id: str
    total_questions: int = 0
    correct_questions: int = 0
    total_time: int = 0
    overall_score: float = 0.0
    current_ability: float = 0.0
    confidence: float = 0.0
    ability_level: str = ""
    percentile: int = 0
    knowledge_scores: str = "{}"
    question_distribution: str = "{}"
    ability_breakdown: str = "{}"
    learning_speed: float = 0.0
    consistency: float = 0.0
    strengths: str = "[]"
    weaknesses: str = "[]"
    recommendations: str = "[]"
    create_time: int

    model_config = {"from_attributes": True}
