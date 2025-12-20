from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
import json

from admin.schema import (
    SavePracticeSchema,
    SearchPracticeSchema,
    PracticeSchema,
    SavePracticeConfigSchema,
)
from shared.core.database import Practice
from shared.core.schema import SearchResultSchema


async def list_practices(
    db: AsyncSession, params: SearchPracticeSchema
) -> SearchResultSchema[PracticeSchema]:
    """列表查询练习"""
    query = select(Practice)

    if params.name:
        query = query.where(Practice.name.like(f"%{params.name}%"))
    if params.slug:
        query = query.where(Practice.slug.like(f"%{params.slug}%"))
    if params.type:
        query = query.where(Practice.type == params.type)
    if params.practice_type:
        query = query.where(Practice.practice_type == params.practice_type)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(Practice.id.desc())
        .offset((params.page - 1) * params.size)
        .limit(params.size)
    )

    items = []
    for item in result.all():
        items.append(
            PracticeSchema(
                id=item.id,
                name=item.name,
                slug=item.slug,
                icon=item.icon,
                description=item.description,
                type=item.type,
                practice_type=item.practice_type,
                config=json.loads(item.config) if item.config else {},
                create_time=item.create_time,
                update_time=item.update_time,
            )
        )

    return SearchResultSchema(total=total or 0, data=items)


async def get_practice(
    db: AsyncSession, id: int
) -> PracticeSchema:
    """获取练习详情"""
    practice = await db.scalar(
        select(Practice).where(Practice.id == id)
    )
    if not practice:
        raise ValueError("练习不存在")

    return PracticeSchema(
        id=practice.id,
        name=practice.name,
        slug=practice.slug,
        icon=practice.icon,
        description=practice.description,
        type=practice.type,
        practice_type=practice.practice_type,
        config=json.loads(practice.config) if practice.config else {},
        create_time=practice.create_time,
        update_time=practice.update_time,
    )


async def create_practice(
    db: AsyncSession, params: SavePracticeSchema
) -> int:
    """创建练习"""
    # 检查标识是否已存在
    existed = await db.scalar(
        select(Practice).where(Practice.slug == params.slug)
    )
    if existed:
        raise ValueError("练习标识已存在")

    # 如果是系统练习，检查 practice_type 是否已存在
    if params.type == "system" and params.practice_type:
        existed_system = await db.scalar(
            select(Practice).where(
                Practice.type == "system",
                Practice.practice_type == params.practice_type
            )
        )
        if existed_system:
            raise ValueError(f"系统练习类型 {params.practice_type} 已存在")

    practice = Practice(
        name=params.name,
        slug=params.slug,
        icon=params.icon,
        description=params.description,
        type=params.type,
        practice_type=params.practice_type,
        config=json.dumps(params.config, ensure_ascii=False),
    )
    db.add(practice)
    await db.commit()
    await db.refresh(practice)
    return practice.id


async def update_practice(
    db: AsyncSession, id: int, params: SavePracticeSchema
) -> dict:
    """更新练习"""
    practice = await db.scalar(
        select(Practice).where(Practice.id == id)
    )
    if not practice:
        raise ValueError("练习不存在")

    # 检查标识是否与其他记录冲突
    if params.slug != practice.slug:
        existed = await db.scalar(
            select(Practice).where(
                Practice.slug == params.slug,
                Practice.id != id
            )
        )
        if existed:
            raise ValueError("练习标识已存在")

    # 系统练习不允许修改类型和 practice_type
    if practice.type == "system":
        if params.type != "system" or params.practice_type != practice.practice_type:
            raise ValueError("系统练习不允许修改类型和练习类型")

    # 更新字段
    practice.name = params.name
    practice.slug = params.slug
    practice.icon = params.icon
    practice.description = params.description
    practice.type = params.type
    if params.type == "system":
        practice.practice_type = params.practice_type
    practice.config = json.dumps(params.config, ensure_ascii=False)

    await db.commit()
    return {"id": id}


async def update_practice_config(
    db: AsyncSession, id: int, params: SavePracticeConfigSchema
) -> dict:
    """更新练习配置"""
    practice = await db.scalar(
        select(Practice).where(Practice.id == id)
    )
    if not practice:
        raise ValueError("练习不存在")

    practice.config = json.dumps(params.config, ensure_ascii=False)
    await db.commit()
    return {"id": id}


async def delete_practice(db: AsyncSession, id: int) -> dict:
    """删除练习"""
    practice = await db.scalar(
        select(Practice).where(Practice.id == id)
    )
    if not practice:
        raise ValueError("练习不存在")

    # 系统练习不允许删除
    if practice.type == "system":
        raise ValueError("系统练习不允许删除")

    await db.execute(delete(Practice).where(Practice.id == id))
    await db.commit()
    return {"id": id}


async def list_available_practices(db: AsyncSession) -> list[PracticeSchema]:
    """获取可用的练习列表（系统+自定义）"""
    result = await db.scalars(
        select(Practice).order_by(Practice.type.desc(), Practice.id.asc())
    )
    
    items = []
    for item in result.all():
        items.append(
            PracticeSchema(
                id=item.id,
                name=item.name,
                slug=item.slug,
                icon=item.icon,
                description=item.description,
                type=item.type,
                practice_type=item.practice_type,
                config=json.loads(item.config) if item.config else {},
                create_time=item.create_time,
                update_time=item.update_time,
            )
        )
    
    return items
