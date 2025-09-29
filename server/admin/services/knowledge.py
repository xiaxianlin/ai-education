from sqlalchemy import or_, select, func
from sqlalchemy.orm import joinedload, noload
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateKnowledgeSchema, UpdateKnowledgeSchema
from common.database import Knowledge, Unit, Question
from common.schema import KnowledgeSchema, SearchResultSchema, SearchSchema
from utils.time import now


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


async def query_knowledge_by_textbook(db: AsyncSession, textbook_id: int):
    """根据教材ID获取知识点列表"""
    knowledges = await db.scalars(
        select(Knowledge)
        .options(noload(Knowledge.textbook), noload(Knowledge.unit))
        .where(Knowledge.textbook_id == textbook_id)
    )

    return [KnowledgeSchema.model_validate(knowledge) for knowledge in knowledges.all()]


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
    if update.status is not None:
        knowledge.status = update.status

    knowledge.update_time = now()
    await db.commit()


async def delete_knowledge(db: AsyncSession, id: str) -> bool:
    """删除知识点"""
    knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == id))
    if not knowledge:
        raise ValueError("知识点不存在")

    total = await db.scalar(select(func.count(Question.id)).where(Question.id == id)) or 0
    if total > 0:
        raise ValueError("知识点已关联了问题，不能被删除")

    await db.delete(knowledge)
    await db.commit()


async def search_knowledge(db: AsyncSession, params: SearchSchema):
    """搜索课程单元"""
    query = select(Knowledge).options(noload(Knowledge.textbook), noload(Knowledge.unit))

    if params.keywords:
        query = query.where(
            or_(
                Knowledge.name.contains(params.keywords),
                Knowledge.content.contains(params.keywords),
            )
        )

    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(Knowledge.id).offset(offset).limit(params.size)
    units = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[KnowledgeSchema.model_validate(unit) for unit in units.all()],
    )
