"""单元生成服务 - 负责单元生成相关的验证、上下文加载和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Unit, Textbook, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.unit import build_unit_prompt


class UnitGenerateService:
    """单元生成服务类"""

    @classmethod
    async def _recall_questions(cls, db: AsyncSession, unit_id: int, count: int) -> List[Question]:
        """召回单元题目

        策略：从指定单元随机选择题目，用于避免重复
        """
        stmt = (
            select(Question)
            .where(and_(Question.unit_id == unit_id))
            .order_by(func.random())
            .limit(count)
        )

        result = await db.execute(stmt)
        questions = result.scalars().all()

        return list(questions)

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元生成的状态参数"""
        if state.get("unit_id") is None:
            raise ValueError("单元 ID (unit_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元生成的上下文数据，包括题目召回"""
        try:
            db: AsyncSession = state["db"]
            unit_id: int = state["unit_id"]
            count: int = state.get("count", 10)

            # 加载单元信息
            unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
            if not unit:
                raise ValueError(f"单元不存在: {unit_id}")

            # 加载教材信息
            textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
            if not textbook:
                raise ValueError(f"教材不存在: {unit.textbook_id}")

            # 加载知识点
            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 召回题目（用于避免重复）
            recall_count = min(count, 20)  # 最多召回20道题
            recalled_questions = await cls._recall_questions(db, unit_id, recall_count)

            logger.info(
                f"加载单元上下文: unit_id={unit_id}, 知识点数量={len(knowledges)}, 召回题目数量={len(recalled_questions)}"
            )

            return {
                "unit": unit,
                "textbook": textbook,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"加载单元生成数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元生成的prompt"""
        return build_unit_prompt(state)
