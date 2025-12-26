from __future__ import annotations

from shared.core.database import QuestionType
from shared.core.schema import QuestionTypeSchema
from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import (
    CreateQuestionTypeSchema,
    SearchQuestionTypeSchema,
    UpdateQuestionTypeSchema,
)


async def create_question_type(db: AsyncSession, params: CreateQuestionTypeSchema):
    """创建题型"""
    # 检查是否已存在相同标题的题型（同一场景、科目、年级下）
    existing = await db.scalar(
        select(QuestionType).where(
            and_(
                QuestionType.title == params.title,
                QuestionType.scene == params.scene,
                QuestionType.subject == params.subject,
                QuestionType.grade == params.grade,
            )
        )
    )
    if existing:
        raise ValueError("该场景、年级、科目下已存在相同标题的题型")

    question_type = QuestionType(
        title=params.title,
        scene=params.scene,
        subject=params.subject,
        grade=params.grade,
        description=params.description,
        resource_type=params.resource_type,
        prompt=params.prompt,
    )
    db.add(question_type)
    await db.commit()
    await db.refresh(question_type)
    return question_type


async def update_question_type(db: AsyncSession, id: int, params: UpdateQuestionTypeSchema):
    """更新题型"""
    question_type = await db.scalar(select(QuestionType).where(QuestionType.id == id))
    if not question_type:
        raise ValueError("题型不存在")

    if params.title is not None:
        # 检查标题是否重复
        scene = params.scene if params.scene is not None else question_type.scene
        subject = question_type.subject
        grade = question_type.grade

        existing = await db.scalar(
            select(QuestionType).where(
                and_(
                    QuestionType.title == params.title,
                    QuestionType.scene == scene,
                    QuestionType.subject == subject,
                    QuestionType.grade == grade,
                    QuestionType.id != id,
                )
            )
        )
        if existing:
            raise ValueError("该场景、年级、科目下已存在相同标题的题型")
        question_type.title = params.title

    if params.scene is not None:
        # 检查场景变更后是否重复
        if params.title is None:
            title = question_type.title
        else:
            title = params.title

        existing = await db.scalar(
            select(QuestionType).where(
                and_(
                    QuestionType.title == title,
                    QuestionType.scene == params.scene,
                    QuestionType.subject == question_type.subject,
                    QuestionType.grade == question_type.grade,
                    QuestionType.id != id,
                )
            )
        )
        if existing:
            raise ValueError("该场景、年级、科目下已存在相同标题的题型")
        question_type.scene = params.scene

    if params.description is not None:
        question_type.description = params.description
    if params.resource_type is not None:
        question_type.resource_type = params.resource_type if params.resource_type else None
    if params.prompt is not None:
        question_type.prompt = params.prompt

    await db.commit()
    await db.refresh(question_type)
    return question_type


async def delete_question_type(db: AsyncSession, id: int):
    """删除题型"""
    question_type = await db.scalar(select(QuestionType).where(QuestionType.id == id))
    if not question_type:
        raise ValueError("题型不存在")

    await db.delete(question_type)
    await db.commit()


async def batch_delete_question_types(db: AsyncSession, ids: list[int]):
    """批量删除题型"""
    if not ids:
        raise ValueError("ID列表不能为空")

    # 检查所有题型是否存在
    question_types = await db.scalars(select(QuestionType).where(QuestionType.id.in_(ids)))
    existing_ids = {question_type.id for question_type in question_types.all()}

    # 检查是否有不存在的题型
    missing_ids = set(ids) - existing_ids
    if missing_ids:
        raise ValueError(f"题型不存在: {sorted(missing_ids)}")

    # 批量删除
    await db.execute(delete(QuestionType).where(QuestionType.id.in_(ids)))
    await db.commit()


async def get_question_type(db: AsyncSession, id: int):
    """获取题型详情"""
    question_type = await db.scalar(select(QuestionType).where(QuestionType.id == id))
    if not question_type:
        raise ValueError("题型不存在")
    return QuestionTypeSchema.model_validate(question_type)


async def search_question_types(db: AsyncSession, params: SearchQuestionTypeSchema):
    """搜索题型"""
    query = select(QuestionType)

    conditions = []
    if params.scene:
        conditions.append(QuestionType.scene == params.scene)
    if params.subject:
        conditions.append(QuestionType.subject == params.subject)
    if params.grade is not None:
        conditions.append(QuestionType.grade == params.grade)

    if conditions:
        query = query.where(and_(*conditions))

    # 分页查询
    result = await db.scalars(query)

    return [QuestionTypeSchema.model_validate(item) for item in result.all()]
