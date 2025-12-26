from __future__ import annotations

from shared.core.database import PracticePrompt, Prompt
from shared.core.schema import (
    PromptSchema,
    SearchResultSchema,
)
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import (
    PromptDetailSchema,
    SavePromptSchema,
    SearchPromptSchema,
)


async def list_prompts(db: AsyncSession, params: SearchPromptSchema) -> SearchResultSchema[PromptSchema]:
    """列表查询 Prompt"""

    query = select(Prompt)

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


async def get_prompt(db: AsyncSession, id: int) -> PromptDetailSchema:
    """获取 Prompt 详情"""

    prompt = await db.scalar(select(Prompt).where(Prompt.id == id))
    if not prompt:
        raise ValueError("Prompt 不存在")

    return PromptDetailSchema(
        id=prompt.id,
        name=prompt.name,
        slug=prompt.slug,
        type=prompt.type,
        description=prompt.description,
        template_content=prompt.template_content,
        negative_content=prompt.negative_content,
        model_params=prompt.model_params,
        create_time=prompt.create_time,
        update_time=prompt.update_time,
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
        template_content=params.template_content,
        negative_content=params.negative_content,
        model_params=params.model_params or {},
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return prompt.id


async def update_prompt(db: AsyncSession, id: int, params: SavePromptSchema) -> None:
    """更新 Prompt"""

    prompt = await db.scalar(select(Prompt).where(Prompt.id == id))
    if not prompt:
        raise ValueError("提示词不存在")

    # 更新 Prompt 字段
    if params.name is not None:
        prompt.name = params.name
    if params.slug is not None:
        prompt.slug = params.slug
    if params.type is not None:
        prompt.type = params.type
    if params.description is not None:
        prompt.description = params.description
    if params.template_content is not None:
        prompt.template_content = params.template_content
    if params.negative_content is not None:
        prompt.negative_content = params.negative_content
    if params.model_params is not None:
        prompt.model_params = params.model_params

    await db.commit()


async def delete_prompt(db: AsyncSession, id: int) -> None:
    """删除 Prompt"""
    prompt = await db.scalar(select(Prompt).where(Prompt.id == id))
    if not prompt:
        raise ValueError("提示词不存在")
    # 检查是否有关联的练习提示词
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.prompt_slug == prompt.slug))
    if practice_prompt:
        raise ValueError("提示词有关联的练习提示词，无法删除")

    try:
        await db.execute(delete(Prompt).where(Prompt.id == id))
        await db.commit()
    except Exception:
        db.rollback()
        raise ValueError("删除失败")
