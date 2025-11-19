"""问题生成相关的类型定义"""

from enum import Enum
from typing import Any, List, NotRequired, TypedDict

from core.database import Question
from sqlalchemy.ext.asyncio import AsyncSession


class GenerationType(str, Enum):
    """题目生成类型"""

    # 单元生成
    UNIT = "unit"
    # 教材生成
    TEXTBOOK = "textbook"
    # 每日练习
    DAILY_PRACTICE = "daily_practice"
    # 单元练习
    UNIT_PRACTICE = "unit_practice"
    # 能力评估
    ASSESSTENT = "assessment"


class QuestionGenerationState(TypedDict, total=False):
    """问题生成流程的状态"""

    # 数据库会话
    db: AsyncSession
    # 问题生成类型
    type: GenerationType
    # 需要生成的题目数量
    count: int
    # 单元 ID，单元生成和单元练习需要
    unit_id: NotRequired[int]
    # 教材 ID，教材生成和能力评估需要
    textbook_id: NotRequired[int]
    # 单元对象
    unit: NotRequired[Any]
    # 教材对象
    textbook: NotRequired[Any]
    # 知识点列表
    knowledges: NotRequired[List[str]]
    # 召回的题目列表
    recall_questions: NotRequired[List[Any]]
    # 生成的提示词
    prompt: NotRequired[Any]
    # LLM 生成的题目列表
    generated_questions: NotRequired[List[Any]]
    # 题目对象列表
    questions: NotRequired[List[Question]]

    image_questions: NotRequired[List[Question]]
    audio_questions: NotRequired[List[Question]]
    text_questions: NotRequired[List[Question]]
    saved_questions: NotRequired[List[Question]]
