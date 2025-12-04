"""
Auto-generated Python Pydantic models from TypeScript types.
Generated on: 2025-12-04T11:07:33.855Z
DO NOT EDIT MANUALLY - Use npm run build:python to regenerate
"""

from typing import Optional, List, Dict, Union, TypeVar, Generic
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar('T')

class Config:
    extra = "ignore"
    from_attributes = True

class Status(str, Enum):
    DISABLED = "0"
    ENABLED = "1"


class Gender(str, Enum):
    MALE = "1"
    FEMALE = "2"


class Subject(str, Enum):
    MATH = "数学"
    ENGLISH = "英语"
    CHINESE = "语文"
    PHYSICS = "物理"
    CHEMISTRY = "化学"
    BIOLOGY = "生物"
    HISTORY = "历史"
    GEOGRAPHY = "地理"
    POLITICS = "政治"


class Grade(str, Enum):
    GRADE_1 = "1"
    GRADE_2 = "2"
    GRADE_3 = "3"
    GRADE_4 = "4"
    GRADE_5 = "5"
    GRADE_6 = "6"
    GRADE_7 = "7"
    GRADE_8 = "8"
    GRADE_9 = "9"
    GRADE_10 = "10"
    GRADE_11 = "11"
    GRADE_12 = "12"


class Semester(str, Enum):
    FIRST = "上学期"
    SECOND = "下学期"
    FULL = "整学期"


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "选择题"
    TRUE_FALSE = "判断题"
    FILL_BLANK = "填空题"
    SHORT_ANSWER = "简答题"
    ESSAY = "论述题"
    CALCULATION = "计算题"
    READING = "阅读理解"
    LISTENING = "听力题"
    SPEAKING = "口语题"


class Difficulty(str, Enum):
    EASY = "简单"
    MEDIUM = "普通"
    HARD = "困难"


class ResourceType(str, Enum):
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"


class PracticeType(str, Enum):
    DAILY = "daily_practice"
    UNIT = "unit_practice"
    ASSESSMENT = "assessment"


class PracticeSessionStatus(str, Enum):
    NOT_STARTED = "0"
    IN_PROGRESS = "1"
    COMPLETED = "2"


class PracticeGenerateStatus(str, Enum):
    FAILED = "Unknown"
    GENERATING = "0"
    SUCCESS = "1"


class AnswerStatus(str, Enum):
    UNANSWERED = "0"
    CORRECT = "1"
    INCORRECT = "2"


class ApiResponse(BaseModel):
    code: int
    message: str
    data: Optional["T"] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: List[T]
    total: int
    page: int
    pageSize: int
    class Config:
        extra = "ignore"
        from_attributes = True


class SearchParams(BaseModel):
    page: Optional[int] = None
    pageSize: Optional[int] = None
    keywords: Optional[str] = None
    sort: Optional[str] = None
    order: Optional[Union[str]] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class SearchResult(BaseModel):
    total: int
    data: List[T]
    class Config:
        extra = "ignore"
        from_attributes = True


class BaseEntity(BaseModel):
    create_time: int
    update_time: Optional[int] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class Textbook(BaseEntity):
    id: int
    subject: "Subject"
    version: str
    grade: "Grade"
    semester: "Semester"
    title: Optional[str] = None
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: bool
    cover_image: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    publish_year: Optional[int] = None
    active: Optional[bool] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class Knowledge(BaseEntity):
    id: int
    textbook_id: int
    unit_id: int
    name: str
    content: str
    difficulty: Optional["Difficulty"] = None
    importance: int
    order: int
    parent_id: Optional[int] = None
    level: int
    tags: Optional[List[str]] = None
    textbook: Optional["Textbook"] = None
    unit: Optional["Unit"] = None
    children: Optional[List[Knowledge]] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class Unit(BaseEntity):
    id: int
    textbook_id: int
    name: str
    content: str
    order: int
    textbook: Optional["Textbook"] = None
    knowledges: Optional[List[Knowledge]] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class Question(BaseEntity):
    id: int
    type: "QuestionType"
    subtype: Optional[str] = None
    subject: "Subject"
    grade: "Grade"
    content: str
    options: Optional[List[str]] = None
    answer: Optional[Union[str, List[str]]] = None
    explanation: Optional[str] = None
    resource: Optional[str] = None
    resource_type: Optional["ResourceType"] = None
    resource_content: Optional[str] = None
    difficulty: Optional["Difficulty"] = None
    points: Optional[int] = None
    estimated_time: Optional[int] = None
    tags: Optional[List[str]] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge_ids: Optional[List[int]] = None
    knowledge_names: Optional[List[str]] = None
    is_correct: Optional[bool] = None
    order: Optional[int] = None
    user_answer: Optional[str] = None
    time_spent: Optional[int] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class QuestionOption(BaseModel):
    id: str
    label: str
    content: str
    is_correct: bool
    class Config:
        extra = "ignore"
        from_attributes = True


class QuestionGroup(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    material: Optional[str] = None
    questions: List[Question]
    total_points: int
    class Config:
        extra = "ignore"
        from_attributes = True


class Student(BaseEntity):
    id: str
    name: str
    phone: str
    grade: "Grade"
    status: "Status"
    avatar: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class PracticeAnswer(BaseEntity):
    id: int
    session_id: int
    question_id: int
    question_order: int
    text_answer: Optional[str] = None
    status: "AnswerStatus"
    time_spent: int
    submit_time: Optional[int] = None
    audio_answer: Optional[str] = None
    question: Optional["Question"] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class PracticeReport(BaseEntity):
    id: int
    session_id: int
    student_id: str
    total_questions: int
    correct_questions: int
    total_time: int
    overall_score: int
    accuracy_rate: int
    current_ability: Optional[int] = None
    ability_level: Optional[str] = None
    percentile: Optional[int] = None
    confidence: Optional[int] = None
    knowledge_scores: Optional[Dict[str, int]] = None
    question_distribution: Optional[Dict[str, int]] = None
    ability_breakdown: Optional[Dict[str, Any]] = None
    learning_speed: Optional[int] = None
    consistency: Optional[int] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    session: Optional["PracticeSession"] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class PracticeSession(BaseEntity):
    id: int
    student_id: str
    session_type: "PracticeType"
    target_id: Optional[int] = None
    textbook_id: Optional[int] = None
    question_count: int
    answer_count: int
    correct_count: int
    status: "PracticeSessionStatus"
    generate_status: "PracticeGenerateStatus"
    start_time: int
    end_time: Optional[int] = None
    student: Optional["Student"] = None
    textbook: Optional["Textbook"] = None
    unit: Optional["Unit"] = None
    questions: Optional[List[Question]] = None
    answers: Optional[List[PracticeAnswer]] = None
    report: Optional["PracticeReport"] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class CreatePracticeRequest(BaseModel):
    type: "PracticeType"
    textbook_id: int
    unit_id: Optional[int] = None
    target_date: Optional[str] = None
    question_count: Optional[int] = None
    difficulty: Optional[str] = None
    knowledge_ids: Optional[List[int]] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int
    is_audio_answer: Optional[bool] = None
    audio_data: Optional[str] = None
    audio_match: Optional[bool] = None
    audio_reason: Optional[str] = None
    audio_suggestion: Optional[str] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    user_answer: Optional[str] = None
    analysis: Optional[str] = None
    explanation: Optional[str] = None
    session_progress: Any
    class Config:
        extra = "ignore"
        from_attributes = True


class WrongRecord(BaseEntity):
    id: int
    student_id: str
    question_id: int
    session_id: int
    unit_id: Optional[int] = None
    knowledge_ids: Optional[List[int]] = None
    knowledge_names: Optional[List[str]] = None
    textbook_id: Optional[int] = None
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    analysis: Optional[str] = None
    time_spent: Optional[int] = None
    is_corrected: bool
    corrected_time: Optional[int] = None
    review_count: int
    mastery_level: int
    question: Optional["Question"] = None
    session: Optional["PracticeSession"] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class AbilityAssessment(BaseModel):
    overall_score: int
    ability_level: str
    percentile: int
    confidence: int
    subject_scores: Dict[str, int]
    knowledge_mastery: Dict[str, Any]
    learning_trends: Any
    next_step_recommendations: List[str]
    class Config:
        extra = "ignore"
        from_attributes = True


class LearningStatistics(BaseModel):
    student_id: str
    period: str
    total_practices: int
    total_questions: int
    total_time: int
    average_accuracy: int
    average_time_per_question: int
    practice_type_stats: Dict[PracticeType, Any]
    knowledge_mastery: Dict[str, Any]
    daily_progress: List[Any]
    weak_areas: List[Any]
    class Config:
        extra = "ignore"
        from_attributes = True


class StudentStatistics(BaseModel):
    total_practices: int
    total_questions: int
    correct_rate: int
    average_time: int
    strength_knowledges: List[str]
    weak_knowledges: List[str]
    class Config:
        extra = "ignore"
        from_attributes = True


class Admin(BaseEntity):
    id: str
    username: str
    password: Optional[str] = None
    type: int
    status: "Status"
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str
    class Config:
        extra = "ignore"
        from_attributes = True


class LoginResponse(BaseModel):
    token: str
    user: "Admin"
    class Config:
        extra = "ignore"
        from_attributes = True


class StudentLoginRequest(BaseModel):
    phone: str
    password: str
    class Config:
        extra = "ignore"
        from_attributes = True


class StudentLoginResponse(BaseModel):
    token: str
    student: "Student"
    class Config:
        extra = "ignore"
        from_attributes = True


class StudentProfile(BaseModel):
    student: "Student"
    textbooks: List[Textbook]
    recent_practices: List[PracticeSession]
    statistics: "StudentStatistics"
    class Config:
        extra = "ignore"
        from_attributes = True


class MediaFile(BaseEntity):
    id: str
    filename: str
    original_name: str
    file_type: "ResourceType"
    mime_type: str
    file_size: int
    file_path: str
    oss_path: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    uploaded_by: str
    is_public: bool
    class Config:
        extra = "ignore"
        from_attributes = True


class AudioTranscription(BaseModel):
    id: str
    original_path: str
    transcription: str
    confidence: int
    language: str
    duration: int
    processed_at: int
    class Config:
        extra = "ignore"
        from_attributes = True


class AudioMatchAnalysis(BaseModel):
    match: bool
    score: int
    reason: str
    suggestion: Optional[str] = None
    keywords_matched: List[str]
    keywords_missing: List[str]
    fluency_score: Optional[int] = None
    pronunciation_score: Optional[int] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class AudioUploadResult(BaseModel):
    success: bool
    file_id: Optional[str] = None
    oss_path: Optional[str] = None
    url: Optional[str] = None
    file_size: Optional[int] = None
    duration: Optional[int] = None
    error: Optional[str] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class ImageGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    quality: Optional[str] = None
    question_id: Optional[int] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    class Config:
        extra = "ignore"
        from_attributes = True


class ImageGenerationResult(BaseModel):
    success: bool
    image_id: Optional[str] = None
    image_url: Optional[str] = None
    oss_path: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: Optional[int] = None
    generation_time: Optional[int] = None
    error: Optional[str] = None
    class Config:
        extra = "ignore"
        from_attributes = True


