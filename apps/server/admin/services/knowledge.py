from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload

from admin.schema import CreateKnowledgeSchema, UpdateKnowledgeSchema
from shared.core.database import Knowledge, Unit
from shared.core.schema import KnowledgeSchema, SearchResultSchema, SearchSchema
from shared.utils.time import now


async def create_knowledge(db: AsyncSession, create: CreateKnowledgeSchema):
    """创建知识点"""
    # 验证课程单元是否存在
    unit = await db.scalar(select(Unit).where(Unit.id == create.unit_id))
    if not unit:
        raise ValueError("课程单元不存在")

    knowledge = Knowledge(
        unit_id=create.unit_id,
        textbook_id=unit.textbook_id,
        name=create.name,
        content=create.content,
    )

    db.add(knowledge)
    await db.commit()
    await db.refresh(knowledge)
    return knowledge.id


async def get_knowledge(db: AsyncSession, id: int):
    """根据ID获取知识点"""
    result = await db.execute(
        select(Knowledge)
        .options(
            joinedload(Knowledge.unit).noload(Unit.textbook),
            joinedload(Knowledge.textbook),
        )
        .where(Knowledge.id == id)
    )
    knowledge = result.scalar_one_or_none()
    if knowledge is None:
        raise ValueError("知识点不存在")
    return KnowledgeSchema.model_validate(knowledge)


async def query_knowledge_by_unit(db: AsyncSession, unit_id: int):
    """根据课程单元ID获取知识点列表"""
    knowledges = await db.scalars(
        select(Knowledge)
        .options(noload(Knowledge.textbook), noload(Knowledge.unit))
        .where(Knowledge.unit_id == unit_id)
    )

    return [KnowledgeSchema.model_validate(knowledge) for knowledge in knowledges.all()]


async def update_knowledge(db: AsyncSession, id: int, update: UpdateKnowledgeSchema):
    """更新知识点"""
    knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == id))
    if not knowledge:
        raise ValueError("知识点不存在")

    if update.name is not None:
        knowledge.name = update.name
    if update.content is not None:
        knowledge.content = update.content
    # status 字段已移除，不再处理

    await db.commit()


async def delete_knowledge(db: AsyncSession, id: int):
    """删除知识点"""
    knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == id))
    if not knowledge:
        raise ValueError("知识点不存在")

    await db.delete(knowledge)
    await db.commit()
