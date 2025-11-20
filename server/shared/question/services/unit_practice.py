"""单元练习服务 - 负责单元练习相关的验证、上下文加载、prompt构建和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Unit, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.unit_practice import build_unit_practice_prompt


class UnitPracticeGenerateService:
    """单元练习服务类"""

    @classmethod
    async def _recall_questions(cls, db: AsyncSession, unit_id: int, count: int) -> List[Question]:
        """召回单元练习题目

        策略：从指定单元选择题目，优先选择不同题型的题目，保持多样性
        """
        # 1. 获取单元下的所有可用题目
        stmt = (
            select(Question)
            .where(and_(Question.unit_id == unit_id))
            .order_by(func.random())  # 随机排序，避免每次都一样
            .limit(count)
        )

        result = await db.execute(stmt)
        questions = result.scalars().all()

        return list(questions)

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元练习的状态参数"""
        if state.get("unit_id") is None:
            raise ValueError("单元 ID (unit_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习的上下文数据，包括题目召回"""
        try:
            db: AsyncSession = state["db"]
            unit_id: int = state["unit_id"]
            # 召回数量通常是生成数量的一半，或者固定数量
            # 这里假设生成30题，召回15题
            recall_count: int = 15

            # 加载单元信息
            unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
            if not unit:
                raise ValueError(f"单元不存在: {unit_id}")

            # 加载知识点
            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]  # 提取知识点名称

            # 召回题目
            recalled_questions = await cls._recall_questions(db, unit_id, recall_count)

            logger.info(
                f"加载单元练习上下文: unit_id={unit_id}, unit_name={unit.name}, "
                f"知识点数量={len(knowledges)}, 召回题目数量={len(recalled_questions)}"
            )

            return {
                "unit": unit,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"加载单元练习数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元练习的prompt"""
        return build_unit_practice_prompt(state)
