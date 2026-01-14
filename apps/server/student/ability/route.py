# -*- coding: utf-8 -*-
"""
学生端能力路由

提供学生查看能力列表的功能
"""
from admin.ability.schema import SearchAbilitySchema
from admin.ability.services import ability
from fastapi import APIRouter, Query
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

ability_router = APIRouter(prefix="/ability")


@ability_router.get(
    "/atomics",
    tags=["能力"],
    summary="获取能力列表",
    description="根据年级、学科获取能力列表",
)
async def get_ability_atomics(
    subject: str = Query(..., description="学科"),
    grade: int = Query(..., description="年级"),
    db: AsyncSession = Database,
):
    """获取能力列表"""
    # 只返回激活状态的能力
    params = SearchAbilitySchema(
        subject=subject,
        grade=grade,
    )

    # 获取所有匹配的能力
    abilities = await ability.search_ability(db, params)

    # 过滤掉未激活的，并确保学科匹配（双重保险）
    return [a for a in abilities if a.is_active == 1 and a.subject == subject]
