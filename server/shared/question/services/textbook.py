"""教材生成服务 - 负责教材生成相关的验证和上下文加载"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Textbook, Unit, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.textbook import build_textbook_prompt


class TextbookGenerateService:
    """教材生成服务类"""

    @classmethod
    async def _recall_questions(
        cls, db: AsyncSession, textbook_id: int, count: int
    ) -> List[Question]:
        """召回教材题目

        策略：从指定教材随机选择题目，用于避免重复
        """
        stmt = (
            select(Question)
            .where(Question.textbook_id == textbook_id)
            .order_by(func.random())
            .limit(count)
        )

        result = await db.execute(stmt)
        questions = result.scalars().all()

        return list(questions)

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证教材生成的状态参数"""
        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载教材生成的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            textbook_id: int = state["textbook_id"]
            count: int = state.get("count", 10)

            # 加载教材信息
            textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
            if not textbook:
                raise ValueError(f"教材不存在: {textbook_id}")

            # 加载所有单元
            unit_rows = await db.scalars(
                select(Unit).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
            )
            units = unit_rows.all()

            # 加载所有知识点（跨单元）
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .join(Knowledge.unit)
                .where(Knowledge.unit.has(textbook_id=textbook_id))
                .order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 召回题目（用于避免重复）
            recall_count = min(count, 30)  # 最多召回30道题
            recalled_questions = await cls._recall_questions(db, textbook_id, recall_count)

            logger.info(
                f"加载教材上下文: textbook_id={textbook_id}, 单元数量={len(units)}, "
                f"知识点数量={len(knowledges)}, 召回题目数量={len(recalled_questions)}"
            )

            return {
                "textbook": textbook,
                "units": units,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"加载教材生成数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建教材生成的prompt"""
        return build_textbook_prompt(state)
