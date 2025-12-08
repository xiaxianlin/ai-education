"""错题记录服务（学生端）"""

from typing import List, Optional
from loguru import logger
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from shared.core.database import PracticeWrongRecord, Question
from shared.core.schema import QuestionSchema


class WrongQuestionSummary:
    """错题汇总信息"""
    def __init__(
        self,
        question_id: int,
        wrong_count: int,
        last_wrong_time: int,
        is_mastered: int,
        mastered_time: int,
        create_time: int,
        update_time: int,
        question_content: Optional[str] = None,
        knowledge: Optional[str] = None,
    ):
        self.question_id = question_id
        self.wrong_count = wrong_count
        self.last_wrong_time = last_wrong_time
        self.is_mastered = is_mastered
        self.mastered_time = mastered_time
        self.create_time = create_time
        self.update_time = update_time
        self.question_content = question_content
        self.knowledge = knowledge


async def get_wrong_questions(
    db: AsyncSession,
    student_id: str,
    mastered: Optional[int] = None,
) -> List[dict]:
    """
    获取学生的错题列表（按 question_id 聚合）
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        mastered: 是否已掌握 (None-全部, 0-未掌握, 1-已掌握)
        
    Returns:
        错题列表，每个错题包含：
        - question_id: 题目ID
        - wrong_count: 错题次数
        - last_wrong_time: 最后错题时间
        - is_mastered: 是否已掌握 (0-未掌握, 1-已掌握)
        - mastered_time: 掌握时间
        - question_content: 题目内容
        - knowledge: 知识点
    """
    # 查询该学生的所有错题记录
    wrong_records = await db.scalars(
        select(PracticeWrongRecord)
        .where(PracticeWrongRecord.student_id == student_id)
        .order_by(desc(PracticeWrongRecord.create_time))
    )
    records = wrong_records.all()
    
    if not records:
        return []
    
    # 按 question_id 聚合
    question_map: dict[int, WrongQuestionSummary] = {}
    
    for record in records:
        question_id = record.question_id
        
        if question_id not in question_map:
            # 初始化错题汇总
            question_map[question_id] = WrongQuestionSummary(
                question_id=question_id,
                wrong_count=0,
                last_wrong_time=0,
                is_mastered=0,  # 默认未掌握
                mastered_time=0,
                create_time=record.create_time,
                update_time=record.update_time,
                knowledge=record.knowledge,
            )
        
        summary = question_map[question_id]
        
        # 更新错题次数
        summary.wrong_count += 1
        
        # 更新最后错题时间（取最新的）
        if record.create_time > summary.last_wrong_time:
            summary.last_wrong_time = record.create_time
        
        # 如果已订正，标记为已掌握
        if record.is_corrected == 1:
            summary.is_mastered = 1
            if record.corrected_time > summary.mastered_time:
                summary.mastered_time = record.corrected_time
        
        # 更新创建时间和更新时间
        if record.create_time < summary.create_time:
            summary.create_time = record.create_time
        if record.update_time > summary.update_time:
            summary.update_time = record.update_time
    
    # 获取题目内容
    question_ids = list(question_map.keys())
    questions = await db.scalars(
        select(Question).where(Question.id.in_(question_ids))
    )
    question_dict = {q.id: q for q in questions.all()}
    
    # 构建结果列表
    result = []
    for question_id, summary in question_map.items():
        question = question_dict.get(question_id)
        
        # 应用 mastered 筛选
        if mastered is not None and summary.is_mastered != mastered:
            continue
        
        result.append({
            "id": question_id,  # 使用 question_id 作为 id
            "student_id": student_id,
            "question_id": question_id,
            "wrong_count": summary.wrong_count,
            "last_wrong_time": summary.last_wrong_time,
            "is_mastered": summary.is_mastered,
            "mastered_time": summary.mastered_time,
            "create_time": summary.create_time,
            "update_time": summary.update_time,
            "question_content": question.content if question else None,
            "knowledge": summary.knowledge,
        })
    
    # 按最后错题时间倒序排序
    result.sort(key=lambda x: x["last_wrong_time"], reverse=True)
    
    logger.info(
        f"获取错题列表: student_id={student_id}, mastered={mastered}, count={len(result)}"
    )
    
    return result


async def mark_question_as_mastered(
    db: AsyncSession,
    student_id: str,
    question_id: int,
) -> None:
    """
    标记题目为已掌握
    
    将该题目的所有未订正的错题记录标记为已订正
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        question_id: 题目ID
    """
    from shared.utils.time import now
    
    # 查询该学生该题目的所有未订正的错题记录
    wrong_records = await db.scalars(
        select(PracticeWrongRecord).where(
            PracticeWrongRecord.student_id == student_id,
            PracticeWrongRecord.question_id == question_id,
            PracticeWrongRecord.is_corrected == 0,
        )
    )
    records = wrong_records.all()
    
    if not records:
        logger.warning(
            f"没有找到未订正的错题记录: student_id={student_id}, question_id={question_id}"
        )
        return
    
    # 标记为已订正
    current_time = now()
    for record in records:
        record.is_corrected = 1
        record.corrected_time = current_time
        record.update_time = current_time
        db.add(record)
    
    await db.commit()
    
    logger.info(
        f"标记题目为已掌握: student_id={student_id}, question_id={question_id}, count={len(records)}"
    )


async def unmark_question_as_mastered(
    db: AsyncSession,
    student_id: str,
    question_id: int,
) -> None:
    """
    取消标记题目为已掌握（标记为未掌握）
    
    将该题目的所有已订正的错题记录取消订正标记
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        question_id: 题目ID
    """
    from shared.utils.time import now
    
    # 查询该学生该题目的所有已订正的错题记录
    wrong_records = await db.scalars(
        select(PracticeWrongRecord).where(
            PracticeWrongRecord.student_id == student_id,
            PracticeWrongRecord.question_id == question_id,
            PracticeWrongRecord.is_corrected == 1,
        )
    )
    records = wrong_records.all()
    
    if not records:
        logger.warning(
            f"没有找到已订正的错题记录: student_id={student_id}, question_id={question_id}"
        )
        return
    
    # 取消订正标记
    current_time = now()
    for record in records:
        record.is_corrected = 0
        record.corrected_time = 0
        record.update_time = current_time
        db.add(record)
    
    await db.commit()
    
    logger.info(
        f"取消标记题目为已掌握: student_id={student_id}, question_id={question_id}, count={len(records)}"
    )

