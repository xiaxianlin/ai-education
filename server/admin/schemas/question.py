from typing import Optional
from pydantic import BaseModel
from common.schemas import SearchSchema


class QuestionCreateSchema(BaseModel):
    # 问题类型
    # 数学：单选、填空、解答、判断题、步骤题、图形题
    # 英语：选择、完型、阅读理解、写作、语法填空
    type: str
    # 问题内容
    content: str
    # 选项
    options: Optional[list[str]] = None
    # 答案
    answer: str
    # 年级（1 ～ 12）
    grade: int
    # 科目
    subject: str
    # 知识点 ID
    knowledge_id: Optional[int] = None
    # 课程单元 ID
    course_unit_id: Optional[int] = None
    # 教材 ID
    textbook_id: Optional[int] = None
    # 问题来源：AI生成 | 后台创建 ｜ 用户上传
    source: str


class QuestionUpdateSchema(BaseModel):
    type: Optional[str] = None
    content: Optional[str] = None
    options: Optional[list[str]] = None
    answer: Optional[str] = None
    grade: Optional[int] = None
    subject: Optional[str] = None
    knowledge_id: Optional[int] = None
    course_unit_id: Optional[int] = None
    textbook_id: Optional[int] = None
    source: Optional[str] = None
    status: Optional[int] = None


class QuestionSearchSchema(SearchSchema):
    type: Optional[str] = None
    grade: Optional[int] = None
    subject: Optional[str] = None
    knowledge_id: Optional[int] = None
    course_unit_id: Optional[int] = None
    source: Optional[str] = None
    status: Optional[int] = None
