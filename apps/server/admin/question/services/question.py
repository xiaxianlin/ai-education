"""
题目服务层
"""

from typing import List, Optional, Tuple

from shared.core.database import Question
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from admin.question.schema import QuestionSearchSchema, QuestionUpdateSchema


async def update_question(db: AsyncSession, id: str, params: QuestionUpdateSchema) -> Question:
    """更新题目"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        raise ValueError(f"题目 {id} 不存在")

    update_data = params.model_dump(exclude_unset=True)
    # 不允许通过此接口更新 ID
    if "id" in update_data:
        del update_data["id"]

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


async def search_questions(db: AsyncSession, params: QuestionSearchSchema) -> Tuple[List[Question], int]:
    """搜索题目，返回列表和总数"""
    conditions = []

    # 题目ID精确匹配
    if params.id:
        conditions.append(Question.id == params.id)

    if params.question_type_code:
        conditions.append(Question.question_type_code == params.question_type_code)

    if params.subject:
        conditions.append(Question.subject == params.subject)

    if params.grade:
        conditions.append(Question.grade == params.grade)

    # 构建基础查询
    base_query = select(Question)
    count_query = select(func.count(Question.id))

    if conditions:
        base_query = base_query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))

    # 获取总数
    total = await db.scalar(count_query) or 0

    # 分页查询
    page = params.page or 1
    size = params.size or 10
    offset = (page - 1) * size
    query = base_query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    questions = list(result.scalars().all())

    return questions, total
