"""
原子能力服务
"""

from typing import Optional

from shared.core.database import AbilityAtomic, AbilityDomain
from shared.core.schema import AbilityAtomicSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import (
    CreateAbilityAtomicSchema,
    SearchAbilityAtomicSchema,
    UpdateAbilityAtomicSchema,
)


async def create_ability_atomic(db: AsyncSession, data: CreateAbilityAtomicSchema):
    """创建原子能力（检查唯一性）"""
    subject = data.subject.strip()
    grade = data.grade
    code = data.code.strip()
    domain_code = data.domain_code.strip()

    # 检查能力域是否存在
    domain_stmt = select(AbilityDomain).where(AbilityDomain.subject == subject, AbilityDomain.code == domain_code)
    domain = await db.scalar(domain_stmt)
    if not domain:
        raise ValueError("能力域不存在")

    # 检查唯一性
    exists_stmt = select(AbilityAtomic).where(
        AbilityAtomic.subject == subject,
        AbilityAtomic.grade == grade,
        AbilityAtomic.code == code,
    )
    atomic_exists = await db.scalar(exists_stmt)
    if atomic_exists:
        raise ValueError("该科目、年级下已存在相同代码的原子能力")

    atomic = AbilityAtomic(
        subject=subject,
        grade=grade,
        domain_code=domain_code,
        code=code,
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        difficulty=data.difficulty,
        sort_order=data.sort_order,
    )
    db.add(atomic)
    await db.commit()
    await db.refresh(atomic)

    return atomic.id


async def update_ability_atomic(db: AsyncSession, id: int, data: UpdateAbilityAtomicSchema):
    """更新原子能力"""
    atomic = await db.scalar(select(AbilityAtomic).where(AbilityAtomic.id == id))
    if not atomic:
        raise ValueError("原子能力不存在")

    if data.name is not None:
        atomic.name = data.name.strip()
    if data.description is not None:
        atomic.description = data.description.strip() if data.description else None
    if data.difficulty is not None:
        atomic.difficulty = data.difficulty
    if data.sort_order is not None:
        atomic.sort_order = data.sort_order
    if data.is_active is not None:
        atomic.is_active = data.is_active

    await db.commit()
    await db.refresh(atomic)


async def delete_ability_atomic(db: AsyncSession, id: int):
    """删除原子能力"""
    atomic = await db.scalar(select(AbilityAtomic).where(AbilityAtomic.id == id))
    if not atomic:
        raise ValueError("原子能力不存在")

    await db.delete(atomic)
    await db.commit()


async def search_ability_atomic(db: AsyncSession, params: SearchAbilityAtomicSchema):
    """搜索原子能力（支持多条件筛选）"""
    stmt = select(AbilityAtomic)
    if params.subject is not None:
        stmt = stmt.where(AbilityAtomic.subject == params.subject)
    if params.grade is not None:
        stmt = stmt.where(AbilityAtomic.grade == params.grade)
    if params.domain_code is not None:
        stmt = stmt.where(AbilityAtomic.domain_code == params.domain_code)
    stmt = stmt.order_by(AbilityAtomic.domain_code, AbilityAtomic.id)

    result = await db.scalars(stmt)
    atomics = result.all()
    return [AbilityAtomicSchema.model_validate(atomic) for atomic in atomics]


async def get_ability_atomic(db: AsyncSession, id: int):
    """获取原子能力详情"""
    atomic = await db.scalar(select(AbilityAtomic).where(AbilityAtomic.id == id))
    if not atomic:
        raise ValueError("原子能力不存在")
    return AbilityAtomicSchema.model_validate(atomic)


async def get_ability_atomics_by_domain(db: AsyncSession, domain_code: str, subject: Optional[str] = None):
    """按能力域查询原子能力"""
    stmt = select(AbilityAtomic).where(AbilityAtomic.domain_code == domain_code)
    if subject:
        stmt = stmt.where(AbilityAtomic.subject == subject)
    stmt = stmt.order_by(AbilityAtomic.sort_order, AbilityAtomic.id)

    result = await db.scalars(stmt)
    atomics = result.all()
    return [AbilityAtomicSchema.model_validate(atomic) for atomic in atomics]
