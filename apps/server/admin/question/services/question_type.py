"""
题型服务层
"""

from typing import List, Optional, Tuple
from sqlalchemy import select, and_, func
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


async def update_question_type(db: AsyncSession, id: int, params: QuestionTypeUpdateSchema) -> QuestionType:
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


async def search_question_types(db: AsyncSession, params: QuestionTypeSearchSchema) -> Tuple[List[QuestionType], int]:
    """搜索题型，返回列表和总数"""
    conditions = []

    if params.subject:
        conditions.append(QuestionType.subject == params.subject)

    if params.grade:
        # JSON 数组包含查询
        conditions.append(QuestionType.grades.contains([params.grade]))

    if params.interaction_type:
        conditions.append(QuestionType.interaction_type == params.interaction_type)

    # 构建基础查询
    base_query = select(QuestionType)
    count_query = select(func.count(QuestionType.id))

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
    query = base_query.order_by(QuestionType.sort_order, QuestionType.id).offset(offset).limit(size)

    result = await db.execute(query)
    types = list(result.scalars().all())

    return types, total


async def list_all_question_types(db: AsyncSession) -> List[QuestionType]:
    """获取所有题型（不分页，用于导出全量数据）"""
    # 构建查询，获取所有数据
    query = select(QuestionType).order_by(QuestionType.sort_order, QuestionType.id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def delete_all_question_types(db: AsyncSession) -> int:
    """删除所有题型，返回删除的数量"""
    # 获取所有题型
    result = await db.execute(select(QuestionType))
    all_types = list(result.scalars().all())
    count = len(all_types)

    # 删除所有题型
    for question_type in all_types:
        await db.delete(question_type)

    await db.commit()
    return count


async def batch_create_question_types(
    db: AsyncSession, type_data_list: List[QuestionTypeCreateSchema]
) -> List[QuestionType]:
    """批量创建题型"""
    question_types = []
    for type_data in type_data_list:
        question_type = QuestionType(**type_data.model_dump())
        db.add(question_type)
        question_types.append(question_type)

    await db.commit()

    # 刷新所有对象以获取 ID
    for question_type in question_types:
        await db.refresh(question_type)

    return question_types
