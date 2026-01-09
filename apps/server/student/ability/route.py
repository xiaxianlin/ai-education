# -*- coding: utf-8 -*-
"""
学生端原子能力路由

提供学生查看原子能力列表的功能
"""
from admin.ability.schema import SearchAbilityAtomicSchema
from admin.ability.services import atomic
from fastapi import APIRouter, Query
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

ability_router = APIRouter(prefix="/ability")


@ability_router.get(
    "/atomics",
    tags=["原子能力"],
    summary="获取原子能力列表",
    description="根据年级、学科获取原子能力列表",
)
async def get_ability_atomics(
    subject: str = Query(..., description="学科"),
    grade: int = Query(..., description="年级"),
    db: AsyncSession = Database,
):
    """获取原子能力列表"""
    # 只返回激活状态的原子能力
    params = SearchAbilityAtomicSchema(
        subject=subject,
        grade=grade,
    )

    # 获取所有匹配的原子能力
    atomics = await atomic.search_ability_atomic(db, params)

    # 过滤掉未激活的，并确保学科匹配（双重保险）
    return [a for a in atomics if a.is_active == 1 and a.subject == subject]
