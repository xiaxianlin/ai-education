from shared.core.database import Knowledge, Unit
from shared.core.schema import KnowledgeSchema, SearchResultSchema, SearchSchema
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload

from ..schema import CreateKnowledgeSchema, UpdateKnowledgeSchema


async def create_knowledge(db: AsyncSession, create: CreateKnowledgeSchema):
    """创建知识点"""
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


async def query_knowledges_by_textbook(db: AsyncSession, textbook_id: int, params: SearchSchema):
    """搜索知识点"""
    query = select(Knowledge).where(Knowledge.textbook_id == textbook_id)

    count_query = select(func.count(Knowledge.id)).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    offset = (params.page - 1) * params.size
    query = query.offset(offset).limit(params.size)
    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[KnowledgeSchema.model_validate(item) for item in result.all()],
    )
