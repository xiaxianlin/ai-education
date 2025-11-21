"""每日练习服务

本模块负责个性化每日练习题目生成的业务逻辑：
- 参数验证
- 数据加载（学生学习数据）
- 题目召回（避免重复）
- Prompt 构建（基于学生画像）

对应 Prompt: shared/question/prompts/daily_practice.py
对应 Graph 节点: check_daily_practice -> load_daily_practice_data -> build_daily_practice_prompt
"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.daily_practice import build_daily_practice_prompt


class DailyPracticeGenerateService:
    """每日练习服务

    功能：
    - 基于学生学习数据生成个性化练习
    - 题目分布：错题30%、巩固40%、挑战20%、新知10%
    - 需要获取学生的薄弱知识点、已掌握知识点等数据
    """

    @classmethod
    async def _recall_questions(
        cls, db: AsyncSession, student_id: str, textbook_id: int, count: int
    ) -> List[Question]:
        """召回学生历史题目

        Args:
            db: 数据库会话
            student_id: 学生ID
            textbook_id: 教材ID
            count: 召回数量

        Returns:
            题目列表

        Note:
            策略：从教材中随机选择题目作为参考（避免重复）
            TODO: 未来可基于学生学习数据（错题、薄弱知识点）智能召回
        """
        if count == 0:
            return []

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
        """验证每日练习的状态参数

        Args:
            state: 题目生成状态

        Raises:
            ValueError: 参数验证失败

        Note:
            对应 Graph 节点: check_daily_practice_node
        """
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载每日练习所需的上下文数据

        Args:
            state: 题目生成状态

        Returns:
            包含以下字段的字典：
            - recall_questions: 召回的历史题目列表
            - recall_count: 实际召回数量

        Note:
            对应 Graph 节点: load_daily_practice_data_node
            数据将用于 build_daily_practice_prompt 构建提示词
            学生学习画像数据（薄弱知识点等）在 build_prompt 中获取
        """
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook_id: int = state["textbook_id"]
            recall_count: int = state["recall_count"]

            # 召回历史题目（用于避免重复）
            recalled_questions = await cls._recall_questions(
                db, student_id, textbook_id, recall_count
            )

            logger.info(
                f"✓ 每日练习数据加载完成: student_id={student_id}, textbook_id={textbook_id}, "
                f"召回题目={len(recalled_questions)}道"
            )

            return {
                "recall_questions": recalled_questions,
                "recall_count": len(recalled_questions),
            }
        except Exception as e:
            logger.error(f"✗ 加载每日练习数据失败: {e}")
            raise

    @classmethod
    async def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建每日练习的 Prompt（异步方法）

        Args:
            state: 题目生成状态（必须已包含 load_data 返回的数据）

        Returns:
            包含以下字段的字典：
            - prompt: ChatPromptTemplate 对象
            - prompt_input: Prompt 输入参数
            - parser: JSON 输出解析器

        Note:
            对应 Graph 节点: build_daily_practice_prompt_node
            对应 Prompt 函数: shared/question/prompts/daily_practice.py::build_daily_practice_prompt

            ⚠️ 此方法是异步的，因为需要获取学生学习画像数据
        """
        return await build_daily_practice_prompt(state)
