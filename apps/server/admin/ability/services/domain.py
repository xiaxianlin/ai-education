"""
能力域服务
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import AbilityAtomic, AbilityDomain
from shared.core.schema import AbilityDomainSchema

from ..schema import (
    CreateAbilityDomainSchema,
    SearchAbilityDomainSchema,
    UpdateAbilityDomainSchema,
)


async def create_domain(db: AsyncSession, data: CreateAbilityDomainSchema):
    """创建能力域（检查唯一性）"""
    subject = data.subject.strip()
    code = data.code.strip()

    # 检查唯一性
    exists_stmt = select(AbilityDomain).where(
        AbilityDomain.subject == subject, AbilityDomain.code == code
    )
    domain_exists = await db.scalar(exists_stmt)
    if domain_exists:
        raise ValueError("该科目下已存在相同代码的能力域")

    domain = AbilityDomain(
        subject=subject,
        code=code,
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        sort_order=data.sort_order,
    )
    db.add(domain)
    await db.commit()
    await db.refresh(domain)

    return domain.id


async def update_domain(
    db: AsyncSession, id: int, data: UpdateAbilityDomainSchema
):
    """更新能力域"""
    domain = await db.scalar(select(AbilityDomain).where(AbilityDomain.id == id))
    if not domain:
        raise ValueError("能力域不存在")

    if data.name is not None:
        domain.name = data.name.strip()
    if data.description is not None:
        domain.description = data.description.strip() if data.description else None
    if data.sort_order is not None:
        domain.sort_order = data.sort_order
    if data.is_active is not None:
        domain.is_active = data.is_active

    await db.commit()
    await db.refresh(domain)


async def delete_domain(db: AsyncSession, id: int):
    """删除能力域（检查是否有关联的原子能力）"""
    domain = await db.scalar(select(AbilityDomain).where(AbilityDomain.id == id))
    if not domain:
        raise ValueError("能力域不存在")

    # 检查是否有关联的原子能力
    atomic_stmt = select(AbilityAtomic).where(
        AbilityAtomic.domain_code == domain.code,
        AbilityAtomic.subject == domain.subject,
    )
    atomic_exists = await db.scalar(atomic_stmt)
    if atomic_exists:
        raise ValueError("该能力域下存在关联的原子能力，无法删除")

    await db.delete(domain)
    await db.commit()


async def search_domain(db: AsyncSession, params: SearchAbilityDomainSchema):
    """搜索能力域"""
    stmt = select(AbilityDomain)
    if params.subject:
        stmt = stmt.where(AbilityDomain.subject == params.subject)
    stmt = stmt.order_by(AbilityDomain.sort_order, AbilityDomain.id)

    result = await db.scalars(stmt)
    domains = result.all()
    return [AbilityDomainSchema.model_validate(domain) for domain in domains]


async def get_domain(db: AsyncSession, id: int):
    """获取能力域详情"""
    domain = await db.scalar(select(AbilityDomain).where(AbilityDomain.id == id))
    if not domain:
        raise ValueError("能力域不存在")
    return AbilityDomainSchema.model_validate(domain)
