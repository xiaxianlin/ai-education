from typing import Optional
from pydantic import BaseModel, field_validator
from utils import validation
from common.constants import QUESTION_TYPES, SEMESTERS, SUBJECTS, TEXTBOOK_VERSIONS
from common.schema import SearchSchema


class LoginSchema(BaseModel):

    username: str
    password: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return validation.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class ModifyPasswordSchema(BaseModel):
    origin: str
    password: str

    @field_validator("origin")
    @classmethod
    def validate_origin(cls, v):
        return validation.password(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class CreateManangeSchema(BaseModel):
    username: str
    type: int

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v < 1:
            raise ValueError("管理员类型异常")
        return v


class UpdateManangeSchema(BaseModel):
    type: Optional[int] = None
    status: Optional[int] = None


class SaveTextbookSchema(BaseModel):
    subject: str
    version: str
    grade: int
    semester: str

    @field_validator("subject")
    @classmethod
    def valid_subject(clas, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{"、".join(SUBJECTS)}")
        return v

    @field_validator("version")
    @classmethod
    def valid_version(clas, v):
        if v and v not in TEXTBOOK_VERSIONS:
            raise ValueError(f"版本只能选泽{"、".join(TEXTBOOK_VERSIONS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(clas, v):
        if v and v not in range(1, 13):
            raise ValueError(f"非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(clas, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{"、".join(SEMESTERS)}")
        return v


class SearchTextbookSchema(SearchSchema):
    version: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None


class CreateUnitSchema(BaseModel):
    textbook_id: int
    name: str
    content: str


class UpdateUnitSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    status: Optional[int] = None


class CreateKnowledgeSchema(BaseModel):
    textbook_id: int
    unit_id: int
    name: str
    content: str


class UpdateKnowledgeSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    status: Optional[int] = None


class UpdateQuestionSchema(BaseModel):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    subtype: Optional[str] = None
    content: Optional[str] = None
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    knowledge: Optional[str] = None
    unit_id: Optional[int] = None
    textbook_id: Optional[int] = None
    status: Optional[int] = None


class SearchQuestionSchema(SearchSchema):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    resource_type: Optional[str] = None
    resource_generated: Optional[bool] = None


class CreateStudentSchema(BaseModel):
    name: str
    phone: str


class SaveStudentSubjectSchema(BaseModel):
    ids: list[int]


class UpdateStudentSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[int] = None


class SearchStudentSchema(SearchSchema):
    phone: Optional[str] = None
    status: Optional[int] = None


class StudentProfileSchema(BaseModel):
    id: int
    student_id: str
    current_textbook_id: Optional[int] = None
    preferred_subjects: str = ""
    difficulty_preference: str = "普通"
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentStatsSchema(BaseModel):
    id: int
    student_id: str
    total_practice: int = 0
    total_questions: int = 0
    correct_questions: int = 0
    accuracy: float = 0.0
    current_streak: int = 0
    max_streak: int = 0
    last_study_date: int = 0
    total_study_duration: int = 0
    achievements: str = ""
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudyRecordSchema(BaseModel):
    id: int
    student_id: str
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None
    question_id: Optional[int] = None
    is_correct: int = 0
    score: float = 0.0
    time_spent: int = 0
    study_date: int
    create_time: int

    model_config = {"from_attributes": True}


class CreateStudentProfileSchema(BaseModel):
    current_textbook_id: Optional[int] = None
    preferred_subjects: str = ""
    difficulty_preference: str = "普通"


class UpdateStudentProfileSchema(BaseModel):
    current_textbook_id: Optional[int] = None
    preferred_subjects: Optional[str] = None
    difficulty_preference: Optional[str] = None


class UpdateStudentStatsSchema(BaseModel):
    total_practice: Optional[int] = None
    total_questions: Optional[int] = None
    correct_questions: Optional[int] = None
    current_streak: Optional[int] = None
    max_streak: Optional[int] = None
    last_study_date: Optional[int] = None
    total_study_duration: Optional[int] = None
    achievements: Optional[str] = None


class CreateStudyRecordSchema(BaseModel):
    student_id: str
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None
    question_id: Optional[int] = None
    is_correct: int = 0
    score: float = 0.0
    time_spent: int = 0
    study_date: Optional[int] = None


# ===== 单元练习相关 Schema =====
class UnitPracticeSessionSchema(BaseModel):
    id: int
    student_id: str
    unit_id: int
    practice_date: int
    total_questions: int = 0
    correct_questions: int = 0
    total_time: int = 0
    score: float = 0.0
    knowledge_scores: str = "{}"
    difficulty: str = "adaptive"
    question_ids: str = "[]"
    answers: str = "{}"
    status: str = "in_progress"
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class CreateUnitPracticeSchema(BaseModel):
    unit_id: int
    difficulty: str = "adaptive"
    count: int = 10


class SubmitUnitPracticeAnswerSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int = 0


class CompleteUnitPracticeSchema(BaseModel):
    session_id: int


# ===== 今日练习相关 Schema =====
class DailyPracticeSessionSchema(BaseModel):
    id: int
    student_id: str
    date: int
    total_questions: int = 0
    correct_questions: int = 0
    total_time: int = 0
    score: float = 0.0
    practice_type: str = "daily"
    knowledge_coverage: str = "{}"
    question_distribution: str = "{}"
    question_ids: str = "[]"
    answers: str = "{}"
    status: str = "in_progress"
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class CreateDailyPracticeSchema(BaseModel):
    count: int = 10
    practice_type: str = "daily"


class SubmitDailyPracticeAnswerSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int = 0


class CompleteDailyPracticeSchema(BaseModel):
    session_id: int


# ===== 能力评测相关 Schema =====
class AssessmentTestSchema(BaseModel):
    id: int
    student_id: str
    assessment_type: str
    target_id: Optional[int] = None
    status: str
    start_time: int
    end_time: Optional[int] = None
    total_time: int
    adaptive: int
    max_questions: int
    min_questions: int
    difficulty_range: str
    current_ability: float
    confidence: float
    overall_score: float
    ability_level: str
    answered_count: int
    create_time: int
    update_time: int

    model_config = {"from_attributes": True}


class CreateAssessmentSchema(BaseModel):
    assessment_type: str = "comprehensive"  # unit/comprehensive/topic
    target_id: Optional[int] = None
    max_questions: int = 20
    min_questions: int = 10


class SubmitAssessmentAnswerSchema(BaseModel):
    assessment_id: int
    question_id: int
    answer: str
    time_spent: int = 0


class CompleteAssessmentSchema(BaseModel):
    assessment_id: int


class AssessmentReportSchema(BaseModel):
    id: int
    assessment_id: int
    student_id: str
    overall_score: float
    ability_level: str
    percentile: int
    knowledge_mastery: str
    ability_breakdown: str
    learning_speed: float
    consistency: float
    strengths: str
    weaknesses: str
    recommendations: str
    create_time: int

    model_config = {"from_attributes": True}
