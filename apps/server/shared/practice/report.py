"""练习报告服务"""

import json
from typing import Dict, List

from loguru import logger
from shared.core.database import (
    Practice,
    PracticeAnswer,
    PracticeReport,
)
from shared.core.database import Question
from shared.utils.time import now
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def generate_practice_report(db: AsyncSession, student_id: str, session_id: str) -> int:
    """
    生成练习报告

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID (UUID v4)

    Returns:
        报告ID
    """
    # 1. 查询练习
    session = await db.scalar(select(Practice).where(Practice.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    if session.student_id != student_id:
        raise ValueError("无权操作此练习")

    # 2. 检查是否已存在报告
    existing_report = await db.scalar(
        select(PracticeReport).where(PracticeReport.session_id == session_id)
    )
    if existing_report:
        logger.info(f"报告已存在: report_id={existing_report.id}")
        return existing_report.id

    # 3. 查询所有答题记录
    answer_records = await db.scalars(
        select(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
    )
    answers = answer_records.all()

    # 4. 统计基础数据
    total_questions = len(answers)
    correct_questions = sum(1 for ans in answers if ans.status == 1)
    total_time = sum(ans.time_spent for ans in answers if ans.time_spent)

    # 计算总得分（正确率 * 100）
    overall_score = (correct_questions / total_questions * 100) if total_questions > 0 else 0.0

    # 5. 分析知识点掌握情况
    knowledge_scores = await analyze_knowledge_scores(db, answers)

    # 6. 分析题目来源分布
    question_distribution = await analyze_question_distribution(db, answers)

    # 7. 分析能力分解（按难度）
    ability_breakdown = await analyze_ability_breakdown(db, answers)

    # 8. 计算学习速度和稳定性
    learning_speed = calculate_learning_speed(answers)
    consistency = calculate_consistency(answers)

    # 9. 生成优势、薄弱点和建议
    strengths, weaknesses, recommendations = await generate_recommendations(
        db, answers, knowledge_scores, overall_score, session.practice_type
    )

    # 10. 综合评估（主要用于assessment类型）
    current_ability, confidence, ability_level, percentile = calculate_ability_assessment(
        overall_score, consistency
    )

    # 11. 创建报告
    report = PracticeReport(
        session_id=session_id,
        student_id=student_id,
        total_questions=total_questions,
        correct_questions=correct_questions,
        total_time=total_time,
        overall_score=round(overall_score, 2),
        current_ability=round(current_ability, 2),
        confidence=round(confidence, 2),
        ability_level=ability_level,
        percentile=percentile,
        knowledge_scores=json.dumps(knowledge_scores, ensure_ascii=False),
        question_distribution=json.dumps(question_distribution, ensure_ascii=False),
        ability_breakdown=json.dumps(ability_breakdown, ensure_ascii=False),
        learning_speed=round(learning_speed, 2),
        consistency=round(consistency, 2),
        strengths=json.dumps(strengths, ensure_ascii=False),
        weaknesses=json.dumps(weaknesses, ensure_ascii=False),
        recommendations=json.dumps(recommendations, ensure_ascii=False),
        create_time=now(),
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    logger.info(f"练习报告生成成功: report_id={report.id}, session_id={session_id}")

    return report.id


async def analyze_knowledge_scores(db: AsyncSession, answers: List[PracticeAnswer]) -> Dict:
    """分析知识点掌握情况"""
    if not answers:
        return {}

    # 批量查询所有题目 (V2)
    question_ids = [answer.question_id for answer in answers]
    questions_result = await db.scalars(select(Question).where(Question.id.in_(question_ids)))
    questions = {q.id: q for q in questions_result.all()}

    knowledge_stats = {}
    for answer in answers:
        question = questions.get(answer.question_id)
        # V2: knowledge_points is a list
        if not question or not question.knowledge_points:
            continue

        # Use first knowledge point
        knowledge = question.knowledge_points[0] if question.knowledge_points else None
        if not knowledge:
            continue

        if knowledge not in knowledge_stats:
            knowledge_stats[knowledge] = {"total": 0, "correct": 0}

        knowledge_stats[knowledge]["total"] += 1
        if answer.status == 1:
            knowledge_stats[knowledge]["correct"] += 1

    # 计算正确率
    result = {}
    for knowledge, stats in knowledge_stats.items():
        accuracy = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result[knowledge] = {
            "total": stats["total"],
            "correct": stats["correct"],
            "accuracy": round(accuracy, 2),
        }

    return result


async def analyze_question_distribution(
    db: AsyncSession, answers: List[PracticeAnswer]
) -> Dict:
    """分析题目来源分布（按题型）"""
    if not answers:
        return {}

    # 批量查询所有题目 (V2)
    question_ids = [answer.question_id for answer in answers]
    questions_result = await db.scalars(select(Question).where(Question.id.in_(question_ids)))
    questions = {q.id: q for q in questions_result.all()}

    type_stats = {}
    for answer in answers:
        question = questions.get(answer.question_id)
        if not question:
            continue

        # V2: question_type_code instead of type
        q_type = question.question_type_code
        if q_type not in type_stats:
            type_stats[q_type] = {"total": 0, "correct": 0}

        type_stats[q_type]["total"] += 1
        if answer.status == 1:
            type_stats[q_type]["correct"] += 1

    # 计算正确率
    result = {}
    for q_type, stats in type_stats.items():
        accuracy = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result[q_type] = {
            "total": stats["total"],
            "correct": stats["correct"],
            "accuracy": round(accuracy, 2),
        }

    return result


async def analyze_ability_breakdown(db: AsyncSession, answers: List[PracticeAnswer]) -> Dict:
    """分析能力分解（按难度）"""
    if not answers:
        return {}

    # 批量查询所有题目 (V2)
    question_ids = [answer.question_id for answer in answers]
    questions_result = await db.scalars(select(Question).where(Question.id.in_(question_ids)))
    questions = {q.id: q for q in questions_result.all()}

    difficulty_stats = {}
    for answer in answers:
        question = questions.get(answer.question_id)
        if not question:
            continue

        difficulty = question.difficulty
        if difficulty not in difficulty_stats:
            difficulty_stats[difficulty] = {"total": 0, "correct": 0}

        difficulty_stats[difficulty]["total"] += 1
        if answer.status == 1:
            difficulty_stats[difficulty]["correct"] += 1

    # 计算正确率
    result = {}
    for difficulty, stats in difficulty_stats.items():
        accuracy = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result[difficulty] = {
            "total": stats["total"],
            "correct": stats["correct"],
            "accuracy": round(accuracy, 2),
        }

    return result


def calculate_learning_speed(answers: List[PracticeAnswer]) -> float:
    """计算学习速度（平均答题时间）"""
    if not answers:
        return 0.0

    total_time = sum(ans.time_spent for ans in answers if ans.time_spent)
    answered_count = sum(1 for ans in answers if ans.time_spent)

    if answered_count == 0:
        return 0.0

    # 平均每题耗时（秒）
    avg_time = total_time / answered_count
    return avg_time


def calculate_consistency(answers: List[PracticeAnswer]) -> float:
    """计算稳定性（答题正确率的标准差）"""
    if len(answers) < 5:
        return 0.0

    # 计算每5题的正确率
    chunk_size = 5
    accuracies = []

    for i in range(0, len(answers), chunk_size):
        chunk = answers[i : i + chunk_size]
        correct = sum(1 for ans in chunk if ans.status == 1)
        accuracy = correct / len(chunk) * 100
        accuracies.append(accuracy)

    if len(accuracies) < 2:
        return 100.0  # 题目太少，认为稳定性很高

    # 计算标准差（标准差越小，稳定性越高）
    mean = sum(accuracies) / len(accuracies)
    variance = sum((x - mean) ** 2 for x in accuracies) / len(accuracies)
    std_dev = variance**0.5

    # 转换为稳定性分数（0-100，越高越稳定）
    consistency_score = max(0, 100 - std_dev)

    return consistency_score


async def generate_recommendations(
    db: AsyncSession,
    answers: List[PracticeAnswer],
    knowledge_scores: Dict,
    overall_score: float,
    practice_type: str,
) -> tuple:
    """生成优势、薄弱点和学习建议
    
    Args:
        db: 数据库会话
        answers: 答题记录列表
        knowledge_scores: 知识点掌握情况
        overall_score: 总得分
        practice_type: 练习类型 (ability_practice / unit_practice)
    """
    strengths = []
    weaknesses = []
    recommendations = []

    # 分析优势（正确率 >= 80% 的知识点）
    for knowledge, stats in knowledge_scores.items():
        if stats["accuracy"] >= 80:
            strengths.append(f"{knowledge}掌握良好（正确率{stats['accuracy']:.1f}%）")

    # 分析薄弱点（正确率 < 60% 的知识点）
    for knowledge, stats in knowledge_scores.items():
        if stats["accuracy"] < 60:
            weaknesses.append(f"{knowledge}需要加强（正确率{stats['accuracy']:.1f}%）")

    # 生成建议
    if overall_score >= 80:
        recommendations.append("整体表现优秀，继续保持！")
    elif overall_score >= 60:
        recommendations.append("基础掌握较好，需要进一步巩固薄弱知识点。")
    else:
        recommendations.append("需要系统性复习，建议从基础知识点开始重新学习。")

    # 针对薄弱点的建议
    if weaknesses:
        recommendations.append(
            f"重点加强：{', '.join([w.split('需要')[0] for w in weaknesses[:3]])}"
        )

    # 根据练习类型给建议
    if practice_type == "ability_practice":
        recommendations.append("建议继续针对薄弱能力进行专项练习。")
    elif practice_type == "unit_practice":
        recommendations.append("单元练习结束后，可以进行综合评估检验学习效果。")
    # 兼容旧版练习类型
    elif practice_type == "daily_practice":
        recommendations.append("建议每天坚持练习，巩固学习成果。")
    elif practice_type == "assess_practice":
        recommendations.append("根据综合评估结果，制定针对性的学习计划。")

    return strengths, weaknesses, recommendations


def calculate_ability_assessment(overall_score: float, consistency: float) -> tuple:
    """计算综合评估指标"""
    # 根据正确率计算能力值（-3到+3）
    if overall_score >= 90:
        current_ability = 2.5 + (overall_score - 90) / 10 * 0.5
    elif overall_score >= 70:
        current_ability = 1.0 + (overall_score - 70) / 20 * 1.5
    elif overall_score >= 50:
        current_ability = -0.5 + (overall_score - 50) / 20 * 1.5
    else:
        current_ability = -2.0 + overall_score / 50 * 1.5

    # 置信度基于稳定性
    confidence = consistency / 100

    # 能力等级
    if current_ability >= 2.0:
        ability_level = "优秀"
    elif current_ability >= 1.0:
        ability_level = "良好"
    elif current_ability >= 0:
        ability_level = "中等"
    elif current_ability >= -1.0:
        ability_level = "及格"
    else:
        ability_level = "需提高"

    # 百分位排名（简化计算）
    percentile = min(99, int((current_ability + 3) / 6 * 100))

    return current_ability, confidence, ability_level, percentile
