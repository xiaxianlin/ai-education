from __future__ import annotations

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..schema import SavePracticePromptSchema, SearchPracticePromptSchema
from shared.core.database import PracticePrompt, Prompt, Practice
from shared.core.schema import SearchResultSchema, PracticePromptSchema


async def list_practice_prompts(db: AsyncSession, params: SearchPracticePromptSchema):
    """列表查询练习提示词关联"""

    query = select(PracticePrompt).options(joinedload(PracticePrompt.prompt))

    if params.subject:
        query = query.where(PracticePrompt.subject == params.subject)
    if params.grade:
        query = query.where(PracticePrompt.grade == params.grade)
    if params.practice_slug:
        query = query.where(PracticePrompt.practice_slug == params.practice_slug)
    if params.prompt_slug:
        like = f"%{params.prompt_slug}%"
        query = query.where(PracticePrompt.prompt_slug.like(like))

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(PracticePrompt.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PracticePromptSchema.model_validate(item) for item in result.all()],
    )


async def get_practice_prompt(db: AsyncSession, id: int):
    """获取练习提示词关联详情"""
    practice_prompt = await db.scalar(
        select(PracticePrompt).options(joinedload(PracticePrompt.prompt)).where(PracticePrompt.id == id)
    )
    if not practice_prompt:
        raise ValueError("关联不存在")

    return PracticePromptSchema.model_validate(practice_prompt)


async def create_practice_prompt(db: AsyncSession, params: SavePracticePromptSchema) -> int:
    """创建练习提示词关联"""
    # 检查提示词是否存在
    prompt = await db.scalar(select(Prompt).where(Prompt.slug == params.prompt_slug))
    if not prompt:
        raise ValueError("提示词不存在")

    # 检查练习是否存在
    practice = await db.scalar(select(Practice).where(Practice.slug == params.practice_slug))
    if not practice:
        raise ValueError("练习不存在")

    # 检查是否已存在相同的关联
    existed = await db.scalar(
        select(PracticePrompt).where(
            PracticePrompt.practice_slug == params.practice_slug,
            PracticePrompt.prompt_slug == params.prompt_slug,
            PracticePrompt.subject == params.subject,
            PracticePrompt.grade == params.grade,
        )
    )
    if existed:
        raise ValueError("该练习、提示词、科目、年级的关联已存在")

    practice_prompt = PracticePrompt(
        practice_slug=params.practice_slug,
        subject=params.subject,
        grade=params.grade,
        prompt_slug=params.prompt_slug,
    )
    db.add(practice_prompt)
    await db.commit()
    await db.refresh(practice_prompt)
    return practice_prompt.id


async def update_practice_prompt(db: AsyncSession, id: int, params: SavePracticePromptSchema):
    """更新练习提示词关联"""
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.id == id))
    if not practice_prompt:
        raise ValueError("关联不存在")

    # 更新字段
    practice_prompt.practice_slug = params.practice_slug
    practice_prompt.subject = params.subject
    practice_prompt.grade = params.grade
    practice_prompt.prompt_slug = params.prompt_slug

    await db.commit()


async def delete_practice_prompt(db: AsyncSession, id: int) -> dict:
    """删除练习提示词关联"""
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.id == id))
    if not practice_prompt:
        raise ValueError("关联不存在")

    await db.execute(delete(PracticePrompt).where(PracticePrompt.id == id))
    await db.commit()
