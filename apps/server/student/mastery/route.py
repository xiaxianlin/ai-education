# -*- coding: utf-8 -*-
"""
学生端掌握度路由

提供学生查看能力掌握度的功能
"""
from typing import Optional

from fastapi import APIRouter, Query, Request
from shared.core.database import Ability, Database, StudentAbilityMastery
from shared.core.schema import (
    MasterySummarySchema,
    StudentAbilityMasterySchema,
    StudentAbilityMasteryWithInfoSchema,
)
from shared.practice.mastery import (
    get_weak_abilities,
)
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession


mastery_router = APIRouter(prefix="/mastery")


@mastery_router.get(
    "/list",
    tags=["掌握度"],
    summary="获取能力掌握度列表",
    description="获取当前学生的能力掌握度列表，可按科目和年级筛选",
)
async def get_mastery_list(
    request: Request,
    subject: Optional[str] = Query(None, description="科目"),
    grade: Optional[int] = Query(None, description="年级"),
    db: AsyncSession = Database,
) -> list[StudentAbilityMasteryWithInfoSchema]:
    """获取学生能力掌握度列表"""
    student = request.state.student

    # 查询掌握度，关联能力信息
    query = (
        select(
            StudentAbilityMastery,
            Ability.name.label("ability_name"),
            Ability.subject,
            Ability.grade,
        )
        .outerjoin(
            Ability,
            StudentAbilityMastery.ability_code == Ability.code,
        )
        .where(StudentAbilityMastery.student_id == student.id)
    )

    if subject:
        query = query.where(Ability.subject == subject)
    if grade:
        query = query.where(Ability.grade == grade)

    query = query.order_by(StudentAbilityMastery.mastery_score.asc())

    result = await db.execute(query)
    rows = result.all()

    return [
        StudentAbilityMasteryWithInfoSchema(
            **StudentAbilityMasterySchema.model_validate(row[0]).model_dump(),
            ability_name=row.ability_name,
            subject=row.subject,
            grade=row.grade,
        )
        for row in rows
    ]


@mastery_router.get(
    "/weak",
    tags=["掌握度"],
    summary="获取薄弱能力推荐",
    description="获取掌握度低于阈值的能力，用于补弱推荐",
)
async def get_weak_ability_list(
    request: Request,
    threshold: float = Query(60.0, description="阈值，低于此分数视为薄弱"),
    limit: int = Query(5, description="返回数量", ge=1, le=20),
    db: AsyncSession = Database,
) -> list[StudentAbilityMasterySchema]:
    """获取薄弱能力列表"""
    student = request.state.student
    records = await get_weak_abilities(db, student.id, threshold, limit)
    return [StudentAbilityMasterySchema.model_validate(r) for r in records]


@mastery_router.get(
    "/summary",
    tags=["掌握度"],
    summary="获取能力掌握度概览",
    description="获取学生能力掌握度的整体概览",
)
async def get_mastery_summary(
    request: Request,
    db: AsyncSession = Database,
) -> MasterySummarySchema:
    """获取能力掌握度概览"""
    student = request.state.student

    # 1. 统计总体数据
    total_query = select(
        func.count(StudentAbilityMastery.id).label("total"),
        func.avg(StudentAbilityMastery.mastery_score).label("avg_score"),
    ).where(StudentAbilityMastery.student_id == student.id)
    total_result = await db.execute(total_query)
    total_row = total_result.first()

    total_abilities = total_row.total if total_row else 0
    avg_score = round(float(total_row.avg_score or 0), 2) if total_row else 0

    # 2. 统计等级分布
    level_query = (
        select(
            StudentAbilityMastery.mastery_level,
            func.count(StudentAbilityMastery.id).label("count"),
        )
        .where(StudentAbilityMastery.student_id == student.id)
        .group_by(StudentAbilityMastery.mastery_level)
    )
    level_result = await db.execute(level_query)
    level_distribution = {row.mastery_level: row.count for row in level_result.all()}

    return MasterySummarySchema(
        total_abilities=total_abilities,
        practiced_abilities=total_abilities,  # 已有记录的都是练习过的
        avg_mastery_score=avg_score,
        level_distribution=level_distribution,
    )
