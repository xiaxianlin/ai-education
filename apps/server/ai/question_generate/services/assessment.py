"""能力评估服务

本模块负责IRT能力评估题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、全部知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: question/prompts/assessment.py
对应 Graph 节点: check_assessment -> load_assessment_data -> build_assessment_prompt
"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from loguru import logger

from shared.core.database import Knowledge, Textbook
from ai.schema import QuestionGenerationState
from ai.question_generate.prompts.assessment import build_assessment_prompt
from ai.question_generate.services.recall import RecallService


class AssessmentGenerateService:
    """能力评估服务

    功能：
    - 基于IRT理论的自适应能力评估
    - 跨单元出题，全面评估学生能力
    - 难度分布：简单30%、普通50%、困难20%
    - 题目具有高区分度和独立性
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证能力评估的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载能力评估所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook: Textbook = state["textbook"]

            knowledge_rows = await db.scalars(
                select(Knowledge)
                .options(noload(Knowledge.textbook), noload(Knowledge.unit))
                .where(Knowledge.textbook_id == textbook.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            recalled_questions = await RecallService.recall_for_assessment(
                db, textbook.id
            )

            logger.info(
                f"✓ 能力评估数据加载完成: student_id={student_id}, textbook_id={textbook.id}, "
                f"subject={textbook.subject}, version={textbook.version}, "
                f"grade={textbook.grade}, semester={textbook.semester}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载能力评估数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建能力评估的 Prompt"""
        return build_assessment_prompt(state)
