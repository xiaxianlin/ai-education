"""题目召回服务

本模块提供统一的题目召回服务，用于：
- 每日练习：从教材中召回历史题目，避免重复
- 单元练习：从指定单元中召回历史题目，避免重复
- 能力评估：从教材中召回历史题目，避免重复

召回策略：
- 基础策略：随机选择题目，保持题型多样性
- 未来可扩展：基于学生学习数据（错题、薄弱知识点）智能召回
"""

from typing import List, Optional
from sqlalchemy import select, func, and_, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question, PracticeAnswer, PracticeSession
from core.settings import envs


class RecallService:
    """题目召回服务"""

    @classmethod
    async def recall_for_daily_practice(
        cls,
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
    ) -> List[Question]:
        """为每日练习召回题目

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID

        Returns:
            题目列表

        Note:
            策略：从教材中随机选择题目，优先排除学生最近做过的题目
            召回数量从环境变量 QUESTION_RECALL_COUNT 读取
        """
        count = envs.QUESTION_RECALL_COUNT
        if count == 0:
            return []

        # 获取学生最近做过的题目ID（最近30次练习）
        recent_question_ids = await cls._get_recent_question_ids(
            db, student_id, textbook_id, limit=100
        )

        # 构建查询：排除最近做过的题目，随机选择
        stmt = (
            select(Question)
            .where(Question.textbook_id == textbook_id)
            .order_by(func.random())
            .limit(count)
        )

        # 如果有最近做过的题目，排除它们
        if recent_question_ids:
            stmt = stmt.where(~Question.id.in_(recent_question_ids))

        result = await db.execute(stmt)
        questions = result.scalars().all()

        # 如果排除后数量不足，补充随机题目
        if len(questions) < count:
            remaining_count = count - len(questions)
            existing_ids = [q.id for q in questions] + recent_question_ids

            additional_stmt = (
                select(Question)
                .where(
                    and_(
                        Question.textbook_id == textbook_id,
                        ~Question.id.in_(existing_ids) if existing_ids else True,
                    )
                )
                .order_by(func.random())
                .limit(remaining_count)
            )

            additional_result = await db.execute(additional_stmt)
            additional_questions = additional_result.scalars().all()
            questions.extend(additional_questions)

        logger.debug(
            f"每日练习召回题目: student_id={student_id}, textbook_id={textbook_id}, "
            f"召回数量={len(questions)}, 排除最近题目={len(recent_question_ids)}道"
        )

        return list(questions[:count])

    @classmethod
    async def recall_for_unit_practice(
        cls,
        db: AsyncSession,
        unit_id: int,
        student_id: Optional[str] = None,
    ) -> List[Question]:
        """为单元练习召回题目

        Args:
            db: 数据库会话
            unit_id: 单元ID
            student_id: 学生ID（可选，如果提供则排除该学生最近做过的题目）

        Returns:
            题目列表

        Note:
            策略：从指定单元随机选择题目，优先保持题型多样性
            召回数量从环境变量 QUESTION_RECALL_COUNT 读取
        """
        count = envs.QUESTION_RECALL_COUNT
        if count == 0:
            return []

        # 如果提供了学生ID，排除最近做过的题目
        recent_question_ids = []
        if student_id:
            # 获取单元对应的教材ID
            unit_stmt = select(Question.textbook_id).where(Question.unit_id == unit_id).limit(1)
            unit_result = await db.execute(unit_stmt)
            textbook_id = unit_result.scalar_one_or_none()

            if textbook_id:
                recent_question_ids = await cls._get_recent_question_ids(
                    db, student_id, textbook_id, unit_id=unit_id, limit=50
                )

        # 构建查询：从指定单元随机选择
        stmt = (
            select(Question)
            .where(Question.unit_id == unit_id)
            .order_by(func.random())
            .limit(count)
        )

        # 如果有最近做过的题目，排除它们
        if recent_question_ids:
            stmt = stmt.where(~Question.id.in_(recent_question_ids))

        result = await db.execute(stmt)
        questions = result.scalars().all()

        # 如果排除后数量不足，补充随机题目
        if len(questions) < count:
            remaining_count = count - len(questions)
            existing_ids = [q.id for q in questions] + recent_question_ids

            additional_stmt = (
                select(Question)
                .where(
                    and_(
                        Question.unit_id == unit_id,
                        ~Question.id.in_(existing_ids) if existing_ids else True,
                    )
                )
                .order_by(func.random())
                .limit(remaining_count)
            )

            additional_result = await db.execute(additional_stmt)
            additional_questions = additional_result.scalars().all()
            questions.extend(additional_questions)

        logger.debug(
            f"单元练习召回题目: unit_id={unit_id}, "
            f"召回数量={len(questions)}, 排除最近题目={len(recent_question_ids)}道"
        )

        return list(questions[:count])

    @classmethod
    async def recall_for_assessment(
        cls,
        db: AsyncSession,
        textbook_id: int,
        student_id: Optional[str] = None,
    ) -> List[Question]:
        """为能力评估召回题目

        Args:
            db: 数据库会话
            textbook_id: 教材ID
            student_id: 学生ID（可选，如果提供则排除该学生最近做过的题目）

        Returns:
            题目列表

        Note:
            策略：从指定教材随机选择题目，用于避免生成重复题目
            召回数量从环境变量 QUESTION_RECALL_COUNT 读取
        """
        count = envs.QUESTION_RECALL_COUNT
        if count == 0:
            return []

        # 如果提供了学生ID，排除最近做过的题目
        recent_question_ids = []
        if student_id:
            recent_question_ids = await cls._get_recent_question_ids(
                db, student_id, textbook_id, limit=100
            )

        # 构建查询：从教材随机选择
        stmt = (
            select(Question)
            .where(Question.textbook_id == textbook_id)
            .order_by(func.random())
            .limit(count)
        )

        # 如果有最近做过的题目，排除它们
        if recent_question_ids:
            stmt = stmt.where(~Question.id.in_(recent_question_ids))

        result = await db.execute(stmt)
        questions = result.scalars().all()

        # 如果排除后数量不足，补充随机题目
        if len(questions) < count:
            remaining_count = count - len(questions)
            existing_ids = [q.id for q in questions] + recent_question_ids

            additional_stmt = (
                select(Question)
                .where(
                    and_(
                        Question.textbook_id == textbook_id,
                        ~Question.id.in_(existing_ids) if existing_ids else True,
                    )
                )
                .order_by(func.random())
                .limit(remaining_count)
            )

            additional_result = await db.execute(additional_stmt)
            additional_questions = additional_result.scalars().all()
            questions.extend(additional_questions)

        logger.debug(
            f"能力评估召回题目: textbook_id={textbook_id}, "
            f"召回数量={len(questions)}, 排除最近题目={len(recent_question_ids)}道"
        )

        return list(questions[:count])

    @classmethod
    async def _get_recent_question_ids(
        cls,
        db: AsyncSession,
        student_id: str,
        textbook_id: Optional[int],
        unit_id: Optional[int] = None,
        limit: int = 100,
    ) -> List[int]:
        """获取学生最近做过的题目ID

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            unit_id: 单元ID（可选，如果提供则只查询该单元的题目）
            limit: 最多返回的题目数量

        Returns:
            题目ID列表
        """
        # 查询学生最近的练习会话（最近30次）
        # 注意：textbook_id 可能为 None，需要处理
        session_stmt = (
            select(PracticeSession.id)
            .where(PracticeSession.student_id == student_id)
            .order_by(PracticeSession.create_time.desc())
            .limit(30)
        )
        
        # 如果指定了 textbook_id，添加过滤条件
        if textbook_id is not None:
            session_stmt = session_stmt.where(PracticeSession.textbook_id == textbook_id)

        session_result = await db.execute(session_stmt)
        session_ids = [row[0] for row in session_result.all()]

        if not session_ids:
            return []

        # 查询这些会话中的题目ID
        answer_stmt = (
            select(distinct(PracticeAnswer.question_id))
            .where(PracticeAnswer.session_id.in_(session_ids))
            .limit(limit)
        )

        # 如果指定了单元ID，需要进一步过滤题目
        if unit_id:
            # 先获取题目ID，然后过滤
            answer_result = await db.execute(answer_stmt)
            question_ids = [row[0] for row in answer_result.all()]

            # 查询这些题目中属于指定单元的
            question_stmt = (
                select(Question.id)
                .where(and_(Question.id.in_(question_ids), Question.unit_id == unit_id))
                .limit(limit)
            )
            question_result = await db.execute(question_stmt)
            return [row[0] for row in question_result.all()]

        answer_result = await db.execute(answer_stmt)
        return [row[0] for row in answer_result.all()]

