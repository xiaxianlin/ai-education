from sqlalchemy import delete, or_, select, func
from sqlalchemy.orm import noload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple
from loguru import logger
from core.schema import SearchResultSchema, SearchSchema, UnitSchema, QuestionSchema
from core.database import Unit, Knowledge, Textbook
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from shared.question.graph import invoke_generate_workflow
from shared.question.types import GenerationType


async def create_unit(db: AsyncSession, create: CreateUnitSchema) -> Unit:
    """创建课程单元"""
    textbook = await db.scalar(select(Textbook).where(Textbook.id == create.textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    unit = Unit(
        textbook_id=create.textbook_id,
        name=create.name,
        content=create.content,
    )

    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    return unit.id


async def update_unit(db: AsyncSession, id: int, update: UpdateUnitSchema):
    """更新课程单元"""
    unit = await db.scalar(select(Unit).where(Unit.id == id))
    if not unit:
        raise ValueError("课程单元不存在")

    if update.name is not None:
        unit.name = update.name
    if update.content is not None:
        unit.content = update.content
    # status 字段已移除，不再处理

    await db.commit()


async def delete_unit(db: AsyncSession, id: int) -> bool:
    """删除课程单元"""
    unit = await db.scalar(select(Unit).where(Unit.id == id))
    if not unit:
        raise ValueError("课程单元不存在")

    knowledge_ids_result = await db.scalars(select(Knowledge.id).where(Knowledge.unit_id == id))
    knowledge_ids = knowledge_ids_result.all()

    if knowledge_ids:
        await db.execute(delete(Knowledge).where(Knowledge.id.in_(knowledge_ids)))

    await db.delete(unit)
    await db.commit()


async def search_unit(db: AsyncSession, params: SearchSchema) -> Tuple[List[Unit], int]:
    """搜索课程单元"""
    query = select(Unit).options(noload(Unit.textbook))

    if params.keywords:
        query = query.where(
            or_(
                Unit.name.contains(params.keywords),
                Unit.content.contains(params.keywords),
            )
        )

    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(Unit.id).offset(offset).limit(params.size)
    units = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[UnitSchema.model_validate(unit) for unit in units.all()],
    )


async def query_unit_by_textbook(db: AsyncSession, textbook_id: int) -> List[Unit]:
    """根据教材ID查询课程单元"""
    units_result = await db.scalars(
        select(Unit).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
    )
    return units_result.all()


async def generate_unit_questions(
    db: AsyncSession, unit_id: int, count: int = 30
) -> List[QuestionSchema]:
    """
    根据单元ID生成题目

    Args:
        db: 数据库会话
        unit_id: 单元ID
        count: 生成题目数量，默认30道

    Returns:
        生成的题目列表

    Raises:
        ValueError: 单元不存在或没有知识点
    """
    # 1. 查询单元信息（联合查询教材）
    unit = await db.scalar(
        select(Unit).options(joinedload(Unit.textbook)).where(Unit.id == unit_id)
    )
    if not unit:
        raise ValueError("单元不存在")

    # 2. 获取教材信息
    textbook = unit.textbook
    if not textbook:
        raise ValueError("单元关联的教材不存在")

    # 3. 检查是否有知识点
    knowledge_count = await db.scalar(
        select(func.count()).select_from(Knowledge).where(Knowledge.unit_id == unit_id)
    )
    if not knowledge_count or knowledge_count == 0:
        raise ValueError("单元没有知识点信息，请先添加知识点")

    logger.info(
        f"[Admin] 开始为单元生成题目: unit_id={unit_id}, unit_name={unit.name}, "
        f"subject={textbook.subject}, grade={textbook.grade}, count={count}"
    )

    try:
        # 4. 调用题目生成工作流
        questions = await invoke_generate_workflow(
            db=db,
            type=GenerationType.UNIT.value,
            count=count,
            unit_id=unit_id,
        )

        logger.info(
            f"[Admin] 单元题目生成成功: unit_id={unit_id}, "
            f"generated_count={len(questions)}"
        )

        # 5. 返回题目列表
        return [QuestionSchema.model_validate(q) for q in questions]

    except Exception as e:
        logger.error(f"[Admin] 单元题目生成失败: unit_id={unit_id}, error={e}")
        raise ValueError(f"题目生成失败: {str(e)}")
