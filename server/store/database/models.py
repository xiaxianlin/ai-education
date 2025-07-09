from sqlalchemy import JSON, Column, String, Integer, Text
from util import time
from . import Base


class BaseModel(Base):
    __abstract__ = True

    def to_dict(self, exclude: set[str] = set()) -> dict:
        return {k: getattr(self, k) for k in self.__table__.columns.keys() if k not in exclude}


class Manager(BaseModel):
    """管理员模型"""

    __tablename__ = "ah_manager"

    id = Column(String(255), primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    type = Column(Integer, nullable=False, default=0)
    status = Column(Integer, nullable=True, default=0)
    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class User(BaseModel):
    """用户模型"""

    __tablename__ = "ah_user"

    id = Column(String(255), primary_key=True, index=True)
    username = Column(String(255), default="")
    password = Column(String(255), default="")
    phone = Column(String(255), nullable=False)
    openid = Column(String(255), default="")
    status = Column(Integer, default=0)
    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class UserProfile(BaseModel):
    """用户信息模型"""

    __tablename__ = "ah_user_profile"

    id = Column(String(255), primary_key=True, index=True)
    # 用户 ID
    user_id = Column(String(255), nullable=False)
    # 省份
    provice = Column(String(255), nullable=False)
    # 阶段：小、初、高
    stage = Column(String(255), nullable=False)
    # 入学时间
    enrollment = Column(String(255), nullable=False)

    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class UserSubject(BaseModel):
    """用户科目模型"""

    __tablename__ = "ah_user_subject"

    id = Column(String(255), primary_key=True, index=True)
    # 用户 ID
    user_id = Column(String(255), nullable=False)
    # 教材版本
    textbook_version = Column(String(255), nullable=False)
    # 科目
    subject = Column(String(255), nullable=False)

    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class Subject(BaseModel):
    """科目模型"""

    __tablename__ = "ah_subject"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)


class TextbookVersion(BaseModel):
    """教材版本模型"""

    __tablename__ = "ah_textbook_version"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)


class Textbook(BaseModel):
    """教材模型"""

    __tablename__ = "ah_textbook"

    id = Column(Integer, primary_key=True, autoincrement=True)
    # 科目
    subject = Column(String(255), nullable=False)
    # 教材版本
    version = Column(String(255), nullable=False)
    # 阶段：小、初、高
    stage = Column(String(255), nullable=False)
    # 年级
    grade = Column(Integer, nullable=False)
    # 单元 0-全年级，1-上册，2-下册
    semester = Column(Integer, nullable=False)
    # 文件地址
    pdf = Column(String(255))


class CourseUnit(BaseModel):
    """课程单元模型"""

    __tablename__ = "ah_course_unit"

    id = Column(Integer, primary_key=True, autoincrement=True)
    textbook_id = Column(Integer, nullable=False)
    # 单元名称
    name = Column(String(255), nullable=False)
    # 单元总结
    summary = Column(Text, default="")


class Knowledge(BaseModel):
    """知识点模型"""

    __tablename__ = "ah_knowledge"

    id = Column(String(255), primary_key=True, index=True)
    # 单元 ID
    course_unit_id = Column(Integer, nullable=False)
    # 知识点内容
    content = Column(Text, nullable=False, index=True)
    # 分析文本
    analysis_text = Column(Text)
    # 分析音频
    analysis_audio = Column(String(255))
    # 分析视频
    analysis_video = Column(String(255))
    # 状态
    status = Column(Integer, default=0)

    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class Question(BaseModel):
    """问题模型"""

    __tablename__ = "ah_question"

    id = Column(String(255), primary_key=True, index=True)
    # 问题类型
    type = Column(String(255))
    # 问题内容
    content = Column(Text, nullable=False)
    # 问题选项
    options = Column(JSON)
    # 知识点 ID
    knowledge_id = Column(String(255))
    # 分析文本
    analysis_text = Column(Text)
    # 分析音频
    analysis_audio = Column(String(255))
    # 分析视频
    analysis_video = Column(String(255))
    # 答案
    answer = Column(Text)
    # 年级
    grade = Column(String(255))
    # 科目
    subject = Column(String(255))
    # 来源
    source = Column(String(255))
    # 图片
    image = Column(String(255))
    # 状态
    status = Column(Integer(), default=0)

    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class Solution(BaseModel):
    """答题模型"""

    __tablename__ = "ah_solution"

    id = Column(String(255), primary_key=True, index=True)
    # 用户 ID
    user_id = Column(String(255), nullable=False)
    # 问题 ID
    question_id = Column(String(255), nullable=False)
    # 最近一次答题记录 ID
    last_hisotry_id = Column(String(255), nullable=False, default="")
    # 状态
    status = Column(Integer(), default=0)

    create_time = Column(Integer, default=time.now)
    update_time = Column(Integer)


class SolutionHistory(BaseModel):
    """答题记录模型"""

    __tablename__ = "ah_solution_history"

    id = Column(String(255), primary_key=True, index=True)
    # 用户 ID
    user_id = Column(String(255), nullable=False)
    # 问题 ID
    question_id = Column(String(255), nullable=False)
    # 答题 ID
    solution_id = Column(String(255), nullable=False)
    # 用户思考
    thinking = Column(Text)
    # 用户答案
    answer = Column(Text)
    # AI 打分
    ai_score = Column(Integer)
    # AI 分析文本
    ai_summary_text = Column(Text)
    # AI 分析音频
    ai_summary_audio = Column(String(255))
    # 分析视频
    ai_summary_video = Column(String(255))

    create_time = Column(Integer, default=time.now)


class SolutionMessage(BaseModel):
    """答题消息模型"""

    __tablename__ = "ah_solution_message"

    id = Column(String(255), primary_key=True, index=True)
    # 上次消息 ID
    last_message_id = Column(String(255), nullable=False, default="")
    # 用户 ID
    user_id = Column(String(255), nullable=False)
    # 问题 ID
    question_id = Column(String(255), nullable=False)
    # 答题 ID
    solution_id = Column(String(255), nullable=False)
    # 消息类型
    type = Column(String(255))
    # 消息角色
    role = Column(String(255))
    # AI 模型
    model = Column(String(255))
    # AI 思考
    thinking = Column(Text)
    # 消息内容
    content = Column(Text)
    # 输入 token 量
    input_tokens = Column(Integer)
    # 输出 token 量
    output_tokens = Column(Integer)
    # 分析视频
    ai_summary_video = Column(String(255))

    create_time = Column(Integer, default=time.now)
