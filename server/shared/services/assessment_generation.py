"""能力评测题目生成服务"""

from typing import List
from loguru import logger
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Question, Unit
from shared.services.unit_based_question_service import UnitBasedQuestionService
from shared.ai.graphs.generate_question import generate_question_graph


class AssessmentGenerationService:
    """组合召回与生成的能力评测题目生成服务"""

    DEFAULT_RECALL_COUNT = 15
    DEFAULT_GENERATION_COUNT = 15

    @staticmethod
    async def recall_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        recall_count: int,
    ) -> List[int]:
        """从数据库召回能力评测题目"""
        if recall_count <= 0:
            return []

        # 使用现有的评测题目召回逻辑
        question_ids = await UnitBasedQuestionService.generate_assessment_questions(
            db, student_id, textbook_id, unit_ids=None, count=recall_count
        )

        # 去重并保持原有顺序
        seen = set()
        unique_ids: List[int] = []
        for qid in question_ids:
            if qid not in seen:
                seen.add(qid)
                unique_ids.append(qid)

        if not unique_ids:
            logger.warning(
                "未能召回能力评测题目：student=%s, textbook=%s", student_id, textbook_id
            )

        return unique_ids[:recall_count]

    @staticmethod
    async def generate_assessment_questions_new(
        db: AsyncSession,
        textbook_id: int,
        generate_count: int,
    ) -> List[int]:
        """生成新的能力评测题目

        Args:
            db: 数据库会话
            textbook_id: 教材ID
            generate_count: 需要生成的题目数量

        Returns:
            生成的题目ID列表
        """
        if generate_count <= 0:
            return []

        # 查询该教材的所有单元
        result = await db.execute(
            select(Unit.id, Unit.name).where(
                and_(
                    Unit.textbook_id == textbook_id,
                    Unit.status == 1
                )
            ).order_by(Unit.id)
        )
        units = result.all()

        if not units:
            logger.warning("教材 %s 没有找到任何活跃单元", textbook_id)
            return []

        # 能力评测需要均衡分配到各个单元（覆盖整个年级的能力）
        units_count = len(units)
        base_share = generate_count // units_count
        remainder = generate_count % units_count

        generated_ids: List[int] = []
        for idx, (unit_id, unit_name) in enumerate(units):
            share = base_share + (1 if idx < remainder else 0)
            if share <= 0:
                continue

            try:
                logger.info(
                    "调用能力评测题目生成：unit_id=%s, unit_name=%s, count=%s",
                    unit_id,
                    unit_name,
                    share,
                )
                result = await generate_question_graph(
                    db, unit_id, share, generation_type="assessment"
                )
            except Exception as exc:
                logger.error(
                    "能力评测题目生成失败：unit_id=%s, count=%s, error=%s",
                    unit_id,
                    share,
                    exc,
                )
                continue

            saved_questions = result.get("saved_questions") or []
            for question in saved_questions:
                question_id = getattr(question, "id", None)
                if question_id:
                    generated_ids.append(question_id)

            if len(generated_ids) >= generate_count:
                break

        # 去重
        unique_generated: List[int] = []
        seen = set()
        for qid in generated_ids:
            if qid in seen:
                continue
            seen.add(qid)
            unique_generated.append(qid)

        if len(unique_generated) < generate_count:
            logger.warning(
                "能力评测题目生成数量不足：期望 %s，实际 %s",
                generate_count,
                len(unique_generated),
            )

        return unique_generated[:generate_count]

    @staticmethod
    async def generate_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        total_count: int = 30,
    ) -> List[int]:
        """按照召回+生成策略生成能力评测题目

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            total_count: 总题目数量，默认30题（15召回+15生成）

        Returns:
            题目ID列表
        """
        if total_count <= 0:
            return []

        # 固定策略：15道召回 + 15道生成
        recall_target = AssessmentGenerationService.DEFAULT_RECALL_COUNT
        generation_target = AssessmentGenerationService.DEFAULT_GENERATION_COUNT

        # 如果总数小于30，按比例调整
        if total_count < 30:
            recall_target = total_count // 2
            generation_target = total_count - recall_target

        # 召回题目
        recalled = await AssessmentGenerationService.recall_assessment_questions(
            db, student_id, textbook_id, recall_target
        )

        # 计算需要生成的数量：如果召回不足，生成补充
        actual_recall_count = len(recalled)
        actual_generation_count = generation_target + (recall_target - actual_recall_count)

        # 生成题目
        generated: List[int] = []
        if actual_generation_count > 0:
            generated = await AssessmentGenerationService.generate_assessment_questions_new(
                db, textbook_id, actual_generation_count
            )

        combined = recalled + generated

        # 去重（确保召回和生成的题目不重复）
        recalled_set = set(recalled)
        final_ids = list(recalled)
        for qid in generated:
            if qid not in recalled_set:
                final_ids.append(qid)

        if len(final_ids) < total_count:
            logger.warning(
                "能力评测题目生成数量不足：期望 %s，实际 %s（召回 %s + 生成 %s）",
                total_count,
                len(final_ids),
                len(recalled),
                len([qid for qid in generated if qid not in recalled_set]),
            )

        return final_ids[:total_count]
