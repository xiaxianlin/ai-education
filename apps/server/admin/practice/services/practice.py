from __future__ import annotations

from shared.core.database import Practice
from shared.core.schema import (
    PracticeSchema,
    SearchResultSchema,
)
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import SavePracticeSchema, SearchPracticeSchema


async def list_practices(db: AsyncSession, params: SearchPracticeSchema) -> SearchResultSchema[PracticeSchema]:
    """列表查询练习"""
    query = select(Practice)

    if params.name:
        query = query.where(Practice.name.like(f"%{params.name}%"))
    if params.slug:
        query = query.where(Practice.slug == params.slug)
    if params.specialty_type:
        query = query.where(Practice.specialty_type == params.specialty_type)
    if params.subject:
        query = query.where(Practice.subject == params.subject)
    if params.is_active is not None:
        query = query.where(Practice.is_active == params.is_active)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询（按ID排序）
    result = await db.scalars(
        query.order_by(Practice.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PracticeSchema.model_validate(item) for item in result.all()],
    )


async def get_practice(db: AsyncSession, id: int) -> PracticeSchema:
    """获取练习详情"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    return PracticeSchema.model_validate(practice)


async def create_practice(db: AsyncSession, params: SavePracticeSchema) -> int:
    """创建练习"""
    # 检查标识是否已存在
    existed = await db.scalar(select(Practice).where(Practice.slug == params.slug))
    if existed:
        raise ValueError("练习标识已存在")

    practice = Practice(
        name=params.name,
        slug=params.slug,
        icon=params.icon,
        description=params.description,
        specialty_type=params.specialty_type,
        subject=params.subject,
        stages=params.stages,
        grades=params.grades,
        question_count_config=params.question_count_config,
        difficulty_config=params.difficulty_config,
        ability_config=params.ability_config,
        feedback_config=params.feedback_config,
        prompt=params.prompt,
        is_active=params.is_active,
        parameter_config={},
    )
    db.add(practice)
    await db.commit()
    await db.refresh(practice)
    return practice.id


async def update_practice(db: AsyncSession, id: int, params: SavePracticeSchema):
    """更新练习"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    # 检查标识是否与其他记录冲突
    existed = await db.scalar(select(Practice).where(Practice.slug == params.slug, Practice.id != id))
    if existed:
        raise ValueError("练习标识已存在")

    # 更新字段
    practice.name = params.name
    practice.slug = params.slug
    practice.icon = params.icon
    practice.description = params.description
    practice.specialty_type = params.specialty_type
    practice.subject = params.subject
    practice.stages = params.stages
    practice.grades = params.grades
    practice.question_count_config = params.question_count_config
    practice.difficulty_config = params.difficulty_config
    practice.ability_config = params.ability_config
    practice.feedback_config = params.feedback_config
    practice.prompt = params.prompt
    practice.is_active = params.is_active

    await db.commit()


async def delete_practice(db: AsyncSession, id: int):
    """删除练习"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    # 系统练习不允许删除（通过 slug 判断，如 daily_practice, unit_practice, assess_practice）
    system_slugs = ["daily_practice", "unit_practice", "assess_practice"]
    if practice.slug in system_slugs:
        raise ValueError("系统练习不允许删除")

    await db.execute(delete(Practice).where(Practice.id == id))
    await db.commit()


async def get_practice_parameters(db: AsyncSession, id: int) -> dict:
    """获取练习参数配置"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    return practice.parameter_config or {}


async def save_practice_parameters(db: AsyncSession, id: int, parameter_config: dict):
    """保存练习参数配置"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    practice.parameter_config = parameter_config
    await db.commit()
