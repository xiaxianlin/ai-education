from typing import Any, Dict, List, NotRequired, Optional, TypedDict

import pendulum
from shared.core.database import Practice, Question
from sqlalchemy.ext.asyncio import AsyncSession

# 练习类型常量
PRACTICE_TYPE_ABILITY = "ability_practice"
PRACTICE_TYPE_UNIT = "unit_practice"

VALID_PRACTICE_TYPES = [PRACTICE_TYPE_ABILITY, PRACTICE_TYPE_UNIT]


class GenerationStats(TypedDict):
    """题目生成统计"""

    expected: int  # 期望生成的题目数
    actual: int  # 实际生成的题目数
    success_rate: float  # 成功率
    failed_types: List[str]  # 失败的题型代码列表


class PracticeGenerationState(TypedDict, total=False):
    """练习生成流程的状态"""

    # 外部传入状态
    db: AsyncSession
    session_id: str
    generate_count: int

    # 内部构建状态
    session: NotRequired[Practice]
    practice_type: NotRequired[str]
    context: NotRequired[Dict[str, Any]]
    subject: NotRequired[str]
    grade: NotRequired[int]
    selections: NotRequired[List[Dict[str, Any]]]
    questions: NotRequired[List[Question]]
    generation_stats: NotRequired[GenerationStats]  # 生成统计
    error: NotRequired[str]
    start_time: NotRequired[pendulum.DateTime]
