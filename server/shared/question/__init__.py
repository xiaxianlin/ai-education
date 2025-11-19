"""问题生成服务包 - 提供各种问题生成服务的入口

支持三种类型的练习：
1. daily: 今日练习 - 基于学生学习画像，召回+生成混合
2. unit: 单元练习 - 基于单元掌握度，召回+生成混合
3. assessment: 能力评估 - IRT自适应算法，纯AI生成

题目生成策略：
- 固定生成30道题目
- 15道从数据库召回
- 15道由AI生成（不足时补充）
"""

from typing import List, Optional
from sqlalchemy import select
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from shared.question.services import daily_practice
from shared.question.services.recall import RecallService
from shared.question.services.generator import GeneratorService
from shared.question.services.answer import AnswerService
from shared.question.services import (
    unit as unit_service,
    assessment as assessment_service,
)
from shared.question.graph import generate_question_graph

# 向后兼容：导出 PracticeService（已废弃，请使用 RecallService）
PracticeService = RecallService

# 从 graph 模块导出主要函数
from shared.question.graph import (
    generate_question_graph,
    invoke_generate_workflow,
    create_question_generation_graph,
    get_question_generation_graph,
)

# 导出主要服务类和函数
__all__ = [
    "QuestionGenerationService",
    "RecallService",
    "GeneratorService",
    "AnswerService",
    "PracticeService",  # 向后兼容，已废弃，请使用 RecallService
    "generate_question_graph",
    "invoke_generate_workflow",
    "create_question_generation_graph",
    "get_question_generation_graph",
]


class QuestionGenerationService:
    """统一的题目生成服务"""

    # 固定配置
    TOTAL_QUESTIONS = 30
    RECALL_COUNT = 15
    GENERATION_COUNT = 15

    @staticmethod
    async def generate_daily_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        create_answer_records: bool = False,
        session_id: Optional[int] = None,
    ) -> List[int]:
        """
        生成今日练习题目（召回+生成混合）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            create_answer_records: 是否预生成答题记录
            session_id: 会话ID（当create_answer_records=True时必需）

        Returns:
            题目ID列表
        """
        # 计算需要生成的题目数量（graph会在load_context阶段完成召回）
        need_generation_count = QuestionGenerationService.GENERATION_COUNT

        # 生成题目（graph会在load_context阶段完成召回，并在prompt中避免重复）
        generated_ids = []
        recalled_ids = []
        if need_generation_count > 0:
            # 获取教材的第一个单元ID（用于graph调用）
            from core.database import Unit
            unit_result = await db.execute(
                select(Unit.id).where(Unit.textbook_id == textbook_id).limit(1)
            )
            unit_row = unit_result.first()
            if not unit_row:
                raise ValueError(f"教材 {textbook_id} 没有可用单元")
            unit_id = unit_row[0]

            result = await generate_question_graph(
                db=db,
                unit_id=unit_id,
                count=need_generation_count,
                generation_type="daily",
                student_id=student_id,
                textbook_id=textbook_id,
            )

            # 从graph结果中获取召回的题目ID和生成的题目ID
            recalled_ids = result.get("recalled_question_ids", []) or []
            saved_questions = result.get("saved_questions", []) or []
            generated_ids = [
                getattr(question, "id", None)
                for question in saved_questions
                if getattr(question, "id", None) is not None
            ]

        # 合并并去重
        all_ids = recalled_ids + generated_ids
        unique_ids = list(dict.fromkeys(all_ids))  # 保持顺序去重

        # 确保总数为30题
        final_ids = unique_ids[: QuestionGenerationService.TOTAL_QUESTIONS]

        if len(final_ids) < QuestionGenerationService.TOTAL_QUESTIONS:
            logger.warning(
                f"今日练习题目不足: 期望 {QuestionGenerationService.TOTAL_QUESTIONS}，"
                f"实际 {len(final_ids)} (召回 {len(recalled_ids)} + 生成 {len(generated_ids)})"
            )

        # 预生成答题记录
        if create_answer_records and session_id:
            await AnswerService.create_answer_records(db, session_id, final_ids)

        return final_ids

    @staticmethod
    async def generate_unit_questions(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        create_answer_records: bool = False,
        session_id: Optional[int] = None,
    ) -> List[int]:
        """
        生成单元练习题目（召回+生成混合）

        Args:
            db: 数据库会话
            student_id: 学生ID
            unit_id: 单元ID
            create_answer_records: 是否预生成答题记录
            session_id: 会话ID（当create_answer_records=True时必需）

        Returns:
            题目ID列表
        """
        # 计算需要生成的题目数量（graph会在load_context阶段完成召回）
        need_generation_count = QuestionGenerationService.GENERATION_COUNT

        # 生成题目（graph会在load_context阶段完成召回，并在prompt中避免重复）
        generated_ids = []
        recalled_ids = []
        if need_generation_count > 0:
            result = await generate_question_graph(
                db=db,
                unit_id=unit_id,
                count=need_generation_count,
                generation_type="unit",
            )

            # 从graph结果中获取召回的题目ID和生成的题目ID
            recalled_ids = result.get("recalled_question_ids", []) or []
            saved_questions = result.get("saved_questions", []) or []
            generated_ids = [
                getattr(question, "id", None)
                for question in saved_questions
                if getattr(question, "id", None) is not None
            ]

        # 合并并去重
        all_ids = recalled_ids + generated_ids
        unique_ids = list(dict.fromkeys(all_ids))  # 保持顺序去重

        # 确保总数为30题
        final_ids = unique_ids[: QuestionGenerationService.TOTAL_QUESTIONS]

        if len(final_ids) < QuestionGenerationService.TOTAL_QUESTIONS:
            logger.warning(
                f"单元练习题目不足: 期望 {QuestionGenerationService.TOTAL_QUESTIONS}，"
                f"实际 {len(final_ids)} (召回 {len(recalled_ids)} + 生成 {len(generated_ids)})"
            )

        # 预生成答题记录
        if create_answer_records and session_id:
            await AnswerService.create_answer_records(db, session_id, final_ids)

        return final_ids

    @staticmethod
    async def generate_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        create_answer_records: bool = False,
        session_id: Optional[int] = None,
    ) -> List[int]:
        """
        生成能力评估题目（召回+生成混合）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            create_answer_records: 是否预生成答题记录
            session_id: 会话ID（当create_answer_records=True时必需）

        Returns:
            题目ID列表
        """
        # 计算需要生成的题目数量（graph会在load_context阶段完成召回）
        need_generation_count = QuestionGenerationService.GENERATION_COUNT

        # 生成题目（graph会在load_context阶段完成召回，并在prompt中避免重复）
        generated_ids = []
        recalled_ids = []
        if need_generation_count > 0:
            # 获取教材的第一个单元ID（用于graph调用）
            from core.database import Unit
            unit_result = await db.execute(
                select(Unit.id).where(Unit.textbook_id == textbook_id).limit(1)
            )
            unit_row = unit_result.first()
            if not unit_row:
                raise ValueError(f"教材 {textbook_id} 没有可用单元")
            unit_id = unit_row[0]

            result = await generate_question_graph(
                db=db,
                unit_id=unit_id,
                count=need_generation_count,
                generation_type="assessment",
                textbook_id=textbook_id,
            )

            # 从graph结果中获取召回的题目ID和生成的题目ID
            recalled_ids = result.get("recalled_question_ids", []) or []
            saved_questions = result.get("saved_questions", []) or []
            generated_ids = [
                getattr(question, "id", None)
                for question in saved_questions
                if getattr(question, "id", None) is not None
            ]

        # 合并并去重
        all_ids = recalled_ids + generated_ids
        unique_ids = list(dict.fromkeys(all_ids))  # 保持顺序去重

        # 确保总数为30题
        final_ids = unique_ids[: QuestionGenerationService.TOTAL_QUESTIONS]

        if len(final_ids) < QuestionGenerationService.TOTAL_QUESTIONS:
            logger.warning(
                f"能力评估题目不足: 期望 {QuestionGenerationService.TOTAL_QUESTIONS}，"
                f"实际 {len(final_ids)} (召回 {len(recalled_ids)} + 生成 {len(generated_ids)})"
            )

        # 预生成答题记录
        if create_answer_records and session_id:
            await AnswerService.create_answer_records(db, session_id, final_ids)

        return final_ids

    @staticmethod
    async def recall_questions(
        db: AsyncSession,
        recall_type: str,
        student_id: str,
        textbook_id: int,
        unit_id: Optional[int] = None,
        count: int = 15,
    ) -> List[int]:
        """
        纯召回题目服务

        Args:
            db: 数据库会话
            recall_type: 召回类型 ('daily', 'unit', 'assessment')
            student_id: 学生ID
            textbook_id: 教材ID
            unit_id: 单元ID（unit类型时必需）
            count: 召回数量

        Returns:
            题目ID列表
        """
        if recall_type == "daily":
            return await daily_practice.recall_questions(db, student_id, textbook_id, count)
        elif recall_type == "unit":
            if not unit_id:
                raise ValueError("unit类型召回需要提供unit_id")
            return await unit_service.recall_questions(db, unit_id, count)
        elif recall_type == "assessment":
            return await assessment_service.recall_questions(db, textbook_id, count)
        else:
            raise ValueError(f"不支持的召回类型: {recall_type}")

    @staticmethod
    async def generate_questions_by_graph(
        db: AsyncSession,
        generation_type: str,
        unit_id: int,
        count: int,
    ) -> List[int]:
        """
        纯AI生成题目服务

        Args:
            db: 数据库会话
            generation_type: 生成类型 ('daily', 'unit', 'assessment')
            unit_id: 单元ID
            count: 生成数量

        Returns:
            题目ID列表
        """
        result = await generate_question_graph(db, unit_id, count, generation_type=generation_type)

        saved_questions = result.get("saved_questions") or []
        generated_ids = [
            getattr(question, "id", None)
            for question in saved_questions
            if getattr(question, "id", None) is not None
        ]

        return generated_ids[:count]
