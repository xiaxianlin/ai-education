"""单元练习服务 - 负责单元练习相关的验证、上下文加载、prompt构建和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Unit, Question
from shared.question.types import QuestionGenerationState


class UnitPracticeGenerateService:
    """单元练习服务类"""

    @classmethod
    async def _recall_questions(cls, db: AsyncSession, unit_id: int, count: int) -> List[int]:
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
            select(Question)
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

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元练习的状态参数"""
        if state.get("unit_id") is None:
            raise ValueError("单元 ID 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习的上下文数据，包括题目召回"""
        db: AsyncSession = state["db"]
        unit_id: int = state["unit_id"]
        count: int = state.get("count", 15)  # 默认召回15道题

        # 加载单元信息
        unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
        if not unit:
            raise ValueError(f"单元不存在: {unit_id}")

        # 加载知识点
        knowledge_rows = await db.scalars(
            select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
        )
        knowledges = knowledge_rows.all()

        # 召回题目
        recalled_questions = await cls._recall_questions(db, unit_id, count)

        logger.info(
            f"加载单元上下文: unit_id={unit_id}, 知识点数量={len(knowledges)}, 召回题目数量={len(recalled_questions)}"
        )

        return {
            "unit": unit,
            "knowledges": knowledges,
            "recall_questions": recalled_questions,
        }
