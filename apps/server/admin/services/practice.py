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

    practice = Practice(
        name=params.name,
        slug=params.slug,
        icon=params.icon,
        description=params.description,
        type=params.type,
        practice_type=None,
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

    # 系统练习不允许修改类型
    if practice.type == "system":
        if params.type != "system":
            raise ValueError("系统练习不允许修改类型")

    # 更新字段
    practice.name = params.name
    practice.slug = params.slug
    practice.icon = params.icon
    practice.description = params.description
    practice.type = params.type
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
                config=json.loads(item.config) if item.config else {},
                create_time=item.create_time,
                update_time=item.update_time,
            )
        )
    
    return items


async def init_system_practices():
    """初始化系统练习"""
    from shared.core.database import AsyncSessionLocal
    from shared.core.logger import logger
    from shared.utils.time import now
    
    async with AsyncSessionLocal() as db:
        # 定义三个系统练习
        system_practices = [
            {
                "name": "日常练习",
                "slug": "daily_practice",
                "type": "system",
                "config": {"default": {"generate_count": 15, "recall_count": 0}},
            },
            {
                "name": "单元练习",
                "slug": "unit_practice",
                "type": "system",
                "config": {"default": {"generate_count": 15, "recall_count": 0}},
            },
            {
                "name": "综合评估",
                "slug": "assessment",
                "type": "system",
                "config": {"default": {"generate_count": 25, "recall_count": 0}},
            },
        ]
        
        for practice_data in system_practices:
            # 检查是否已存在
            existing = await db.scalar(
                select(Practice).where(Practice.slug == practice_data["slug"])
            )
            
            if existing is None:
                # 创建新的系统练习
                practice = Practice(
                    name=practice_data["name"],
                    slug=practice_data["slug"],
                    type=practice_data["type"],
                    practice_type=None,
                    config=json.dumps(practice_data["config"], ensure_ascii=False),
                    create_time=now(),
                    update_time=now(),
                )
                db.add(practice)
                logger.info(f"初始化系统练习: {practice_data['name']} ({practice_data['slug']})")
            else:
                logger.debug(f"系统练习已存在: {practice_data['name']} ({practice_data['slug']})")
        
        await db.commit()
