"""今日练习服务 - 负责今日练习相关的验证、上下文加载和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question, Textbook
from shared.question.types import QuestionGenerationState
from shared.question.prompts.daily_practice import build_daily_practice_prompt


class DailyPracticeGenerateService:
    """今日练习服务类"""

    @classmethod
    async def _recall_questions(
        cls, db: AsyncSession, student_id: str, textbook_id: int, count: int
    ) -> List[Question]:
        """召回今日练习题目

        策略：简化版 - 从教材中随机选择题目
        （实际应用中可以根据学生学习画像选择薄弱知识点相关题目）

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 题目数量

        Returns:
            题目列表
        """
        # 简化实现：从教材中选择最近的题目
        # TODO: 实际应用中应该根据学生的学习数据（错题、薄弱知识点等）智能召回
        result = await db.execute(
            select(Question)
            .where(Question.textbook_id == textbook_id, Question.status == 1)
            .order_by(Question.create_time.desc())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证今日练习的状态参数"""
        if state.get("textbook_id") is None:
            raise ValueError("教材 ID 不能为空")
        # student_id 是可选的，如果没有则生成通用练习

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载今日练习的上下文数据"""
        db: AsyncSession = state["db"]
        textbook_id: int = state["textbook_id"]
        student_id: str = state.get("student_id", "")
        count: int = state.get("count", 15)

        # 加载教材信息
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError(f"教材不存在: {textbook_id}")

        # 召回题目（用于避免重复）
        recall_count = min(count, 20)  # 最多召回20道题
        recalled_questions = await cls._recall_questions(db, student_id, textbook_id, recall_count)

        # 简化版：使用默认的知识点分布
        # TODO: 实际应用中应该从学生学习数据中获取薄弱知识点、已掌握知识点等
        weak_knowledge = []
        mastered_knowledge = []
        review_units = []

        logger.info(
            f"加载今日练习上下文: textbook_id={textbook_id}, student_id={student_id}, "
            f"召回题目数量={len(recalled_questions)}"
        )

        return {
            "textbook": textbook,
            "recall_questions": recalled_questions,
            "weak_knowledge": weak_knowledge,
            "mastered_knowledge": mastered_knowledge,
            "review_units": review_units,
        }

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建今日练习的prompt"""
        return build_daily_practice_prompt(state)

