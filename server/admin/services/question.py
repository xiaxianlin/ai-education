import uuid
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload, noload
from sqlalchemy.ext.asyncio import AsyncSession
from store.database.models import Question, Knowledge, CourseUnit, Textbook
from util import time
from schema import (
    SearchResultSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
    QuestionSchema,
)


class QuestionService:

    async def create(db: AsyncSession, create: QuestionCreateSchema):
        """创建问题"""
        # 验证关联实体是否存在
        if create.knowledge_id:
            knowledge = await db.scalar(
                select(Knowledge).where(Knowledge.id == str(create.knowledge_id))
            )
            if not knowledge:
                raise ValueError("知识点不存在")

        if create.course_unit_id:
            course_unit = await db.scalar(
                select(CourseUnit).where(CourseUnit.id == create.course_unit_id)
            )
            if not course_unit:
                raise ValueError("课程单元不存在")

        if create.textbook_id:
            textbook = await db.scalar(select(Textbook).where(Textbook.id == create.textbook_id))
            if not textbook:
                raise ValueError("教材不存在")

        question = Question(
            id=str(uuid.uuid4()),
            type=create.type,
            content=create.content,
            options=create.options,
            answer=create.answer,
            grade=create.grade,
            subject=create.subject,
            source=create.source,
            knowledge_id=create.knowledge_id,
            course_unit_id=create.course_unit_id,
            textbook_id=create.textbook_id,
        )

        db.add(question)
        await db.commit()
        return question.id

    async def update(db: AsyncSession, question_id: str, update: QuestionUpdateSchema):
        """更新问题"""
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            raise ValueError("问题不存在")

        if update.type is not None:
            question.type = update.type
        if update.content is not None:
            question.content = update.content
        if update.options is not None:
            question.options = update.options
        if update.answer is not None:
            question.answer = update.answer
        if update.grade is not None:
            question.grade = str(update.grade)
        if update.subject is not None:
            question.subject = update.subject
        if update.knowledge_id is not None:
            question.knowledge_id = update.knowledge_id
        if update.course_unit_id is not None:
            question.course_unit_id = update.course_unit_id
        if update.textbook_id is not None:
            question.textbook_id = update.textbook_id
        if update.source is not None:
            question.source = update.source
        if update.status is not None:
            question.status = update.status

        question.update_time = time.now()
        await db.commit()

    async def delete(db: AsyncSession, question_id: str):
        """删除问题"""
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            raise ValueError("问题不存在")

        await db.delete(question)
        await db.commit()

    async def get_by_id(db: AsyncSession, question_id: str):
        """根据ID获取问题"""
        result = await db.execute(
            select(Question)
            .options(
                joinedload(Question.knowledge)
                .joinedload(Question.course_unit)
                .joinedload(Question.textbook)
            )
            .where(Question.id == question_id)
        )
        question = result.scalar_one_or_none()
        if not question:
            raise ValueError("问题不存在")
        return QuestionSchema.model_validate(question)

    async def get_by_knowledge(
        db: AsyncSession,
        knowledge_id: int,
        page: int = 1,
        size: int = 10,
    ):
        """根据知识点ID获取问题列表(全量获取)"""
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

    async def get_by_course_unit(
        db: AsyncSession,
        course_unit_id: int,
        page: int = 1,
        size: int = 10,
    ):
        """根据课程单元ID获取问题列表"""
        query = (
            select(Question)
            .options(
                noload(Question.textbook),
                noload(Question.course_unit),
                noload(Question.knowledge),
            )
            .where(
                Question.course_unit_id == course_unit_id,
                Question.status == 1,
            )
        )

        # 获取总数
        count_query = select(func.count(Question.id)).where(
            Question.course_unit_id == course_unit_id,
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

    async def get_by_textbook(db: AsyncSession, textbook_id: int, page: int = 1, size: int = 10):
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

    async def search(db: AsyncSession, search_data: QuestionSearchSchema):
        """搜索问题"""
        query = select(Question)

        conditions = []
        if search_data.keywords:
            conditions.append(Question.content.contains(search_data.keywords))
        if search_data.type:
            conditions.append(Question.type == search_data.type)
        if search_data.grade is not None:
            conditions.append(Question.grade == str(search_data.grade))
        if search_data.subject:
            conditions.append(Question.subject == search_data.subject)
        if search_data.knowledge_id is not None:
            conditions.append(Question.knowledge_id == search_data.knowledge_id)
        if search_data.course_unit_id is not None:
            conditions.append(Question.course_unit_id == search_data.course_unit_id)
        if search_data.source:
            conditions.append(Question.source == search_data.source)
        if search_data.status is not None:
            conditions.append(Question.status == search_data.status)

        if conditions:
            query = query.where(and_(*conditions))

        # 获取总数
        count_query = select(func.count(Question.id))
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total = await db.scalar(count_query) or 0

        # 分页查询
        offset = (search_data.current_page - 1) * search_data.page_size
        query = query.order_by(
            getattr(Question, search_data.sort, Question.create_time).desc()
            if search_data.order == "desc"
            else getattr(Question, search_data.sort, Question.create_time).asc()
        )
        query = query.offset(offset).limit(search_data.page_size)

        result = await db.scalars(query)

        return SearchResultSchema(
            total=total,
            data=[QuestionSchema.model_validate(question) for question in result.all()],
        )
