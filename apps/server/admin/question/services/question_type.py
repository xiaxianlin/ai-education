"""
题型服务层
"""

from typing import List

from shared.core.database import QuestionType
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from admin.question.schema import AbilityPracticeSearchSchema, QuestionTypeSaveSchema


async def create_question_type(db: AsyncSession, params: QuestionTypeSaveSchema):
    """创建题型"""
    question_type = QuestionType(**params.model_dump())
    db.add(question_type)
    await db.commit()
    await db.refresh(question_type)


async def update_question_type(db: AsyncSession, id: int, params: QuestionTypeSaveSchema):
    """更新题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    update_data = params.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(question_type, key, value)

    await db.commit()
    await db.refresh(question_type)


async def delete_question_type(db: AsyncSession, id: int) -> None:
    """删除题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    await db.delete(question_type)
    await db.commit()


async def search_unit_practice_types(db: AsyncSession):
    """搜索单元练习题型"""
    query = select(QuestionType).where(QuestionType.category == "unit_practice").order_by(QuestionType.id)
    result = await db.scalars(query)
    return list(result.all())


async def search_ability_practice_types(db: AsyncSession, params: AbilityPracticeSearchSchema):
    """搜索能力练习题型"""

    query = (
        select(QuestionType)
        .where(
            QuestionType.category == "ability_practice",
            QuestionType.subject == params.subject,
        )
        .order_by(QuestionType.id)
    )

    result = await db.scalars(query)
    return list(result.all())


async def list_all_question_types(db: AsyncSession) -> List[QuestionType]:
    """获取所有题型（不分页，用于导出全量数据）"""
    # 构建查询，获取所有数据
    query = select(QuestionType).order_by(QuestionType.id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def batch_create_question_types(db: AsyncSession, type_data_list: List[QuestionTypeSaveSchema]):
    """批量创建题型"""

    for type_data in type_data_list:
        question_type = QuestionType(**type_data.model_dump())
        db.add(question_type)

    await db.commit()
