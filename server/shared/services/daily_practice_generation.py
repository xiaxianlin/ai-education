"""今日练习题目生成服务"""

from collections import Counter
from typing import List, Tuple

from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Question
from shared.services.unit_based_question_service import UnitBasedQuestionService
from shared.ai.graphs.generate_question import generate_question_graph


class DailyPracticeGenerationService:
    """组合召回与生成的今日练习题目生成服务"""

    DEFAULT_RECALL_COUNT = 20

    @staticmethod
    async def recall_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        recall_count: int,
    ) -> List[int]:
        """从数据库召回指定数量的题目，保持去重和顺序"""
        if recall_count <= 0:
            return []

        question_ids = await UnitBasedQuestionService.generate_daily_practice_questions(
            db, student_id, textbook_id, recall_count
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
                "未能召回今日练习题目：student=%s, textbook=%s", student_id, textbook_id
            )

        return unique_ids[:recall_count]

    @staticmethod
    async def generate_additional_questions(
        db: AsyncSession,
        recalled_question_ids: List[int],
        generate_count: int,
    ) -> List[int]:
        """根据召回题目信息生成额外的题目"""
        if generate_count <= 0:
            return []

        if not recalled_question_ids:
            logger.warning(
                "没有召回题目信息，无法生成额外题目"
            )
            return []

        # 根据召回题目统计单元分布
        result = await db.execute(
            select(Question.id, Question.unit_id).where(Question.id.in_(recalled_question_ids))
        )
        rows: List[Tuple[int, int]] = result.all()

        unit_counter = Counter(unit_id for _, unit_id in rows if unit_id is not None)
        if not unit_counter:
            logger.warning("召回题目缺少单元信息，无法进行题目生成")
            return []

        total_weight = sum(unit_counter.values())
        units_sorted = unit_counter.most_common()

        allocations: List[List[int]] = []  # [unit_id, count]
        remaining = generate_count

        for unit_id, weight in units_sorted:
            if remaining <= 0:
                break
            # 按权重分配生成数量，至少 1 道题
            share = max(1, round(generate_count * (weight / total_weight)))
            share = min(share, remaining)
            allocations.append([unit_id, share])
            remaining -= share

        if remaining > 0 and allocations:
            # 将未分配的数量平均补齐
            idx = 0
            while remaining > 0:
                allocations[idx % len(allocations)][1] += 1
                remaining -= 1
                idx += 1

        generated_ids: List[int] = []
        for unit_id, share in allocations:
            if share <= 0:
                continue
            try:
                logger.info(
                    "调用题目生成流程：unit_id=%s, count=%s", unit_id, share
                )
                result = await generate_question_graph(db, unit_id, share)
            except Exception as exc:
                logger.error(
                    "题目生成流程失败：unit_id=%s, count=%s, error=%s",
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

        # 去重并移除与召回重复的题目
        recalled_set = set(recalled_question_ids)
        unique_generated: List[int] = []
        seen = set()
        for qid in generated_ids:
            if qid in recalled_set or qid in seen:
                continue
            seen.add(qid)
            unique_generated.append(qid)

        if len(unique_generated) < generate_count:
            logger.warning(
                "题目生成数量不足：期望 %s，实际 %s",
                generate_count,
                len(unique_generated),
            )

        return unique_generated[:generate_count]

    @staticmethod
    async def generate_daily_practice_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        total_count: int,
    ) -> List[int]:
        """按照召回+生成策略生成今日练习题目"""
        if total_count <= 0:
            return []

        recall_target = min(DailyPracticeGenerationService.DEFAULT_RECALL_COUNT, total_count)
        recalled = await DailyPracticeGenerationService.recall_questions(
            db, student_id, textbook_id, recall_target
        )

        remaining = total_count - len(recalled)
        generated: List[int] = []
        if remaining > 0:
            generated = await DailyPracticeGenerationService.generate_additional_questions(
                db, recalled, remaining
            )

        combined = recalled + generated
        if len(combined) < total_count:
            logger.warning(
                "今日练习题目生成数量不足：期望 %s，实际 %s",
                total_count,
                len(combined),
            )

        return combined[:total_count]
