from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload, noload
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from common.database import Question
from common.schema import QuestionSchema, SearchResultSchema
from utils.time import now


async def update_question(db: AsyncSession, id: str, update: UpdateQuestionSchema):
    """更新问题"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    if update.subject is not None:
        question.subject = update.subject
    if update.grade is not None:
        question.grade = update.grade
    if update.type is not None:
        question.type = update.type
    if update.content is not None:
        question.content = update.content
    if update.options is not None:
        question.options = update.options
    if update.answer is not None:
        question.answer = update.answer
    if update.knowledge_id is not None:
        question.knowledge_id = update.knowledge_id
    if update.unit_id is not None:
        question.unit_id = update.unit_id
    if update.textbook_id is not None:
        question.textbook_id = update.textbook_id
    if update.status is not None:
        question.status = update.status

    question.update_time = now()
    await db.commit()


async def delete_question(db: AsyncSession, id: str):
    """删除问题"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    await db.delete(question)
    await db.commit()


async def get_question(db: AsyncSession, id: str):
    """根据ID获取问题"""
    result = await db.execute(
        select(Question)
        .options(
            joinedload(Question.knowledge)
            .joinedload(Question.course_unit)
            .joinedload(Question.textbook)
        )
        .where(Question.id == id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise ValueError("问题不存在")
    return QuestionSchema.model_validate(question)


async def query_question_by_knowledge(db: AsyncSession, knowledge_id: int, page: int, size: int):
    """根据知识点ID获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.course_unit),
            noload(Question.knowledge),
        )
        .where(
            Question.knowledge_id == knowledge_id,
            Question.status == 1,
        )
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.knowledge_id == knowledge_id,
        Question.status == 1,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def query_question_by_unit(db: AsyncSession, unit_id: int, page: int = 1, size: int = 10):
    """根据课程单元ID获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.course_unit),
            noload(Question.knowledge),
        )
        .where(
            Question.unit_id == unit_id,
            Question.status == 1,
        )
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.unit_id == unit_id,
        Question.status == 1,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def query_question_by_textbook(
    db: AsyncSession, textbook_id: int, page: int = 1, size: int = 10
):
    """根据教材获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.course_unit),
            noload(Question.knowledge),
        )
        .where(
            Question.textbook_id == textbook_id,
            Question.status == 1,
        )
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.textbook_id == textbook_id,
        Question.status == 1,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def search_question(db: AsyncSession, params: SearchQuestionSchema):
    """搜索问题"""
    query = select(Question)

    conditions = []
    if params.keywords:
        conditions.append(Question.content.contains(params.keywords))
    if params.type:
        conditions.append(Question.type == params.type)
    if params.grade is not None:
        conditions.append(Question.grade == params.grade)
    if params.subject:
        conditions.append(Question.subject == params.subject)

    if len(conditions) > 0:
        query = query.where(and_(*conditions))

    # 获取总数
    count_query = select(func.count(Question.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(
        getattr(Question, params.sort, Question.create_time).desc()
        if params.order == "desc"
        else getattr(Question, params.sort, Question.create_time).asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )
