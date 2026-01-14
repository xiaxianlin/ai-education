"""
能力服务
"""

from typing import List

from shared.core.database import Ability
from shared.core.schema import AbilitySchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import (
    CreateAbilitySchema,
    SearchAbilitySchema,
    UpdateAbilitySchema,
)


async def create_ability(db: AsyncSession, data: CreateAbilitySchema):
    """创建能力（检查唯一性）"""
    subject = data.subject.strip()
    grade = data.grade
    code = data.code.strip()

    # 检查唯一性
    exists_stmt = select(Ability).where(
        Ability.subject == subject,
        Ability.grade == grade,
        Ability.code == code,
    )
    ability_exists = await db.scalar(exists_stmt)
    if ability_exists:
        raise ValueError("该科目、年级下已存在相同代码的能力")

    ability = Ability(
        subject=subject,
        grade=grade,
        code=code,
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        difficulty=data.difficulty,
    )
    db.add(ability)
    await db.commit()
    await db.refresh(ability)

    return ability.id


async def update_ability(db: AsyncSession, id: int, data: UpdateAbilitySchema):
    """更新能力"""
    ability = await db.scalar(select(Ability).where(Ability.id == id))
    if not ability:
        raise ValueError("能力不存在")

    if data.name is not None:
        ability.name = data.name.strip()
    if data.code is not None:
        ability.code = data.code.strip()
    if data.description is not None:
        ability.description = data.description.strip() if data.description else None
    if data.difficulty is not None:
        ability.difficulty = data.difficulty
    if data.is_active is not None:
        ability.is_active = data.is_active

    await db.commit()
    await db.refresh(ability)


async def delete_ability(db: AsyncSession, id: int):
    """删除能力"""
    ability = await db.scalar(select(Ability).where(Ability.id == id))
    if not ability:
        raise ValueError("能力不存在")

    await db.delete(ability)
    await db.commit()


async def batch_delete_abilities(db: AsyncSession, ids: List[int]) -> int:
    """批量删除能力"""
    if not ids:
        return 0

    # 使用 SQLAlchemy 2.0 风格的批量删除
    stmt = delete(Ability).where(Ability.id.in_(ids))
    result = await db.execute(stmt)
    await db.commit()

    return result.rowcount


async def search_ability(db: AsyncSession, params: SearchAbilitySchema):
    """搜索能力（支持多条件筛选）"""
    stmt = select(Ability)
    if params.subject is not None:
        stmt = stmt.where(Ability.subject == params.subject)
    if params.grade is not None:
        stmt = stmt.where(Ability.grade == params.grade)
    stmt = stmt.order_by(Ability.id)

    result = await db.scalars(stmt)
    abilities = result.all()
    return [AbilitySchema.model_validate(ability) for ability in abilities]


async def get_ability(db: AsyncSession, id: int):
    """获取能力详情"""
    ability = await db.scalar(select(Ability).where(Ability.id == id))
    if not ability:
        raise ValueError("能力不存在")
    return AbilitySchema.model_validate(ability)


async def export_abilities_by_grade(db: AsyncSession, subject: str, grade: int) -> List[AbilitySchema]:
    """查询并导出指定年级的能力"""
    stmt = select(Ability).where(
        Ability.subject == subject,
        Ability.grade == grade,
    )
    stmt = stmt.order_by(Ability.id)

    result = await db.scalars(stmt)
    abilities = result.all()
    return [AbilitySchema.model_validate(ability) for ability in abilities]


async def delete_abilities_by_grade(db: AsyncSession, subject: str, grade: int) -> int:
    """删除指定学科+年级的所有能力，返回删除的数量"""
    stmt = select(Ability).where(
        Ability.subject == subject,
        Ability.grade == grade,
    )
    result = await db.scalars(stmt)
    abilities = list(result.all())
    count = len(abilities)

    # 删除所有匹配的能力
    for ability in abilities:
        await db.delete(ability)

    await db.commit()
    return count


async def batch_create_abilities(db: AsyncSession, ability_data_list: List[CreateAbilitySchema]) -> List[Ability]:
    """批量创建能力"""
    abilities = []
    for ability_data in ability_data_list:
        subject = ability_data.subject.strip()
        grade = ability_data.grade
        code = ability_data.code.strip()

        ability = Ability(
            subject=subject,
            grade=grade,
            code=code,
            name=ability_data.name.strip(),
            description=ability_data.description.strip() if ability_data.description else None,
            difficulty=ability_data.difficulty,
        )
        db.add(ability)
        abilities.append(ability)

    await db.commit()

    # 刷新所有对象以获取 ID
    for ability in abilities:
        await db.refresh(ability)

    return abilities
