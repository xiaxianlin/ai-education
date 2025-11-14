"""通用练习服务

提供题目召回、练习管理等通用功能
"""
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import (
    Question, PracticeAnswer, StudentWrongRecord, PracticeSession
)


class PracticeService:
    """通用练习服务"""

    @staticmethod
    async def get_wrong_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int,
        exclude_ids: Optional[List[int]] = None
    ) -> List[int]:
        """获取学生的错题（未订正的）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 获取数量
            exclude_ids: 排除的题目ID列表

        Returns:
            题目ID列表
        """
        conditions = [
            StudentWrongRecord.student_id == student_id,
            StudentWrongRecord.is_corrected == 0,  # 未订正的错题
            Question.textbook_id == textbook_id,
            Question.status == 1,
        ]

        if exclude_ids:
            conditions.append(Question.id.not_in(exclude_ids))

        result = await db.execute(
            select(StudentWrongRecord.question_id)
            .join(Question, Question.id == StudentWrongRecord.question_id)
            .where(and_(*conditions))
            .order_by(StudentWrongRecord.create_time.desc())  # 按时间倒序
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def get_consolidate_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int,
        exclude_ids: Optional[List[int]] = None
    ) -> List[int]:
        """获取巩固题目（最近答对的题目）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 获取数量
            exclude_ids: 排除的题目ID列表

        Returns:
            题目ID列表
        """
        conditions = [
            PracticeAnswer.session_id.in_(
                select(PracticeSession.id).where(
                    and_(
                        PracticeSession.student_id == student_id,
                        PracticeSession.session_type.in_(['daily', 'unit']),
                        PracticeSession.status == 'completed'
                    )
                )
            ),
            PracticeAnswer.is_correct == 1,  # 答对的题目
            Question.textbook_id == textbook_id,
            Question.status == 1,
            Question.difficulty.in_(["简单", "普通"]),
        ]

        if exclude_ids:
            conditions.append(Question.id.not_in(exclude_ids))

        result = await db.execute(
            select(PracticeAnswer.question_id)
            .join(Question, Question.id == PracticeAnswer.question_id)
            .where(and_(*conditions))
            .group_by(PracticeAnswer.question_id)
            .order_by(func.max(PracticeAnswer.submit_time).desc())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def get_challenge_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int,
        exclude_ids: Optional[List[int]] = None
    ) -> List[int]:
        """获取挑战题目（困难题）

        Args:
            db: 数据库会话
            textbook_id: 教材ID
            count: 获取数量
            exclude_ids: 排除的题目ID列表

        Returns:
            题目ID列表
        """
        conditions = [
            Question.textbook_id == textbook_id,
            Question.status == 1,
            Question.difficulty == "困难",
        ]

        if exclude_ids:
            conditions.append(Question.id.not_in(exclude_ids))

        result = await db.execute(
            select(Question.id)
            .where(and_(*conditions))
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def get_new_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int,
        exclude_ids: Optional[List[int]] = None
    ) -> List[int]:
        """获取新题目（从未练习过的）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 获取数量
            exclude_ids: 排除的题目ID列表

        Returns:
            题目ID列表
        """
        # 获取学生已练习过的题目ID
        practiced_result = await db.execute(
            select(PracticeAnswer.question_id)
            .where(
                PracticeAnswer.session_id.in_(
                    select(PracticeSession.id).where(PracticeSession.student_id == student_id)
                )
            )
            .distinct()
        )
        practiced_ids = [row[0] for row in practiced_result.all()]

        all_exclude_ids = list(set((exclude_ids or []) + practiced_ids))

        conditions = [
            Question.textbook_id == textbook_id,
            Question.status == 1,
        ]

        if all_exclude_ids:
            conditions.append(Question.id.not_in(all_exclude_ids))

        result = await db.execute(
            select(Question.id)
            .where(and_(*conditions))
            .order_by(Question.create_time.desc())  # 优先选择新题目
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def recall_daily_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int
    ) -> List[int]:
        """召回今日练习题目

        策略：50% 错题 + 50% 巩固题目

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 题目总数

        Returns:
            题目ID列表
        """
        question_ids = []

        # 50% 错题
        wrong_count = count // 2
        wrong_questions = await PracticeService.get_wrong_questions(
            db, student_id, textbook_id, wrong_count
        )
        question_ids.extend(wrong_questions)

        # 剩余巩固题目
        consolidate_count = count - len(question_ids)
        if consolidate_count > 0:
            consolidate_questions = await PracticeService.get_consolidate_questions(
                db, student_id, textbook_id, consolidate_count, exclude_ids=question_ids
            )
            question_ids.extend(consolidate_questions)

        return question_ids

    @staticmethod
    async def recall_unit_questions(
        db: AsyncSession,
        unit_id: int,
        count: int
    ) -> List[int]:
        """召回单元练习题目

        策略：从指定单元选择题目，按难度排序

        Args:
            db: 数据库会话
            unit_id: 单元ID
            count: 题目数量

        Returns:
            题目ID列表
        """
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.unit_id == unit_id,
                    Question.status == 1,
                )
            )
            .order_by(Question.difficulty, Question.update_time.desc())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def recall_assessment_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int
    ) -> List[int]:
        """召回能力评估题目

        策略：均衡从各单元选择题目

        Args:
            db: 数据库会话
            textbook_id: 教材ID
            count: 题目数量

        Returns:
            题目ID列表
        """
        from core.database import Unit

        # 获取教材的所有单元
        unit_result = await db.execute(
            select(Unit.id).where(Unit.textbook_id == textbook_id)
        )
        unit_ids = [row[0] for row in unit_result.all()]

        if not unit_ids:
            return []

        # 从每个单元获取少量题目
        questions_per_unit = max(1, count // len(unit_ids))
        question_ids = []

        for unit_id in unit_ids:
            unit_questions = await db.execute(
                select(Question.id)
                .where(
                    and_(
                        Question.unit_id == unit_id,
                        Question.status == 1,
                    )
                )
                .order_by(func.random())
                .limit(questions_per_unit)
            )
            question_ids.extend([row[0] for row in unit_questions.all()])

        # 去重并限制数量
        unique_questions = list(dict.fromkeys(question_ids))
        return unique_questions[:count]

    @staticmethod
    async def get_practice_statistics(
        db: AsyncSession,
        student_id: str,
        session_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """获取练习统计信息

        Args:
            db: 数据库会话
            student_id: 学生ID
            session_type: 会话类型过滤，可选

        Returns:
            统计信息字典
        """
        # 基础查询条件
        conditions = [PracticeSession.student_id == student_id]
        if session_type:
            conditions.append(PracticeSession.session_type == session_type)

        # 总练习次数
        total_sessions = await db.scalar(
            select(func.count(PracticeSession.id)).where(and_(*conditions))
        )

        # 完成的练习次数
        completed_sessions = await db.scalar(
            select(func.count(PracticeSession.id)).where(
                and_(*(conditions + [PracticeSession.status == "completed"]))
            )
        )

        # 总答题数
        total_answers = await db.scalar(
            select(func.count(PracticeAnswer.id)).where(
                PracticeAnswer.session_id.in_(
                    select(PracticeSession.id).where(and_(*conditions))
                )
            )
        )

        # 正确答题数
        correct_answers = await db.scalar(
            select(func.count(PracticeAnswer.id)).where(
                and_(
                    PracticeAnswer.session_id.in_(
                        select(PracticeSession.id).where(and_(*conditions))
                    ),
                    PracticeAnswer.is_correct == 1
                )
            )
        )

        # 总耗时
        total_time = await db.scalar(
            select(func.sum(PracticeAnswer.time_spent)).where(
                PracticeAnswer.session_id.in_(
                    select(PracticeSession.id).where(and_(*conditions))
                )
            )
        ) or 0

        # 错题数
        wrong_records = await db.scalar(
            select(func.count(StudentWrongRecord.id)).where(
                and_(
                    StudentWrongRecord.student_id == student_id,
                    StudentWrongRecord.is_corrected == 0
                )
            )
        )

        return {
            "total_sessions": total_sessions or 0,
            "completed_sessions": completed_sessions or 0,
            "total_answers": total_answers or 0,
            "correct_answers": correct_answers or 0,
            "accuracy_rate": (correct_answers / total_answers * 100) if total_answers > 0 else 0,
            "total_time": total_time,
            "wrong_questions_count": wrong_records or 0,
        }
