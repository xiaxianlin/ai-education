from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import SavePracticeSchema, SearchPracticeSchema, PracticeParameterSchema
from admin.data.practice import INIT_SYSTEM_PRACTICES
from shared.core.database import Practice, AsyncSessionLocal, PracticePrompt
from shared.core.schema import PracticeSchema, SearchResultSchema


async def init_system_practices():
    """初始化系统练习"""

    async with AsyncSessionLocal() as db:
        for practice_data in INIT_SYSTEM_PRACTICES:
            # 检查是否已存在
            practice = await db.scalar(select(Practice).where(Practice.slug == practice_data["slug"]))
            if not practice:
                practice = Practice(
                    name=practice_data["name"],
                    slug=practice_data["slug"],
                    icon=practice_data["icon"],
                    description=practice_data["description"],
                    type=practice_data["type"],
                    parameters=practice_data["parameters"],
                )
                db.add(practice)
        await db.commit()


async def list_practices(db: AsyncSession, params: SearchPracticeSchema) -> SearchResultSchema[PracticeSchema]:
    """列表查询练习"""
    query = select(Practice)

    if params.name:
        query = query.where(Practice.name.like(f"%{params.name}%"))
    if params.slug:
        query = query.where(Practice.slug == params.slug)
    if params.type:
        query = query.where(Practice.type == params.type)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(Practice.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PracticeSchema.model_validate(item) for item in result.all()],
    )


async def get_practice(db: AsyncSession, id: int) -> PracticeSchema:
    """获取练习详情"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    return PracticeSchema.model_validate(practice)


async def create_practice(db: AsyncSession, params: SavePracticeSchema) -> int:
    """创建练习"""
    # 检查标识是否已存在
    existed = await db.scalar(select(Practice).where(Practice.slug == params.slug))
    if existed:
        raise ValueError("练习标识已存在")

    practice = Practice(
        name=params.name,
        slug=params.slug,
        icon=params.icon,
        description=params.description,
        type=params.type,
        parameters=[],  # 初始化为空列表
    )
    db.add(practice)
    await db.commit()
    await db.refresh(practice)
    return practice.id


async def update_practice(db: AsyncSession, id: int, params: SavePracticeSchema):
    """更新练习"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    # 检查标识是否与其他记录冲突
    existed = await db.scalar(select(Practice).where(Practice.slug == params.slug, Practice.id != id))
    if existed:
        raise ValueError("练习标识已存在")

    # 更新字段
    practice.name = params.name
    practice.slug = params.slug
    practice.icon = params.icon
    practice.description = params.description
    practice.type = params.type

    await db.commit()


async def delete_practice(db: AsyncSession, id: int):
    """删除练习"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    # 系统练习不允许删除
    if practice.type == "system":
        raise ValueError("系统练习不允许删除")

    # 检查是否有关联的练习提示词
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.practice_slug == practice.slug))
    if practice_prompt:
        raise ValueError("练习有关联的练习提示词，无法删除")

    await db.execute(delete(Practice).where(Practice.id == id))
    await db.commit()


async def get_practice_parameters(db: AsyncSession, id: int) -> list[PracticeParameterSchema]:
    """获取练习参数列表"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    return [PracticeParameterSchema(**param) for param in practice.parameters]


async def save_practice_parameters(db: AsyncSession, id: int, parameters: list[dict]):
    """创建练习参数"""
    practice = await db.scalar(select(Practice).where(Practice.id == id))
    if not practice:
        raise ValueError("练习不存在")

    practice.parameters = [PracticeParameterSchema(**param) for param in parameters]
    await db.commit()
