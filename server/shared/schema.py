from typing import Optional
from pydantic import BaseModel


class CreateQuestionSchema(BaseModel):
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
    unit_id: Optional[int] = None
    # 教材 ID
    textbook_id: Optional[int] = None
    # 问题来源：AI生成 | 后台创建 ｜ 用户上传
    source: str
