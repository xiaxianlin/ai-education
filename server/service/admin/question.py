from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from store.database.models import Question, Knowledge, CourseUnit, Textbook
from schema.admin import QuestionCreateSchema, QuestionUpdateSchema, QuestionSearchSchema
from util import time
import uuid


class QuestionService:

    @staticmethod
    async def create(db: AsyncSession, question_data: QuestionCreateSchema) -> Question:
        """创建问题"""
        # 验证关联实体是否存在
        if question_data.knowledge_id:
            knowledge = await db.scalar(
                select(Knowledge).where(Knowledge.id == str(question_data.knowledge_id))
            )
            if not knowledge:
                raise ValueError("知识点不存在")

        if question_data.course_unit_id:
            course_unit = await db.scalar(
                select(CourseUnit).where(CourseUnit.id == question_data.course_unit_id)
            )
            if not course_unit:
                raise ValueError("课程单元不存在")

        if question_data.booktext_id:
            textbook = await db.scalar(
                select(Textbook).where(Textbook.id == question_data.booktext_id)
            )
            if not textbook:
                raise ValueError("教材不存在")

        question = Question(
            id=str(uuid.uuid4()),
            type=question_data.type,
            content=question_data.content,
            options=question_data.options,
            answer=question_data.answer,
            grade=str(question_data.grade),
            subject=question_data.subject,
            source=question_data.source,
            knowledge_id=question_data.knowledge_id,
            course_unit_id=question_data.course_unit_id,
            booktext_id=question_data.booktext_id,
            status=1,
            create_time=time.now(),
        )

        db.add(question)
        await db.commit()
        await db.refresh(question)
        return question

    @staticmethod
    async def get_by_id(db: AsyncSession, question_id: str) -> Optional[Question]:
        """根据ID获取问题"""
        return await db.scalar(select(Question).where(Question.id == question_id))

    @staticmethod
    async def get_by_knowledge(
        db: AsyncSession, knowledge_id: int, status: Optional[int] = None
    ) -> List[Question]:
        """根据知识点ID获取问题列表(全量获取)"""
        query = select(Question).where(Question.knowledge_id == knowledge_id)

        if status is not None:
            query = query.where(Question.status == status)

        query = query.order_by(Question.create_time.desc())

        result = await db.execute(query)
        questions = result.scalars().all()

        return list(questions)

    @staticmethod
    async def get_by_course_unit(
        db: AsyncSession,
        course_unit_id: int,
        page: int = 1,
        size: int = 10,
        status: Optional[int] = None,
    ) -> Tuple[List[Question], int]:
        """根据课程单元ID获取问题列表"""
        query = select(Question).where(Question.course_unit_id == course_unit_id)

        if status is not None:
            query = query.where(Question.status == status)

        # 获取总数
        count_query = select(func.count(Question.id)).where(
            Question.course_unit_id == course_unit_id
        )
        if status is not None:
            count_query = count_query.where(Question.status == status)

        total = await db.scalar(count_query) or 0

        # 分页查询
        offset = (page - 1) * size
        query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

        result = await db.execute(query)
        questions = result.scalars().all()

        return list(questions), total

    @staticmethod
    async def update(
        db: AsyncSession, question_id: str, question_data: QuestionUpdateSchema
    ) -> Optional[Question]:
        """更新问题"""
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            return None

        if question_data.type is not None:
            question.type = question_data.type
        if question_data.content is not None:
            question.content = question_data.content
        if question_data.options is not None:
            question.options = question_data.options
        if question_data.answer is not None:
            question.answer = question_data.answer
        if question_data.grade is not None:
            question.grade = str(question_data.grade)
        if question_data.subject is not None:
            question.subject = question_data.subject
        if question_data.knowledge_id is not None:
            question.knowledge_id = question_data.knowledge_id
        if question_data.course_unit_id is not None:
            question.course_unit_id = question_data.course_unit_id
        if question_data.booktext_id is not None:
            question.booktext_id = question_data.booktext_id
        if question_data.source is not None:
            question.source = question_data.source
        if question_data.status is not None:
            question.status = question_data.status

        question.update_time = time.now()
        await db.commit()
        await db.refresh(question)
        return question

    @staticmethod
    async def delete(db: AsyncSession, question_id: str) -> bool:
        """删除问题"""
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            return False

        await db.delete(question)
        await db.commit()
        return True

    @staticmethod
    async def search(
        db: AsyncSession, search_data: QuestionSearchSchema
    ) -> Tuple[List[Question], int]:
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

        result = await db.execute(query)
        questions = result.scalars().all()

        return list(questions), total
