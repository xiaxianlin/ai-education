"""
修复版 Python Pydantic 模型
解决前向引用问题
"""

from typing import Optional, List, Dict, Union, TypeVar, Generic, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar('T')

class Config:
    extra = "ignore"
    from_attributes = True

# 枚举定义
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

class Grade(int, Enum):
    GRADE_1 = 1
    GRADE_2 = 2
    GRADE_3 = 3
    GRADE_4 = 4
    GRADE_5 = 5
    GRADE_6 = 6
    GRADE_7 = 7
    GRADE_8 = 8
    GRADE_9 = 9
    GRADE_10 = 10
    GRADE_11 = 11
    GRADE_12 = 12

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
    FAILED = "-1"
    GENERATING = "0"
    SUCCESS = "1"

class AnswerStatus(str, Enum):
    UNANSWERED = "0"
    CORRECT = "1"
    INCORRECT = "2"

# 基础模型
class BaseEntity(BaseModel):
    create_time: int
    update_time: Optional[int] = None

    class Config:
        extra = "ignore"
        from_attributes = True

# API 响应模型
class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: Optional[T] = None

    class Config:
        extra = "ignore"
        from_attributes = True

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    pageSize: int

# 用户相关
class Admin(BaseEntity):
    id: str
    username: str
    password: Optional[str] = None
    type: int
    status: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Admin

class Student(BaseEntity):
    id: str
    name: str
    phone: str
    grade: Grade
    status: int
    avatar: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None

class StudentLoginRequest(BaseModel):
    phone: str
    password: str

class StudentLoginResponse(BaseModel):
    token: str
    student: Student

class StudentStatistics(BaseModel):
    total_practices: int
    total_questions: int
    correct_rate: float
    average_time: float
    strength_knowledges: List[str]
    weak_knowledges: List[str]

# 教育内容
class Textbook(BaseEntity):
    id: int
    subject: Subject
    version: str
    grade: Grade
    semester: Semester
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: int = 0
    active: Optional[int] = 1

class Unit(BaseEntity):
    id: int
    textbook_id: int
    name: str
    content: str
    order: int
    # 使用前向引用
    textbook: Optional["Textbook"] = None

class Knowledge(BaseEntity):
    id: int
    textbook_id: int
    unit_id: int
    name: str
    content: str
    difficulty: Optional[Difficulty] = None
    importance: int = 5
    order: int = 0
    # 使用前向引用
    textbook: Optional["Textbook"] = None
    unit: Optional["Unit"] = None

class Question(BaseEntity):
    id: int
    type: str
    subtype: Optional[str] = None
    subject: Subject
    grade: Grade
    content: str
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge_ids: Optional[List[int]] = None

# 练习相关
class PracticeSession(BaseEntity):
    id: int
    student_id: str
    session_type: PracticeType
    target_id: Optional[int] = None
    textbook_id: Optional[int] = None
    question_count: int
    answer_count: int
    correct_count: int
    status: PracticeSessionStatus
    generate_status: PracticeGenerateStatus
    start_time: int
    end_time: Optional[int] = None
    # 使用前向引用
    student: Optional[Student] = None
    textbook: Optional[Textbook] = None
    unit: Optional[Unit] = None
    questions: Optional[List[Question]] = None

class CreatePracticeRequest(BaseModel):
    type: PracticeType
    textbook_id: int
    unit_id: Optional[int] = None
    target_date: Optional[str] = None
    question_count: Optional[int] = None
    difficulty: Optional[str] = None
    knowledge_ids: Optional[List[int]] = None

class PracticeAnswer(BaseEntity):
    id: int
    session_id: int
    question_id: int
    question_order: int
    text_answer: Optional[str] = None
    status: int
    time_spent: int
    submit_time: Optional[int] = None
    audio_answer: Optional[str] = None
    # 使用前向引用
    question: Optional[Question] = None

class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int
    is_audio_answer: bool = False
    audio_data: Optional[str] = None
    audio_match: Optional[bool] = None
    audio_reason: Optional[str] = None
    audio_suggestion: Optional[str] = None

class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    user_answer: Optional[str] = None
    analysis: Optional[str] = None
    session_progress: Dict[str, Any]

class WrongRecord(BaseEntity):
    id: int
    student_id: str
    question_id: int
    session_id: int
    unit_id: Optional[int] = None
    knowledge_ids: Optional[List[int]] = None
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    analysis: Optional[str] = None
    time_spent: Optional[int] = None
    is_corrected: bool = False
    corrected_time: Optional[int] = None

# 导出所有类型
__all__ = [
    # 枚举
    'Status', 'Gender', 'Subject', 'Grade', 'Semester',
    'QuestionType', 'Difficulty', 'ResourceType',
    'PracticeType', 'PracticeSessionStatus', 'PracticeGenerateStatus', 'AnswerStatus',

    # 基础
    'BaseEntity', 'ApiResponse', 'PaginatedResponse',

    # 用户
    'Admin', 'LoginRequest', 'LoginResponse',
    'Student', 'StudentLoginRequest', 'StudentLoginResponse', 'StudentStatistics',

    # 教育
    'Textbook', 'Unit', 'Knowledge', 'Question',

    # 练习
    'PracticeSession', 'CreatePracticeRequest', 'PracticeAnswer',
    'SubmitAnswerRequest', 'SubmitAnswerResponse', 'WrongRecord',
]