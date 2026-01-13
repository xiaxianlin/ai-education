"""
原子能力服务
"""

from typing import List, Optional

from shared.core.database import AbilityAtomic, AbilityDomain
from shared.core.schema import AbilityAtomicSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import (
    AtomicSortOrderItem,
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
    if data.code is not None:
        atomic.code = data.code.strip()
    if data.description is not None:
        atomic.description = data.description.strip() if data.description else None
    if data.difficulty is not None:
        atomic.difficulty = data.difficulty
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


async def batch_delete_ability_atomics(db: AsyncSession, ids: List[int]) -> int:
    """批量删除原子能力"""
    if not ids:
        return 0

    # 使用 SQLAlchemy 2.0 风格的批量删除
    stmt = delete(AbilityAtomic).where(AbilityAtomic.id.in_(ids))
    result = await db.execute(stmt)
    await db.commit()

    return result.rowcount


async def search_ability_atomic(db: AsyncSession, params: SearchAbilityAtomicSchema):
    """搜索原子能力（支持多条件筛选）"""
    stmt = select(AbilityAtomic)
    if params.subject is not None:
        stmt = stmt.where(AbilityAtomic.subject == params.subject)
    if params.grade is not None:
        stmt = stmt.where(AbilityAtomic.grade == params.grade)
    if params.domain_code is not None:
        stmt = stmt.where(AbilityAtomic.domain_code == params.domain_code)
    stmt = stmt.order_by(AbilityAtomic.sort_order)

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


async def batch_update_atomic_sort_order(db: AsyncSession, items: List[AtomicSortOrderItem]) -> int:
    """批量更新原子能力排序"""
    if not items:
        return 0

    # 批量查询所有需要更新的原子能力
    ids = [item.id for item in items]
    stmt = select(AbilityAtomic).where(AbilityAtomic.id.in_(ids))
    result = await db.scalars(stmt)
    atomics = {atomic.id: atomic for atomic in result.all()}

    # 更新排序
    updated_count = 0
    for item in items:
        atomic_id = item.id
        sort_order = item.sort_order
        if atomic_id in atomics:
            atomics[atomic_id].sort_order = sort_order
            updated_count += 1

    await db.commit()
    return updated_count


async def export_ability_atomics_by_grade(
    db: AsyncSession, subject: str, grade: int, domain_code: str
) -> List[AbilityAtomicSchema]:
    """查询并导出指定年级的原子能力"""
    stmt = select(AbilityAtomic).where(
        AbilityAtomic.subject == subject,
        AbilityAtomic.grade == grade,
        AbilityAtomic.domain_code == domain_code,
    )
    stmt = stmt.order_by(AbilityAtomic.sort_order, AbilityAtomic.id)

    result = await db.scalars(stmt)
    atomics = result.all()
    return [AbilityAtomicSchema.model_validate(atomic) for atomic in atomics]


async def delete_atomics_by_grade(db: AsyncSession, subject: str, grade: int, domain_code: str) -> int:
    """删除指定能力域+年级的所有原子能力，返回删除的数量"""
    stmt = select(AbilityAtomic).where(
        AbilityAtomic.subject == subject,
        AbilityAtomic.grade == grade,
        AbilityAtomic.domain_code == domain_code,
    )
    result = await db.scalars(stmt)
    atomics = list(result.all())
    count = len(atomics)

    # 删除所有匹配的原子能力
    for atomic in atomics:
        await db.delete(atomic)

    await db.commit()
    return count


async def batch_create_ability_atomics(
    db: AsyncSession, atomic_data_list: List[CreateAbilityAtomicSchema]
) -> List[AbilityAtomic]:
    """批量创建原子能力"""
    atomics = []
    for atomic_data in atomic_data_list:
        subject = atomic_data.subject.strip()
        grade = atomic_data.grade
        code = atomic_data.code.strip()
        domain_code = atomic_data.domain_code.strip()

        # 检查能力域是否存在
        domain_stmt = select(AbilityDomain).where(AbilityDomain.subject == subject, AbilityDomain.code == domain_code)
        domain = await db.scalar(domain_stmt)
        if not domain:
            raise ValueError(f"能力域不存在: {subject}/{domain_code}")

        atomic = AbilityAtomic(
            subject=subject,
            grade=grade,
            domain_code=domain_code,
            code=code,
            name=atomic_data.name.strip(),
            description=atomic_data.description.strip() if atomic_data.description else None,
            difficulty=atomic_data.difficulty,
            sort_order=atomic_data.sort_order,
        )
        db.add(atomic)
        atomics.append(atomic)

    await db.commit()

    # 刷新所有对象以获取 ID
    for atomic in atomics:
        await db.refresh(atomic)

    return atomics
