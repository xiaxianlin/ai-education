"""每日练习服务

本模块负责个性化每日练习题目生成的业务逻辑：
- 参数验证
- 数据加载（学生学习数据）
- 题目召回（避免重复）
- Prompt 构建（基于学生画像）

对应 Prompt: question/prompts/daily_practice.py
对应 Graph 节点: check_daily_practice -> load_daily_practice_data -> build_daily_practice_prompt
"""

from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from shared.core.database import Textbook
from ai.schema import QuestionGenerationState
from ai.question_generate.prompts.daily_practice import build_daily_practice_prompt
from ai.question_generate.services.recall import RecallService


class DailyPracticeGenerateService:
    """每日练习服务

    功能：
    - 基于学生学习数据生成个性化练习
    - 题目分布：错题30%、巩固40%、挑战20%、新知10%
    - 需要获取学生的薄弱知识点、已掌握知识点等数据
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证每日练习的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载每日练习所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook: Textbook = state["textbook"]

            # 召回历史题目（用于避免重复）
            recalled_questions = await RecallService.recall_for_daily_practice(
                db, student_id, textbook.id
            )

            logger.info(
                f"✓ 每日练习数据加载完成: student_id={student_id}, textbook_id={textbook.id}, "
                f"subject={textbook.subject}, grade={textbook.grade}, "
                f"召回题目={len(recalled_questions)}道"
            )

            return {
                "textbook": textbook,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载每日练习数据失败: {e}")
            raise

    @classmethod
    async def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建每日练习的 Prompt"""
        return await build_daily_practice_prompt(state)

