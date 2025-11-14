"""统一的题目生成服务

支持三种类型的练习：
1. daily: 今日练习 - 基于学生学习画像，召回+生成混合
2. unit: 单元练习 - 基于单元掌握度，召回+生成混合
3. assessment: 能力评估 - IRT自适应算法，纯AI生成

题目生成策略：
- 固定生成30道题目
- 15道从数据库召回
- 15道由AI生成（不足时补充）
"""

from typing import List, Dict, Any, Optional
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Question, Textbook, Unit, PracticeAnswer
from shared.services.practice import PracticeService
from shared.ai.graphs.generate_question import generate_question_graph
from shared.ai.prompts.question import get_prompt_by_subject


class QuestionGenerationService:
    """统一的题目生成服务"""

    # 固定配置
    TOTAL_QUESTIONS = 30
    RECALL_COUNT = 15
    GENERATION_COUNT = 15

    @staticmethod
    async def generate_questions(
        db: AsyncSession,
        session_type: str,
        student_id: str,
        textbook_id: int,
        target_id: Optional[int] = None,
        target_difficulty: Optional[str] = None,
        create_answer_records: bool = False,
        session_id: Optional[int] = None,
    ) -> List[int]:
        """
        统一的题目生成入口

        Args:
            db: 数据库会话
            session_type: 会话类型 ('daily', 'unit', 'assessment')
            student_id: 学生ID
            textbook_id: 教材ID
            target_id: 目标ID (unit_id for unit, date for daily)
            target_difficulty: 目标难度 (for unit)
            create_answer_records: 是否预生成答题记录
            session_id: 会话ID（当create_answer_records=True时必需）

        Returns:
            题目ID列表
        """
        if session_type not in ['daily', 'unit', 'assessment']:
            raise ValueError(f"不支持的会话类型: {session_type}")

        # 召回题目
        recalled_ids = await QuestionGenerationService._recall_questions(
            db, session_type, student_id, textbook_id, target_id, target_difficulty
        )

        # 计算需要生成的题目数量
        actual_recall_count = len(recalled_ids)
        need_generation_count = QuestionGenerationService.GENERATION_COUNT + (
            QuestionGenerationService.RECALL_COUNT - actual_recall_count
        )

        # 生成题目
        generated_ids = []
        if need_generation_count > 0:
            generated_ids = await QuestionGenerationService._generate_questions(
                db, session_type, student_id, textbook_id, target_id, need_generation_count
            )

        # 合并并去重
        all_ids = recalled_ids + generated_ids
        unique_ids = list(dict.fromkeys(all_ids))  # 保持顺序去重

        # 确保总数为30题
        final_ids = unique_ids[:QuestionGenerationService.TOTAL_QUESTIONS]

        if len(final_ids) < QuestionGenerationService.TOTAL_QUESTIONS:
            logger.warning(
                f"{session_type} 题目不足: 期望 {QuestionGenerationService.TOTAL_QUESTIONS}，"
                f"实际 {len(final_ids)} (召回 {len(recalled_ids)} + 生成 {len(generated_ids)})"
            )

        # 预生成答题记录
        if create_answer_records and session_id:
            await QuestionGenerationService._create_answer_records(db, session_id, final_ids)

        return final_ids

    @staticmethod
    async def _recall_questions(
        db: AsyncSession,
        session_type: str,
        student_id: str,
        textbook_id: int,
        target_id: Optional[int],
        target_difficulty: Optional[str],
    ) -> List[int]:
        """根据会话类型召回题目"""

        try:
            if session_type == 'daily':
                # 今日练习：使用通用服务召回题目
                return await PracticeService.recall_daily_questions(
                    db, student_id, textbook_id, QuestionGenerationService.RECALL_COUNT
                )

            elif session_type == 'unit':
                # 单元练习：从指定单元获取题目
                if not target_id:
                    logger.warning("单元练习缺少单元ID")
                    return []

                return await PracticeService.recall_unit_questions(
                    db, target_id, QuestionGenerationService.RECALL_COUNT
                )

            elif session_type == 'assessment':
                # 能力评估：均衡从各单元获取题目
                return await PracticeService.recall_assessment_questions(
                    db, textbook_id, QuestionGenerationService.RECALL_COUNT
                )

        except Exception as e:
            logger.error(f"{session_type} 题目召回失败: {e}")
            return []

        return []

    @staticmethod
    async def _generate_questions(
        db: AsyncSession,
        session_type: str,
        student_id: str,
        textbook_id: int,
        target_id: Optional[int],
        count: int,
    ) -> List[int]:
        """根据会话类型生成题目"""

        if count <= 0:
            return []

        try:
            if session_type == 'daily':
                # 今日练习生成
                return await QuestionGenerationService._generate_daily_questions(
                    db, student_id, textbook_id, count
                )

            elif session_type == 'unit':
                # 单元练习生成
                if not target_id:
                    logger.warning("单元练习缺少单元ID")
                    return []

                return await QuestionGenerationService._generate_unit_questions(
                    db, target_id, count
                )

            elif session_type == 'assessment':
                # 能力评估生成
                return await QuestionGenerationService._generate_assessment_questions(
                    db, textbook_id, count
                )

        except Exception as e:
            logger.error(f"{session_type} 题目生成失败: {e}")
            return []

        return []

    @staticmethod
    async def _generate_daily_questions(
        db: AsyncSession, student_id: str, textbook_id: int, count: int
    ) -> List[int]:
        """生成今日练习题目"""
        # 获取教材信息
        textbook = await db.get(Textbook, textbook_id)
        if not textbook:
            logger.warning(f"教材不存在: {textbook_id}")
            return []

        # 获取该教材的所有单元，用于平均分配
        from sqlalchemy import select
        result = await db.execute(
            select(Unit.id).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
        )
        unit_ids = [row[0] for row in result.all()]

        if not unit_ids:
            logger.warning(f"教材 {textbook_id} 没有单元")
            return []

        # 平均分配到各个单元
        units_count = len(unit_ids)
        base_share = count // units_count
        remainder = count % units_count

        generated_ids: List[int] = []
        for idx, unit_id in enumerate(unit_ids):
            share = base_share + (1 if idx < remainder else 0)
            if share <= 0:
                continue

            try:
                logger.info(f"生成今日练习题目：unit_id={unit_id}, count={share}")
                result = await generate_question_graph(
                    db, unit_id, share, generation_type="daily"
                )
            except Exception as exc:
                logger.error(f"今日练习题目生成失败：unit_id={unit_id}, count={share}, error={exc}")
                continue

            saved_questions = result.get("saved_questions") or []
            for question in saved_questions:
                question_id = getattr(question, "id", None)
                if question_id:
                    generated_ids.append(question_id)

            if len(generated_ids) >= count:
                break

        # 去重
        unique_generated = list(dict.fromkeys(generated_ids))
        return unique_generated[:count]

    @staticmethod
    async def _generate_unit_questions(db: AsyncSession, unit_id: int, count: int) -> List[int]:
        """生成单元练习题目"""
        try:
            logger.info(f"生成单元练习题目：unit_id={unit_id}, count={count}")
            result = await generate_question_graph(
                db, unit_id, count, generation_type="unit"
            )
        except Exception as exc:
            logger.error(f"单元练习题目生成失败：unit_id={unit_id}, count={count}, error={exc}")
            return []

        saved_questions = result.get("saved_questions") or []
        generated_ids = [
            getattr(question, "id", None) for question in saved_questions
            if getattr(question, "id", None) is not None
        ]

        return generated_ids[:count]

    @staticmethod
    async def _generate_assessment_questions(db: AsyncSession, textbook_id: int, count: int) -> List[int]:
        """生成能力评估题目"""
        # 获取教材信息
        textbook = await db.get(Textbook, textbook_id)
        if not textbook:
            logger.warning(f"教材不存在: {textbook_id}")
            return []

        # 获取该教材的所有单元
        from sqlalchemy import select
        result = await db.execute(
            select(Unit.id, Unit.name).where(
                Unit.textbook_id == textbook_id
            ).order_by(Unit.id)
        )
        units = result.all()

        if not units:
            logger.warning(f"教材 {textbook_id} 没有单元")
            return []

        # 能力评估需要均衡分配到各个单元（覆盖整个年级的能力）
        units_count = len(units)
        base_share = count // units_count
        remainder = count % units_count

        generated_ids: List[int] = []
        for idx, (unit_id, unit_name) in enumerate(units):
            share = base_share + (1 if idx < remainder else 0)
            if share <= 0:
                continue

            try:
                logger.info(f"生成能力评估题目：unit_id={unit_id}, unit_name={unit_name}, count={share}")
                result = await generate_question_graph(
                    db, unit_id, share, generation_type="assessment"
                )
            except Exception as exc:
                logger.error(f"能力评估题目生成失败：unit_id={unit_id}, count={share}, error={exc}")
                continue

            saved_questions = result.get("saved_questions") or []
            for question in saved_questions:
                question_id = getattr(question, "id", None)
                if question_id:
                    generated_ids.append(question_id)

            if len(generated_ids) >= count:
                break

        # 去重
        unique_generated = list(dict.fromkeys(generated_ids))
        return unique_generated[:count]

    @staticmethod
    async def _create_answer_records(
        db: AsyncSession, session_id: int, question_ids: List[int]
    ) -> None:
        """
        预生成答题记录

        Args:
            db: 数据库会话
            session_id: 会话ID
            question_ids: 题目ID列表（按顺序）
        """
        try:
            # 先删除可能存在的旧记录（避免重复）
            await db.execute(
                PracticeAnswer.__table__.delete().where(
                    PracticeAnswer.session_id == session_id
                )
            )

            # 创建新的答题记录
            answer_records = []
            for order, question_id in enumerate(question_ids, 1):
                answer_record = PracticeAnswer(
                    session_id=session_id,
                    question_id=question_id,
                    question_order=order,
                    is_correct=0,  # 0表示未答
                )
                answer_records.append(answer_record)

            db.add_all(answer_records)
            await db.commit()

            logger.info(f"预生成答题记录: session_id={session_id}, count={len(answer_records)}")

        except Exception as e:
            logger.error(f"预生成答题记录失败: session_id={session_id}, error={e}")
            await db.rollback()
            raise