from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload

from admin.schema import (
    SavePromptSchema,
    PromptDetailSchema,
)
from shared.core.database import Prompt, PromptVersion, PracticePrompt
from shared.core.schema import (
    PromptSchema,
    PromptVersionSchema,
    SearchResultSchema,
)
from admin.schema import SearchPromptSchema, SearchPromptVersionSchema


async def list_prompts(db: AsyncSession, params: SearchPromptSchema) -> SearchResultSchema[PromptSchema]:
    """列表查询 Prompt"""

    query = select(Prompt).options(joinedload(Prompt.version))

    if params.name:
        like = f"%{params.name}%"
        query = query.where(Prompt.name.like(like))
    if params.type:
        query = query.where(Prompt.type == params.type)
    if params.slug:
        query = query.where(Prompt.slug == params.slug)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(Prompt.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PromptSchema.model_validate(p) for p in result.all()],
    )


async def list_versions(db: AsyncSession, params: SearchPromptVersionSchema) -> SearchResultSchema[PromptVersionSchema]:
    """列表查询 Prompt 版本"""

    query = (
        select(PromptVersion).options(noload(PromptVersion.prompt)).where(PromptVersion.prompt_id == params.prompt_id)
    )

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    result = await db.scalars(
        query.order_by(PromptVersion.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PromptVersionSchema.model_validate(v) for v in result.all()],
    )


async def get_prompt(db: AsyncSession, version_id: int) -> PromptDetailSchema:
    """获取 Prompt 详情"""

    version = await db.scalar(
        select(PromptVersion).options(joinedload(PromptVersion.prompt)).where(PromptVersion.id == version_id)
    )
    if not version or not version.prompt:
        raise ValueError("Prompt 不存在")

    prompt = version.prompt

    return PromptDetailSchema(
        id=prompt.id,
        name=prompt.name,
        slug=prompt.slug,
        type=prompt.type,
        description=prompt.description,
        last_version_id=prompt.current_version_id,
        version_id=version.id,
        template_content=version.template_content,
        negative_content=version.negative_content,
        model_params=version.model_params,
        changelog=version.changelog,
        is_published=version.is_published,
        create_time=version.create_time,
        update_time=version.update_time,
    )


async def create_prompt(db: AsyncSession, params: SavePromptSchema) -> int:
    """创建 Prompt"""
    existed = await db.scalar(select(Prompt).where(Prompt.slug == params.slug))
    if existed:
        raise ValueError("slug 已存在")

    prompt = Prompt(
        name=params.name,
        slug=params.slug,
        type=params.type,
        description=params.description,
        current_version_id=0,
    )
    db.add(prompt)
    await db.flush()

    # 创建第一个版本
    version = PromptVersion(
        prompt_id=prompt.id,
        template_content=params.template_content,
        negative_content=params.negative_content,
        model_params=params.model_params or {},
        is_published=1,
        changelog="初始版本",
    )
    db.add(version)
    await db.flush()

    # 设置为当前版本（但不发布）
    prompt.current_version_id = version.id

    await db.commit()
    await db.refresh(prompt)
    return prompt.id


async def update_prompt(db: AsyncSession, version_id: int, params: SavePromptSchema) -> dict:
    """
    根据 id 和 version_id 更新 Prompt
    - 未发布的版本能直接编辑
    - 最后一个已发布的版本可以编辑，编辑后生成新的版本
    """

    # 获取版本和关联的Prompt
    version = await db.scalar(
        select(PromptVersion).options(joinedload(PromptVersion.prompt)).where(PromptVersion.id == version_id)
    )
    if not version or not version.prompt:
        raise ValueError("提示词或版本不存在")

    if version.is_published == 1 and version.prompt.current_version_id != version.id:
        raise ValueError("只能编辑最后一个已发布的版本，请选择最新的已发布版本进行编辑")

    prompt = version.prompt

    # 更新 Prompt 基本信息（这些字段对所有版本都是共享的）
    if params.name is not None:
        prompt.name = params.name
    if params.slug is not None:
        prompt.slug = params.slug
    if params.type is not None:
        prompt.type = params.type
    if params.description is not None:
        prompt.description = params.description

    # 根据版本的发布状态选择不同的编辑策略
    if version.is_published == 0:
        # 未发布版本：直接编辑
        if params.template_content is not None:
            version.template_content = params.template_content
        if params.negative_content is not None:
            version.negative_content = params.negative_content
        if params.model_params is not None:
            version.model_params = params.model_params

        await db.commit()

    else:
        new_version = PromptVersion(
            prompt_id=prompt.id,
            template_content=params.template_content,
            negative_content=params.negative_content,
            model_params=params.model_params or {},
            is_published=1,
            changelog=f"编辑版本: {version.id}",
        )
        db.add(new_version)
        await db.flush()

        # 更新Prompt的当前版本ID
        prompt.current_version_id = new_version.id

        await db.commit()


async def delete_prompt(db: AsyncSession, id: int) -> PromptSchema:
    """删除 Prompt"""
    prompt = await db.scalar(select(Prompt).where(Prompt.id == id))
    if not prompt:
        raise ValueError("提示词不存在")
    # 检查是否有关联的练习提示词
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.prompt_slug == prompt.slug))
    if practice_prompt:
        raise ValueError("提示词有关联的练习提示词，无法删除")

    try:
        await db.execute(delete(PromptVersion).where(PromptVersion.prompt_id == id))
        await db.execute(delete(Prompt).where(Prompt.id == id))
        await db.commit()
    except Exception:
        db.rollback()
        raise ValueError("删除失败")


async def publish_prompt(db: AsyncSession, version_id: int, changelog: str) -> PromptSchema:
    """根据版本 ID 发布 Prompt"""
    version = await db.scalar(select(PromptVersion).where(PromptVersion.id == version_id))
    if not version:
        raise ValueError("版本不存在")

    version.is_published = 1
    version.changelog = changelog

    await db.commit()
