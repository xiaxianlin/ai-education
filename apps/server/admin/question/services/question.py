"""
题目服务层
"""

import uuid
from typing import List, Optional, Tuple

from loguru import logger
from shared.core.database import Question
from shared.generation.question.service import (
    generate_question_resources as generate_resources,
)
from sqlalchemy import and_, cast, delete, func, select, String
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

    # 题目ID精确匹配
    if params.id:
        conditions.append(Question.id == params.id)

    # 题目名称（题干文本）模糊匹配
    if params.name:
        # 使用 JSON_EXTRACT 提取 content.stem.text 字段，然后进行模糊匹配
        # MySQL: JSON_EXTRACT(content, '$.stem.text') LIKE '%name%'
        # 注意：content.stem 可能是字符串或对象，需要兼容处理
        # 先尝试提取 content.stem.text，如果不存在则尝试 content.stem（字符串）
        stem_text = func.json_unquote(
            func.json_extract(Question.content, "$.stem.text")
        ) | func.json_unquote(func.json_extract(Question.content, "$.stem"))
        conditions.append(cast(stem_text, String).like(f"%{params.name}%"))

    if params.question_type_code:
        conditions.append(Question.question_type_code == params.question_type_code)

    if params.subject:
        conditions.append(Question.subject == params.subject)

    if params.grade:
        conditions.append(Question.grade == params.grade)

    if params.ability_code:
        conditions.append(Question.ability_code == params.ability_code)

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


async def count_questions_by_type(db: AsyncSession, question_type_code: str) -> int:
    """统计题型下的题目数量"""
    result = await db.execute(
        select(func.count(Question.id)).where(Question.question_type_code == question_type_code)
    )
    return result.scalar() or 0


# TODO: 题目使用统计功能（usage_count, correct_rate, avg_time_spent）
# 原字段已删除，如需保留，需要重新设计数据存储方案（可能使用单独的统计表）
# async def increment_usage_count(db: AsyncSession, id: str) -> None:
#     """增加题目使用次数"""
#     pass
#
# async def update_correct_rate(db: AsyncSession, id: str, correct_rate: str) -> None:
#     """更新题目正确率"""
#     pass


# TODO: 批量更新题目状态功能（is_active）
# 原字段已删除，如需保留，需要重新设计（可能使用软删除或状态字段）
# async def batch_update_questions(db: AsyncSession, ids: List[str], is_active: bool) -> int:
#     """批量更新题目状态"""
#     pass


async def generate_question_resources(db: AsyncSession, id: str):
    """生成题目资源

    根据题目的 resources 字段定义，生成所有需要的资源（图片、音频等）

    Args:
        db: 数据库会话
        id: 题目ID

    Raises:
        ValueError: 如果题目不存在或没有资源定义
    """
    # 获取题目对象
    result = await db.execute(select(Question).where(Question.id == id))
    question = result.scalar_one_or_none()

    if not question:
        logger.error(f"题目 {id} 不存在")
        raise ValueError(f"题目 {id} 不存在")

    # 从 content 字段中获取资源定义
    content = question.content or {}
    # 资源可能在 content.resource（单个）或 content.stem.resource 中
    resources = []
    if "resource" in content:
        resources.append(content["resource"])
    elif "stem" in content and isinstance(content["stem"], dict) and "resource" in content["stem"]:
        resources.append(content["stem"]["resource"])

    if not resources:
        logger.warning(f"题目 {id} 没有资源定义，跳过资源生成")
        return

    # 复用 shared 层的资源生成函数
    # 注意：需要适配新的 content 结构
    # TODO: 适配资源生成逻辑以支持新的 content 结构
    # new_resources = await generate_resources(question)
    # 
    # # 更新题目的 content 字段中的资源
    # if "resource" in content:
    #     content["resource"] = new_resources[0] if new_resources else None
    # elif "stem" in content and isinstance(content["stem"], dict):
    #     content["stem"]["resource"] = new_resources[0] if new_resources else None
    # 
    # question.content = content
    # flag_modified(question, "content")
    # await db.commit()
