"""
题目服务层
"""

import uuid
from typing import List, Optional, Tuple

from loguru import logger
from shared.core.database import Question
from shared.generation import (
    invoke_question_audio_workflow,
    invoke_question_image_workflow,
)
from sqlalchemy import and_, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from admin.question.schema import (
    QuestionCreateSchema,
    QuestionSearchSchema,
    QuestionUpdateSchema,
)


def generate_question_id() -> str:
    """生成题目ID"""
    return str(uuid.uuid4())


async def create_question(db: AsyncSession, params: QuestionCreateSchema) -> Question:
    """创建题目"""
    data = params.model_dump()

    # 如果没有传ID，自动生成
    if not data.get("id"):
        data["id"] = generate_question_id()

    question = Question(**data)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


async def create_questions_batch(db: AsyncSession, questions: List[QuestionCreateSchema]) -> List[Question]:
    """批量创建题目"""
    created = []
    for params in questions:
        data = params.model_dump()
        if not data.get("id"):
            data["id"] = generate_question_id()
        question = Question(**data)
        db.add(question)
        created.append(question)

    await db.commit()

    for q in created:
        await db.refresh(q)

    return created


async def update_question(db: AsyncSession, id: str, params: QuestionUpdateSchema) -> Question:
    """更新题目"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        raise ValueError(f"题目 {id} 不存在")

    update_data = params.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)

    await db.commit()
    await db.refresh(question)
    return question


async def delete_question(db: AsyncSession, id: str) -> None:
    """删除题目"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        raise ValueError(f"题目 {id} 不存在")

    await db.delete(question)
    await db.commit()


async def delete_questions_batch(db: AsyncSession, ids: List[str]) -> int:
    """批量删除题目"""
    if not ids:
        return 0

    # 使用 SQLAlchemy 2.0 风格的批量删除
    stmt = delete(Question).where(Question.id.in_(ids))
    result = await db.execute(stmt)
    await db.commit()

    return result.rowcount


async def get_question(db: AsyncSession, id: str) -> Optional[Question]:
    """获取题目详情"""
    result = await db.execute(select(Question).where(Question.id == id))
    return result.scalar_one_or_none()


async def search_questions(db: AsyncSession, params: QuestionSearchSchema) -> Tuple[List[Question], int]:
    """搜索题目，返回列表和总数"""
    conditions = []

    if params.question_type_id:
        conditions.append(Question.question_type_id == params.question_type_id)

    if params.question_type_code:
        conditions.append(Question.question_type_code == params.question_type_code)

    if params.subject:
        conditions.append(Question.subject == params.subject)

    if params.grade:
        conditions.append(Question.grade == params.grade)

    if params.stage:
        conditions.append(Question.stage == params.stage)

    if params.difficulty:
        conditions.append(Question.difficulty == params.difficulty)

    if params.cognitive_level:
        conditions.append(Question.cognitive_level == params.cognitive_level)

    if params.source:
        conditions.append(Question.source == params.source)

    if params.is_active is not None:
        conditions.append(Question.is_active == params.is_active)

    # 构建基础查询
    base_query = select(Question)
    count_query = select(func.count(Question.id))

    if conditions:
        base_query = base_query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))

    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页查询
    page = params.page or 1
    size = params.size or 10
    offset = (page - 1) * size
    query = base_query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.execute(query)
    questions = list(result.scalars().all())

    return questions, total


async def get_questions_by_ids(db: AsyncSession, ids: List[str]) -> List[Question]:
    """根据ID列表获取题目"""
    if not ids:
        return []

    result = await db.execute(select(Question).where(Question.id.in_(ids)))
    return list(result.scalars().all())


async def count_questions_by_type(db: AsyncSession, question_type_id: int) -> int:
    """统计题型下的题目数量"""
    result = await db.execute(select(func.count(Question.id)).where(Question.question_type_id == question_type_id))
    return result.scalar() or 0


async def increment_usage_count(db: AsyncSession, id: str) -> None:
    """增加题目使用次数"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if question:
        question.usage_count = (question.usage_count or 0) + 1
        await db.commit()


async def update_correct_rate(db: AsyncSession, id: str, correct_rate: str) -> None:
    """更新题目正确率"""
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if question:
        question.correct_rate = correct_rate
        await db.commit()


async def batch_update_questions(db: AsyncSession, ids: List[str], is_active: bool) -> int:
    """批量更新题目状态"""
    if not ids:
        return 0

    # 批量更新题目状态
    result = await db.execute(select(Question).where(Question.id.in_(ids)))
    questions = list(result.scalars().all())

    for q in questions:
        q.is_active = is_active

    await db.commit()
    return len(questions)


async def generate_question_resources(db: AsyncSession, id: str):
    """生成题目资源

    根据题目的 resources 字段定义，生成所有需要的资源（图片、音频等）

    Args:
        db: 数据库会话
        id: 题目ID
    """

    # 获取题目对象
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        logger.error(f"题目 {id} 不存在")
        raise ValueError(f"题目 {id} 不存在")

    # 如果没有资源定义，直接返回
    if not question.resources:
        logger.error(f"题目 {id} 没有资源定义")
        raise ValueError(f"题目 {id} 没有资源定义")

    new_resources = []
    for resource in question.resources:
        resource_path = f"question/{question.id}/{resource['resource_type']}"
        new_resource = dict(resource)  # 创建新字典对象，避免修改原对象

        if resource["type"] == "image" and resource["image_prompt"]:
            oss_path = f"{resource_path}/{resource['id']}.png"
            await invoke_question_image_workflow(prompt=resource["image_prompt"], oss_path=oss_path)
            new_resource["url"] = oss_path

        elif resource["type"] == "audio" and resource["text"]:
            oss_path = f"{resource_path}/{resource['id']}.mp3"
            language = "Chinese" if question.subject == "英语" else "English"
            await invoke_question_audio_workflow(text=resource["text"], language=language, oss_path=oss_path)
            new_resource["url"] = oss_path

        new_resources.append(new_resource)

    question.resources = new_resources
    flag_modified(question, "resources")  # 显式标记字段已修改
    await db.commit()
