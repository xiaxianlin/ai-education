from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload

from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from ai.question.resource import generate_question_audio as ai_generate_audio
from ai.question.resource import generate_question_image as ai_generate_image
from shared.core.database import Question, Unit
from shared.core.schema import QuestionSchema, SearchResultSchema


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
    if update.subtype is not None:
        question.subtype = update.subtype
    if update.content is not None:
        question.content = update.content
    if update.options is not None:
        question.options = update.options
    if update.answer is not None:
        question.answer = update.answer
    if update.difficulty is not None:
        question.difficulty = update.difficulty
    if update.resource_type is not None:
        question.resource_type = update.resource_type
    if update.resource_content is not None:
        question.resource_content = update.resource_content
    if update.knowledge is not None:
        question.knowledge = update.knowledge
    if update.unit_id is not None:
        question.unit_id = update.unit_id
    if update.textbook_id is not None:
        question.textbook_id = update.textbook_id

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
            joinedload(Question.unit).noload(Unit.textbook),
            joinedload(Question.textbook),
        )
        .where(Question.id == id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise ValueError("问题不存在")
    return QuestionSchema.model_validate(question)


async def query_question_by_knowledge(
    db: AsyncSession, knowledge: str, page: int, size: int
):
    """根据知识点获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.unit),
        )
        .where(Question.knowledge == knowledge)
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(Question.knowledge == knowledge)

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.id.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def search_question(db: AsyncSession, params: SearchQuestionSchema):
    """搜索问题"""
    query = select(Question).options(
        joinedload(Question.textbook),
        joinedload(Question.unit).noload(Unit.textbook),
    )

    conditions = []
    if params.question_id is not None:
        conditions.append(Question.id == params.question_id)
    if params.keywords:
        conditions.append(Question.content.contains(params.keywords))
    if params.type:
        conditions.append(Question.type == params.type)
    if params.grade is not None:
        conditions.append(Question.grade == params.grade)
    if params.subject:
        conditions.append(Question.subject == params.subject)
    if params.resource_type is not None:
        if params.resource_type == "":
            # 筛选无资源类型的题目（resource_type 为 None 或空字符串）
            conditions.append(
                or_(Question.resource_type.is_(None), Question.resource_type == "")
            )
        else:
            conditions.append(Question.resource_type == params.resource_type)
    if params.resource_generated is not None:
        if params.resource_generated:
            # 资源已生成：resource 不为空且不为空字符串
            conditions.append(
                and_(Question.resource.isnot(None), Question.resource != "")
            )
        else:
            # 资源未生成：resource 为空或空字符串
            conditions.append(or_(Question.resource.is_(None), Question.resource == ""))

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
        getattr(Question, params.sort, Question.id).desc()
        if params.order == "desc"
        else getattr(Question, params.sort, Question.id).asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def search_resource_questions(db: AsyncSession, params: SearchQuestionSchema):
    """搜索需要处理资源的问题 - 只查询 resource_type 不为空的数据"""
    query = select(Question).options(
        joinedload(Question.textbook),
        joinedload(Question.unit).noload(Unit.textbook),
    )

    # 确保只查询 resource_type 不为空的数据（不为 None 且不为空字符串）
    base_conditions = [
        and_(
            Question.resource_type.isnot(None),
            Question.resource_type != "",
            func.trim(Question.resource_type) != "",
        )
    ]
    conditions = base_conditions.copy()

    if params.question_id is not None:
        conditions.append(Question.id == params.question_id)
    if params.keywords:
        conditions.append(Question.content.contains(params.keywords))
    if params.type:
        conditions.append(Question.type == params.type)
    if params.grade is not None:
        conditions.append(Question.grade == params.grade)
    if params.subject:
        conditions.append(Question.subject == params.subject)
    if params.resource_type:
        conditions.append(Question.resource_type == params.resource_type)
    if params.resource_generated is not None:
        if params.resource_generated:
            conditions.append(
                and_(
                    Question.resource.isnot(None),
                    Question.resource != "",
                )
            )
        else:
            conditions.append(
                or_(
                    Question.resource.is_(None),
                    Question.resource == "",
                )
            )

    query = query.where(and_(*conditions))

    count_query = select(func.count(Question.id)).where(and_(*conditions))
    total = await db.scalar(count_query) or 0

    offset = (params.page - 1) * params.size
    order_field = getattr(Question, params.sort, Question.id)
    query = query.order_by(
        order_field.desc() if params.order == "desc" else order_field.asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def generate_question_image(db: AsyncSession, id: int):
    """为题目生成图片"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    # 调用 AI 服务生成图片
    resource_path = await ai_generate_image(question)

    # 更新数据库
    question.resource = resource_path
    await db.commit()


async def generate_question_audio(db: AsyncSession, id: int):
    """为题目生成语音"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    # 调用 AI 服务生成语音
    resource_path = await ai_generate_audio(question)

    # 更新数据库
    question.resource = resource_path
    await db.commit()
