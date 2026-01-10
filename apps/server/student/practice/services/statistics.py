"""
练习统计服务

提供学生练习数据的统计功能，包括全部时间和最近30天的统计数据。
"""

from shared.core.database import Practice
from shared.utils.time import now
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_practice_statistics(db: AsyncSession, student_id: str):
    """获取学生练习统计数据

    Args:
        db: 数据库会话
        student_id: 学生 ID

    Returns:
        dict: 包含 all_time 和 recent_30_days 两个时间段的统计数据
    """
    # 计算30天前的时间戳
    current_time = now()
    thirty_days_ago = current_time - 30 * 24 * 60 * 60

    # 全部时间的统计
    all_time_stats = await _calculate_statistics(db, student_id, None)

    # 最近30天的统计
    recent_30_days_stats = await _calculate_statistics(db, student_id, thirty_days_ago)

    return {
        "all_time": all_time_stats,
        "recent_30_days": recent_30_days_stats,
    }


async def _calculate_statistics(db: AsyncSession, student_id: str, start_time: int | None):
    """计算统计数据

    Args:
        db: 数据库会话
        student_id: 学生 ID
        start_time: 开始时间戳（None 表示全部时间）

    Returns:
        dict: 统计数据
    """
    # 构建基础查询条件（排除已废弃的练习，status != 3）
    base_conditions = [
        Practice.student_id == student_id,
        Practice.status != 3,  # 排除已废弃的练习
    ]
    if start_time is not None:
        base_conditions.append(Practice.create_time >= start_time)

    # 总练习数（排除已废弃的）
    total_practices_query = select(func.count(Practice.id)).where(*base_conditions)
    total_practices = await db.scalar(total_practices_query) or 0

    # 总做题数（所有练习的 answer_count 之和，排除已废弃的）
    total_questions_query = select(func.sum(Practice.answer_count)).where(*base_conditions)
    total_questions = await db.scalar(total_questions_query) or 0

    # 完成的单元练习数（status=2 且 practice_type='unit_practice'）
    completed_unit_conditions = base_conditions + [
        Practice.practice_type == "unit_practice",
        Practice.status == 2,  # 已完成
    ]
    completed_unit_query = select(func.count(Practice.id)).where(*completed_unit_conditions)
    completed_unit_practices = await db.scalar(completed_unit_query) or 0

    # 完成的能力练习数（status=2 且 practice_type='ability_practice'）
    completed_ability_conditions = base_conditions + [
        Practice.practice_type == "ability_practice",
        Practice.status == 2,  # 已完成
    ]
    completed_ability_query = select(func.count(Practice.id)).where(*completed_ability_conditions)
    completed_ability_practices = await db.scalar(completed_ability_query) or 0

    # 总正确数和总答题数（用于计算正确率，排除已废弃的）
    total_correct_query = select(func.sum(Practice.correct_count)).where(*base_conditions)
    total_correct = await db.scalar(total_correct_query) or 0
    total_answer_query = select(func.sum(Practice.answer_count)).where(*base_conditions)
    total_answer = await db.scalar(total_answer_query) or 0

    # 总正确率（百分比）
    total_accuracy = 0.0
    if total_answer > 0:
        total_accuracy = round((total_correct / total_answer) * 100, 2)

    # 平均正确率：查询所有已完成的练习，计算每个练习的正确率，然后取平均
    completed_conditions = base_conditions + [Practice.status == 2, Practice.answer_count > 0]
    completed_practices_result = await db.execute(
        select(Practice).where(*completed_conditions)
    )
    completed_practices_list = completed_practices_result.scalars().all()

    average_accuracy = 0.0
    if completed_practices_list:
        accuracies = []
        for practice in completed_practices_list:
            if practice.answer_count > 0:
                accuracy = (practice.correct_count / practice.answer_count) * 100
                accuracies.append(accuracy)
        if accuracies:
            average_accuracy = round(sum(accuracies) / len(accuracies), 2)

    return {
        "total_practices": total_practices,
        "total_questions": total_questions,
        "completed_unit_practices": completed_unit_practices,
        "completed_ability_practices": completed_ability_practices,
        "total_accuracy": total_accuracy,
        "average_accuracy": average_accuracy,
    }
