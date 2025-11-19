"""题目生成服务 - 负责通过AI生成题目"""
from typing import List
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Textbook, Unit
from shared.question.graph import generate_question_graph


class GeneratorService:
    """题目生成服务"""

    @staticmethod
    async def generate_daily_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int,
    ) -> List[int]:
        """生成今日练习题目"""
        # 获取教材信息
        textbook = await db.get(Textbook, textbook_id)
        if not textbook:
            logger.warning(f"教材不存在: {textbook_id}")
            return []

        # 获取该教材的所有单元，用于平均分配
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
    async def generate_unit_questions(
        db: AsyncSession,
        unit_id: int,
        count: int,
    ) -> List[int]:
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
    async def generate_assessment_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int,
    ) -> List[int]:
        """生成能力评估题目"""
        # 获取教材信息
        textbook = await db.get(Textbook, textbook_id)
        if not textbook:
            logger.warning(f"教材不存在: {textbook_id}")
            return []

        # 获取该教材的所有单元
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

