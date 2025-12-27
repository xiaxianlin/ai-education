"""
题目服务层
"""

import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Question
from admin.question.schema import (
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
)


def generate_question_id() -> str:
    """生成题目ID"""
    return str(uuid.uuid4())


async def create_question(db: AsyncSession, params: QuestionCreateSchema) -> Question:
    """创建题目"""
    data = params.model_dump()

    # 如果没有传ID，自动生成
    if not data.get("id"):
        data["id"] = generate_question_id()

    question = Question(**data)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


async def create_questions_batch(
    db: AsyncSession, questions: List[QuestionCreateSchema]
) -> List[Question]:
    """批量创建题目"""
    created = []
    for params in questions:
        data = params.model_dump()
        if not data.get("id"):
            data["id"] = generate_question_id()
        question = Question(**data)
        db.add(question)
        created.append(question)

    await db.commit()

    for q in created:
        await db.refresh(q)

    return created


async def update_question(db: AsyncSession, id: str, params: QuestionUpdateSchema) -> Question:
    """更新题目"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        raise ValueError(f"题目 {id} 不存在")

    update_data = params.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)

    await db.commit()
    await db.refresh(question)
    return question


async def delete_question(db: AsyncSession, id: str) -> None:
    """删除题目"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        raise ValueError(f"题目 {id} 不存在")

    await db.delete(question)
    await db.commit()


async def get_question(db: AsyncSession, id: str) -> Optional[Question]:
    """获取题目详情"""
    result = await db.execute(select(Question).where(Question.id == id))
    return result.scalar_one_or_none()


async def search_questions(
    db: AsyncSession, params: QuestionSearchSchema
) -> Tuple[List[Question], int]:
    """搜索题目，返回列表和总数"""
    conditions = []

    if params.question_type_id:
        conditions.append(Question.question_type_id == params.question_type_id)

    if params.question_type_code:
        conditions.append(Question.question_type_code == params.question_type_code)

    if params.subject:
        conditions.append(Question.subject == params.subject)

    if params.grade:
        conditions.append(Question.grade == params.grade)

    if params.stage:
        conditions.append(Question.stage == params.stage)

    if params.textbook_id:
        conditions.append(Question.textbook_id == params.textbook_id)

    if params.unit_id:
        conditions.append(Question.unit_id == params.unit_id)

    if params.difficulty:
        conditions.append(Question.difficulty == params.difficulty)

    if params.cognitive_level:
        conditions.append(Question.cognitive_level == params.cognitive_level)

    if params.source:
        conditions.append(Question.source == params.source)

    if params.is_active is not None:
        conditions.append(Question.is_active == params.is_active)

    # 构建基础查询
    base_query = select(Question)
    count_query = select(func.count(Question.id))

    if conditions:
        base_query = base_query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))

    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页查询
    page = params.page or 1
    size = params.size or 10
    offset = (page - 1) * size
    query = base_query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    questions = list(result.scalars().all())

    return questions, total


async def get_questions_by_ids(db: AsyncSession, ids: List[str]) -> List[Question]:
    """根据ID列表获取题目"""
    if not ids:
        return []

    result = await db.execute(select(Question).where(Question.id.in_(ids)))
    return list(result.scalars().all())


async def count_questions_by_type(db: AsyncSession, question_type_id: int) -> int:
    """统计题型下的题目数量"""
    result = await db.execute(
        select(func.count(Question.id)).where(Question.question_type_id == question_type_id)
    )
    return result.scalar() or 0


async def increment_usage_count(db: AsyncSession, id: str) -> None:
    """增加题目使用次数"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if question:
        question.usage_count = (question.usage_count or 0) + 1
        await db.commit()


async def update_correct_rate(db: AsyncSession, id: str, correct_rate: str) -> None:
    """更新题目正确率"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if question:
        question.correct_rate = correct_rate
        await db.commit()
