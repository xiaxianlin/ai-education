from typing import Optional
from pydantic import BaseModel


class LoginSchema(BaseModel):
    phone: str
    password: str


class AnswerQuestionSchema(BaseModel):
    session_id: int
    question_id: int
    answer: str
    time_spent: int  # 答题耗时，单位秒
    is_audio_answer: bool = False  # 是否为音频回答
    audio_data: Optional[str] = None  # 音频数据（base64编码字符串）


class PracticeStatsSchem(BaseModel):
    session_id: int
    status: int  # 练习状态
    total_questions: int  # 题目总数
    completed_questions: int  # 题目完成数
    right_questions: int  # 题目正确数
    times: int = 0  # 练习次数
    generate_status: int = 0  # 生成状态：-1：生成失败；0：生成中；1：生成成功


class PracticeHistorySchema(BaseModel):
    """练习历史记录"""

    session_id: int
    session_type: str  # 练习类型
    status: int  # 练习状态 0-未开始 1-进行中 2-已完成
    target_id: Optional[int]  # 单元ID或日期
    textbook_id: Optional[int]  # 教材ID
    question_count: int  # 题目总数
    answer_count: int  # 已答题数
    correct_count: int  # 正确数
    start_time: int  # 开始时间
    end_time: Optional[int]  # 结束时间
    create_time: int  # 创建时间
