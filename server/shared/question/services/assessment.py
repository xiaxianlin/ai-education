"""能力评估服务 - 负责能力评估相关的验证和上下文加载"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Textbook, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.assessment import build_assessment_prompt


class AssessmentGenerateService:
    """能力评估服务类"""

    @classmethod
    async def _recall_questions(cls, db: AsyncSession, textbook_id: int, count: int) -> List[Question]:
        """召回教材题目

        策略：从指定教材随机选择题目，用于避免重复
        """
        stmt = (
            select(Question)
            .where(Question.textbook_id == textbook_id, Question.status == 1)
            .order_by(func.random())
            .limit(count)
        )

        result = await db.execute(stmt)
        questions = result.scalars().all()

        return list(questions)

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证能力评估的状态参数"""
        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载能力评估的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            textbook_id: int = state["textbook_id"]
            count: int = state.get("count", 15)

            # 加载教材信息
            textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
            if not textbook:
                raise ValueError(f"教材不存在: {textbook_id}")

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
                f"加载能力评估上下文: textbook_id={textbook_id}, 知识点数量={len(knowledges)}, 召回题目数量={len(recalled_questions)}"
            )

            return {
                "textbook": textbook,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
                "recall_count": recall_count,
            }
        except Exception as e:
            logger.error(f"加载能力评估数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建能力评估的prompt"""
        return build_assessment_prompt(state)
