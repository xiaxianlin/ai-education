"""掌握度计算与更新服务

实现学生能力掌握度的计算、更新和查询逻辑。

核心功能:
- 平滑修正掌握度计算 (Laplace smoothing)
- 事件驱动的掌握度更新
- 薄弱能力推荐
"""

from typing import Optional

from loguru import logger
from shared.core.database import (
    AbilityAtomic,
    Question,
    StudentAbilityMastery,
)
from shared.core.schema import StudentAbilityMasterySchema
from shared.utils.time import now
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


# 掌握度等级阈值映射
MASTERY_LEVEL_THRESHOLDS: list[tuple[int, int, str]] = [
    (0, 40, "unlearned"),  # 未掌握
    (40, 60, "beginner"),  # 初步掌握
    (60, 80, "proficient"),  # 基本掌握
    (80, 101, "mastered"),  # 熟练掌握
]

# 平滑修正系数 (Laplace smoothing)
DEFAULT_ALPHA = 2.0


def calculate_mastery_score(
    correct_count: int,
    wrong_count: int,
    alpha: float = DEFAULT_ALPHA,
) -> float:
    """计算掌握度分数（平滑修正）

    使用 Laplace 平滑公式:
    mastery_score = (correct + α) / (correct + wrong + 2α) * 100

    Args:
        correct_count: 正确次数
        wrong_count: 错误次数
        alpha: 平滑系数，默认 2.0

    Returns:
        掌握度分数 (0-100)
    """
    total = correct_count + wrong_count
    if total == 0:
        return 0.0

    score = (correct_count + alpha) / (total + 2 * alpha) * 100
    return round(score, 2)


def get_mastery_level(score: float) -> str:
    """根据掌握度分数获取等级

    等级划分:
    - unlearned: 0-39
    - beginner: 40-59
    - proficient: 60-79
    - mastered: 80-100

    Args:
        score: 掌握度分数

    Returns:
        掌握等级字符串
    """
    for low, high, level in MASTERY_LEVEL_THRESHOLDS:
        if low <= score < high:
            return level
    return "unlearned"


def extract_ability_codes(question: Question) -> list[str]:
    """从题目中提取关联的原子能力代码

    优先从 question.ability_tags 提取，
    其次从 question_type.ability_atomic_codes 提取。

    Args:
        question: 题目对象

    Returns:
        能力代码列表（去重）
    """
    codes: list[str] = []

    # 从 question.ability_tags 提取
    if question.ability_tags:
        codes.extend(question.ability_tags)

    # 从 question_type.ability_atomic_codes 提取
    if question.question_type and question.question_type.ability_atomic_codes:
        codes.extend(question.question_type.ability_atomic_codes)

    # 去重并返回
    return list(set(codes))


async def update_student_mastery(
    db: AsyncSession,
    student_id: str,
    ability_code: str,
    is_correct: bool,
) -> Optional[StudentAbilityMastery]:
    """更新学生能力掌握度（事件驱动）

    每次答题后调用，更新对应能力的掌握度：
    1. 查询或创建记录
    2. 更新 correct_count / wrong_count
    3. 重新计算 mastery_score
    4. 更新 mastery_level 和 last_practice_time

    Args:
        db: 数据库会话
        student_id: 学生 ID
        ability_code: 原子能力代码
        is_correct: 是否答对

    Returns:
        更新后的掌握度记录
    """
    # 1. 查询现有记录
    record = await db.scalar(
        select(StudentAbilityMastery).where(
            StudentAbilityMastery.student_id == student_id,
            StudentAbilityMastery.ability_code == ability_code,
        )
    )

    # 2. 如果不存在则创建
    if not record:
        record = StudentAbilityMastery(
            student_id=student_id,
            ability_code=ability_code,
            correct_count=0,
            wrong_count=0,
            mastery_score=0.0,
            mastery_level="unlearned",
        )
        db.add(record)

    # 3. 更新计数
    if is_correct:
        record.correct_count += 1
    else:
        record.wrong_count += 1

    # 4. 重新计算掌握度
    record.mastery_score = calculate_mastery_score(
        record.correct_count,
        record.wrong_count,
    )
    record.mastery_level = get_mastery_level(record.mastery_score)
    record.last_practice_time = now()

    logger.debug(
        f"更新掌握度: student={student_id}, ability={ability_code}, "
        f"score={record.mastery_score}, level={record.mastery_level}"
    )

    return record


async def get_student_mastery_list(
    db: AsyncSession,
    student_id: str,
    subject: Optional[str] = None,
    grade: Optional[int] = None,
) -> list[StudentAbilityMastery]:
    """获取学生能力掌握度列表

    Args:
        db: 数据库会话
        student_id: 学生 ID
        subject: 可选，按科目筛选
        grade: 可选，按年级筛选

    Returns:
        掌握度记录列表
    """
    query = select(StudentAbilityMastery).where(StudentAbilityMastery.student_id == student_id)

    # 如果需要按科目/年级筛选，需要关联 AbilityAtomic 表
    if subject or grade:
        query = (
            select(StudentAbilityMastery)
            .join(
                AbilityAtomic,
                StudentAbilityMastery.ability_code == AbilityAtomic.code,
            )
            .where(StudentAbilityMastery.student_id == student_id)
        )
        if subject:
            query = query.where(AbilityAtomic.subject == subject)
        if grade:
            query = query.where(AbilityAtomic.grade == grade)

    query = query.order_by(StudentAbilityMastery.mastery_score.asc())
    result = await db.scalars(query)
    return list(result.all())


async def get_weak_abilities(
    db: AsyncSession,
    student_id: str,
    threshold: float = 60.0,
    limit: int = 5,
) -> list[StudentAbilityMastery]:
    """获取薄弱能力列表（补弱推荐）

    选择 mastery_score < threshold 的能力，
    按分数升序排序（最弱的在前）。

    Args:
        db: 数据库会话
        student_id: 学生 ID
        threshold: 阈值，低于此分数视为薄弱
        limit: 返回数量限制

    Returns:
        薄弱能力掌握度列表
    """
    query = (
        select(StudentAbilityMastery)
        .where(
            StudentAbilityMastery.student_id == student_id,
            StudentAbilityMastery.mastery_score < threshold,
        )
        .order_by(StudentAbilityMastery.mastery_score.asc())
        .limit(limit)
    )

    result = await db.scalars(query)
    return list(result.all())


__all__ = [
    "calculate_mastery_score",
    "get_mastery_level",
    "extract_ability_codes",
    "update_student_mastery",
    "get_student_mastery_list",
    "get_weak_abilities",
]
