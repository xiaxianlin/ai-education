import uuid
from typing import List, Dict, Any
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from store.database.models import Question, Knowledge, CourseUnit, Textbook, UserSubject
from schema.user import QuestionRequestSchema, QuestionBatchSchema
from schema import QuestionSchema
from core import get_logger, task_queue


logger = get_logger("UserQuestionService")


class UserQuestionService:
    """用户问题服务"""

    @staticmethod
    async def get_questions(
        db: AsyncSession, user_id: str, params: QuestionRequestSchema
    ) -> QuestionBatchSchema:
        """获取问题（优先从数据库，不足时AI生成）"""

        # 1. 验证用户是否有权限访问指定科目
        await UserQuestionService._validate_user_access(db, user_id, params)

        # 2. 从数据库查询现有问题
        existing_questions = await UserQuestionService._query_existing_questions(db, params)

        from_database = len(existing_questions)
        generated = 0
        generation_task_id = None

        # 3. 如果问题不足，启动AI生成任务
        if from_database < params.count:
            needed_count = params.count - from_database
            generation_task_id = await UserQuestionService._start_generation_task(
                db, params, needed_count
            )
            generated = needed_count

        # 4. 返回现有问题（如果有生成任务，前端可以轮询获取新生成的问题）
        questions_data = [
            QuestionSchema.model_validate(q).model_dump()
            for q in existing_questions[: params.count]
        ]

        return QuestionBatchSchema(
            questions=questions_data,
            total=len(questions_data),
            from_database=from_database,
            generated=generated,
            generation_task_id=generation_task_id,
        )

    @staticmethod
    async def _validate_user_access(db: AsyncSession, user_id: str, params: QuestionRequestSchema):
        """验证用户访问权限"""
        if params.subject:
            # 检查用户是否订阅了该科目
            user_subject = await db.scalar(
                select(UserSubject).where(
                    UserSubject.user_id == user_id, UserSubject.subject == params.subject
                )
            )
            if not user_subject:
                raise ValueError(f"用户未订阅科目: {params.subject}")

    @staticmethod
    async def _query_existing_questions(
        db: AsyncSession, params: QuestionRequestSchema
    ) -> List[Question]:
        """查询现有问题"""
        stmt = select(Question).options(
            joinedload(Question.knowledge),
            joinedload(Question.course_unit),
            joinedload(Question.textbook),
        )

        # 构建查询条件
        conditions = []

        if params.subject:
            conditions.append(Question.subject == params.subject)

        if params.grade:
            conditions.append(Question.grade == params.grade)

        if params.knowledge_id:
            conditions.append(Question.knowledge_id == params.knowledge_id)

        if params.course_unit_id:
            conditions.append(Question.course_unit_id == params.course_unit_id)

        if params.textbook_id:
            conditions.append(Question.textbook_id == params.textbook_id)

        if params.question_type:
            conditions.append(Question.type == params.question_type)

        # 只返回状态正常的问题
        conditions.append(Question.status == 1)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        # 随机排序并限制数量
        stmt = stmt.order_by(func.random()).limit(params.count * 2)  # 多查询一些，给生成任务留余地

        result = await db.scalars(stmt)
        return list(result.unique().all())

    @staticmethod
    async def _start_generation_task(
        db: AsyncSession, params: QuestionRequestSchema, count: int
    ) -> str:
        """启动AI问题生成任务"""

        # 获取相关的知识点和单元内容
        knowledge_content = ""
        unit_content = ""

        if params.knowledge_id:
            knowledge = await db.scalar(
                select(Knowledge).where(Knowledge.id == params.knowledge_id)
            )
            if knowledge:
                knowledge_content = knowledge.content

        if params.course_unit_id:
            unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == params.course_unit_id))
            if unit:
                unit_content = unit.content
                if not knowledge_content:
                    knowledge_content = unit.content  # 如果没有具体知识点，使用单元内容

        # 如果还是没有内容，根据科目获取一些示例内容
        if not knowledge_content and params.subject:
            knowledge_content = f"{params.subject}相关基础知识点"

        # 生成任务ID
        task_id = str(uuid.uuid4())

        # 添加后台生成任务
        await task_queue.add_task(
            task_id=task_id,
            name=f"generate_questions_{params.subject}_{count}",
            func=UserQuestionService._generate_questions_task,
            params=params.model_dump(),
            knowledge_content=knowledge_content,
            unit_content=unit_content,
            count=count,
        )

        logger.info(f"Started question generation task {task_id}")
        return task_id

    @staticmethod
    async def _generate_questions_task(
        params: Dict[str, Any], knowledge_content: str, unit_content: str, count: int
    ):
        """AI问题生成后台任务"""
        from store.database import get_async_session
        from service.user.ai_question_generator import AIQuestionGenerator

        async with get_async_session() as db:
            try:
                generator = AIQuestionGenerator()

                # 生成问题
                generated_questions = await generator.generate_questions(
                    subject=params.get("subject", ""),
                    grade=params.get("grade", 1),
                    knowledge_content=knowledge_content,
                    unit_content=unit_content,
                    question_types=["单选", "填空", "解答"],
                    count=count,
                    difficulty=params.get("difficulty", "中等"),
                )

                # 保存到数据库
                for question_data in generated_questions:
                    question = Question(
                        id=str(uuid.uuid4()),
                        type=question_data.get("type", "解答"),
                        content=question_data.get("content", ""),
                        options=question_data.get("options"),
                        answer=question_data.get("answer", ""),
                        grade=params.get("grade"),
                        subject=params.get("subject"),
                        knowledge_id=params.get("knowledge_id"),
                        course_unit_id=params.get("course_unit_id"),
                        textbook_id=params.get("textbook_id"),
                        source="AI生成",
                        status=1,
                    )
                    db.add(question)

                await db.commit()
                logger.info(f"Generated and saved {len(generated_questions)} questions")

            except Exception as e:
                logger.error(f"Error generating questions: {str(e)}")
                raise

    @staticmethod
    async def get_generation_status(task_id: str) -> Dict[str, Any]:
        """获取问题生成任务状态"""
        return task_queue.get_task_status(task_id)
