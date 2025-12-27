"""
题型服务层
"""

from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import QuestionType
from admin.question.schema import (
    QuestionTypeCreateSchema,
    QuestionTypeUpdateSchema,
    QuestionTypeSearchSchema,
)


async def create_question_type(db: AsyncSession, params: QuestionTypeCreateSchema) -> QuestionType:
    """创建题型"""
    question_type = QuestionType(**params.model_dump())
    db.add(question_type)
    await db.commit()
    await db.refresh(question_type)
    return question_type


async def update_question_type(
    db: AsyncSession, id: int, params: QuestionTypeUpdateSchema
) -> QuestionType:
    """更新题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    update_data = params.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question_type, key, value)

    await db.commit()
    await db.refresh(question_type)
    return question_type


async def delete_question_type(db: AsyncSession, id: int) -> None:
    """删除题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    await db.delete(question_type)
    await db.commit()


async def get_question_type(db: AsyncSession, id: int) -> Optional[QuestionType]:
    """获取题型详情"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    return result.scalar_one_or_none()


async def get_question_type_by_code(db: AsyncSession, code: str) -> Optional[QuestionType]:
    """根据编码获取题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.code == code))
    return result.scalar_one_or_none()


async def search_question_types(
    db: AsyncSession, params: QuestionTypeSearchSchema
) -> List[QuestionType]:
    """搜索题型"""
    conditions = []

    if params.subject:
        conditions.append(QuestionType.subject == params.subject)

    if params.stage:
        # JSON 数组包含查询
        conditions.append(QuestionType.stages.contains([params.stage]))

    if params.grade:
        # JSON 数组包含查询
        conditions.append(QuestionType.grades.contains([params.grade]))

    if params.interaction_type:
        conditions.append(QuestionType.interaction_type == params.interaction_type)

    if params.is_active is not None:
        conditions.append(QuestionType.is_active == params.is_active)

    query = select(QuestionType)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(QuestionType.sort_order, QuestionType.id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def list_all_question_types(db: AsyncSession) -> List[QuestionType]:
    """获取所有启用的题型"""
    result = await db.execute(
        select(QuestionType)
        .where(QuestionType.is_active == True)
        .order_by(QuestionType.sort_order, QuestionType.id)
    )
    return list(result.scalars().all())
