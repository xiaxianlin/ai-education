"""今日练习服务 - 负责今日练习相关的验证、上下文加载和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question, Textbook, Student
from shared.question.types import QuestionGenerationState
from shared.question.prompts.daily_practice import build_daily_practice_prompt


class DailyPracticeGenerateService:
    """今日练习服务类"""

    @classmethod
    async def _recall_questions(cls, db: AsyncSession, student_id: str, textbook_id: int, count: int) -> List[Question]:
        """召回今日练习题目

        策略：从教材中随机选择题目作为参考（避免重复）
        """
        # 简化实现：从教材中随机选择题目
        # TODO: 实际应用中应该根据学生的学习数据（错题、薄弱知识点等）智能召回
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
        """验证今日练习的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载今日练习的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook_id: str = state["textbook_id"]
            recall_count: int = state["recall_count"]

            recalled_questions = await cls._recall_questions(db, student_id, textbook_id, recall_count)

            logger.info(
                f"加载今日练习上下文: textbook_id={textbook_id}, student_id={student_id}, "
                f"召回题目数量={len(recalled_questions)}"
            )

            return {
                "recall_questions": recalled_questions,
                "recall_count": len(recalled_questions),
            }
        except Exception as e:
            logger.error(f"加载今日练习数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建今日练习的prompt"""
        return build_daily_practice_prompt(state)
