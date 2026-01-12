"""
能力管理路由
"""

from typing import Optional

from fastapi import APIRouter, Depends
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    BatchUpdateAtomicSortOrderSchema,
    CreateAbilityAtomicSchema,
    CreateAbilityDomainSchema,
    SearchAbilityAtomicSchema,
    SearchAbilityDomainSchema,
    UpdateAbilityAtomicSchema,
    UpdateAbilityDomainSchema,
)
from .services import atomic, domain

ability_router = APIRouter(prefix="/ability", tags=["能力管理"])

# ======================== 能力域管理 ======================== #


@ability_router.post(
    "/domain",
    summary="创建能力域",
    description="在系统中创建新的能力域",
)
async def create_domain(
    params: CreateAbilityDomainSchema, db: AsyncSession = Database
):
    return await domain.create_domain(db, params)


@ability_router.patch(
    "/domain/{id}",
    summary="更新能力域",
    description="更新指定能力域的信息",
)
async def update_domain(
    id: int, params: UpdateAbilityDomainSchema, db: AsyncSession = Database
):
    await domain.update_domain(db, id, params)


@ability_router.delete(
    "/domain/{id}",
    summary="删除能力域",
    description="删除指定的能力域",
)
async def delete_domain(id: int, db: AsyncSession = Database):
    await domain.delete_domain(db, id)


@ability_router.get(
    "/domain/search",
    summary="搜索能力域",
    description="根据条件查询能力域列表（按科目）",
)
async def search_domain(
    params: SearchAbilityDomainSchema = Depends(), db: AsyncSession = Database
):
    return await domain.search_domain(db, params)


@ability_router.get(
    "/domain/{id}",
    summary="获取能力域详情",
    description="获取指定能力域的详细信息",
)
async def get_domain(id: int, db: AsyncSession = Database):
    return await domain.get_domain(db, id)


@ability_router.get(
    "/by-subject/{subject}",
    summary="根据科目获取能力数据",
    description="根据科目获取能力域及其下的原子能力（二级结构）",
)
async def get_abilities_by_subject(
    subject: str, db: AsyncSession = Database
):
    return await domain.get_domains_with_atomics_by_subject(db, subject)


# ======================== 原子能力管理 ======================== #


@ability_router.post(
    "/atomic",
    summary="创建原子能力",
    description="在系统中创建新的原子能力",
)
async def create_atomic(
    params: CreateAbilityAtomicSchema, db: AsyncSession = Database
):
    return await atomic.create_ability_atomic(db, params)


@ability_router.patch(
    "/atomic/batch-sort",
    summary="批量更新原子能力排序",
    description="批量更新原子能力的排序顺序",
)
async def batch_update_atomic_sort(
    params: BatchUpdateAtomicSortOrderSchema, db: AsyncSession = Database
):
    updated_count = await atomic.batch_update_atomic_sort_order(db, params.items)
    return {"message": "排序更新成功", "updated_count": updated_count}


@ability_router.patch(
    "/atomic/{id}",
    summary="更新原子能力",
    description="更新指定原子能力的信息",
)
async def update_atomic(
    id: int, params: UpdateAbilityAtomicSchema, db: AsyncSession = Database
):
    await atomic.update_ability_atomic(db, id, params)


@ability_router.delete(
    "/atomic/{id}",
    summary="删除原子能力",
    description="删除指定的原子能力",
)
async def delete_atomic(id: int, db: AsyncSession = Database):
    await atomic.delete_ability_atomic(db, id)


@ability_router.get(
    "/atomic/search",
    summary="搜索原子能力",
    description="根据条件查询原子能力列表（支持科目、年级、能力域筛选）",
)
async def search_atomic(
    params: SearchAbilityAtomicSchema = Depends(), db: AsyncSession = Database
):
    return await atomic.search_ability_atomic(db, params)


@ability_router.get(
    "/atomic/{id}",
    summary="获取原子能力详情",
    description="获取指定原子能力的详细信息",
)
async def get_atomic(id: int, db: AsyncSession = Database):
    return await atomic.get_ability_atomic(db, id)


@ability_router.get(
    "/atomic/by-domain/{domain_code}",
    summary="按能力域查询原子能力",
    description="获取指定能力域下的所有原子能力",
)
async def get_atomics_by_domain(
    domain_code: str,
    subject: Optional[str] = None,
    db: AsyncSession = Database,
):
    return await atomic.get_ability_atomics_by_domain(db, domain_code, subject)
