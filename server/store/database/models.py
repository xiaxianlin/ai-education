from sqlalchemy import String, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column, DeclarativeBase
from util import time


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    __abstract__ = True

    def to_dict(self, exclude: set[str] = set()) -> dict:
        return {k: getattr(self, k) for k in self.__table__.columns.keys() if k not in exclude}


class Manager(BaseModel):
    __tablename__ = "ah_manager"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[int] = mapped_column(default=0)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()


class UserSubject(BaseModel):
    __tablename__ = "ah_user_subject"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    textbook_version: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()


class Subject(BaseModel):
    __tablename__ = "ah_subject"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)


class TextbookVersion(BaseModel):
    __tablename__ = "ah_textbook_version"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)


class Textbook(BaseModel):
    __tablename__ = "ah_textbook"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(255), nullable=False)
    stage: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(nullable=False)
    semester: Mapped[int] = mapped_column(nullable=False)
    pdf: Mapped[str] = mapped_column(String(255))
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)


class CourseUnit(BaseModel):
    __tablename__ = "ah_course_unit"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(CourseUnit.textbook_id) == Textbook.id",
        lazy="joined",
    )


class Knowledge(BaseModel):
    __tablename__ = "ah_knowledge"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    textbook_id: Mapped[int] = mapped_column(nullable=False)
    course_unit_id: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    analysis_text: Mapped[str] = mapped_column(Text)
    analysis_audio: Mapped[str] = mapped_column(String(255))
    analysis_video: Mapped[str] = mapped_column(String(255))
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()

    course_unit: Mapped["CourseUnit"] = relationship(
        "CourseUnit",
        primaryjoin="foreign(Knowledge.course_unit_id) == CourseUnit.id",
        lazy="joined",
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Knowledge.textbook_id) == Textbook.id",
        lazy="joined",
    )


class Question(BaseModel):
    __tablename__ = "ah_question"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    analysis_text: Mapped[str] = mapped_column(Text)
    analysis_audio: Mapped[str] = mapped_column(String(255))
    analysis_video: Mapped[str] = mapped_column(String(255))
    grade: Mapped[int] = mapped_column()
    subject: Mapped[str] = mapped_column(String(255))
    knowledge_id: Mapped[int] = mapped_column()
    course_unit_id: Mapped[int] = mapped_column()
    textbook_id: Mapped[int] = mapped_column()
    source: Mapped[str] = mapped_column(String(255))
    image: Mapped[str] = mapped_column(String(255))
    status: Mapped[int] = mapped_column(default=1)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()

    knowledge: Mapped["Knowledge"] = relationship(
        "Knowledge",
        primaryjoin="foreign(Question.knowledge_id) == Knowledge.id",
        lazy="joined",
    )

    course_unit: Mapped["CourseUnit"] = relationship(
        "CourseUnit",
        primaryjoin="foreign(Question.course_unit_id) == CourseUnit.id",
        lazy="joined",  # 推荐 eager load，性能好
    )

    textbook: Mapped["Textbook"] = relationship(
        "Textbook",
        primaryjoin="foreign(Question.textbook_id) == Textbook.id",
        lazy="joined",
    )


#### ================================= 分割线 ================================= ####


class User(BaseModel):
    __tablename__ = "ah_user"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), default="")
    password: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(255), nullable=False)
    openid: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()


class UserProfile(BaseModel):
    __tablename__ = "ah_user_profile"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    provice: Mapped[str] = mapped_column(String(255), nullable=False)
    stage: Mapped[str] = mapped_column(String(255), nullable=False)
    enrollment: Mapped[str] = mapped_column(String(255), nullable=False)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()


class Solution(BaseModel):
    __tablename__ = "ah_solution"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    question_id: Mapped[str] = mapped_column(String(255), nullable=False)
    last_hisotry_id: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=time.now)
    update_time: Mapped[int] = mapped_column()


class SolutionHistory(BaseModel):
    __tablename__ = "ah_solution_history"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    question_id: Mapped[str] = mapped_column(String(255), nullable=False)
    solution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    thinking: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    ai_score: Mapped[int] = mapped_column()
    ai_summary_text: Mapped[str] = mapped_column(Text)
    ai_summary_audio: Mapped[str] = mapped_column(String(255))
    ai_summary_video: Mapped[str] = mapped_column(String(255))
    create_time: Mapped[int] = mapped_column(default=time.now)


class SolutionMessage(BaseModel):
    __tablename__ = "ah_solution_message"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    last_message_id: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    question_id: Mapped[str] = mapped_column(String(255), nullable=False)
    solution_id: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(255))
    model: Mapped[str] = mapped_column(String(255))
    thinking: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    input_tokens: Mapped[int] = mapped_column()
    output_tokens: Mapped[int] = mapped_column()
    ai_summary_video: Mapped[str] = mapped_column(String(255))
    create_time: Mapped[int] = mapped_column(default=time.now)
