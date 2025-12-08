"""单元练习服务

本模块负责单元练习题目生成的业务逻辑：
- 参数验证
- 数据加载（单元、知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: question/prompts/unit_practice.py
对应 Graph 节点: check_unit_practice -> load_unit_practice_data -> build_unit_practice_prompt
"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from shared.core.database import Knowledge, Unit, Textbook
from ai.schema import QuestionGenerationState
from ai.question_generate.prompts.unit_practice import build_unit_practice_prompt
from ai.question_generate.services.recall import RecallService


class UnitPracticeGenerateService:
    """单元练习服务

    功能：
    - 针对特定单元生成练习题
    - 基于单元知识点出题（与 UnitGenerateService 相同）
    - 难度分布：简单40%、普通40%、困难20%

    Note:
        与 UnitGenerateService 的区别在于使用场景和召回策略
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元练习的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")
        
        if state.get("unit") is None:
            raise ValueError("单元 (unit) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            unit: Unit = state["unit"]
            textbook: Textbook = state["textbook"]
            student_id: str = state["student_id"]

            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit.id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 召回历史题目（用于避免重复）
            recalled_questions = await RecallService.recall_for_unit_practice(
                db, unit.id, student_id
            )

            logger.info(
                f"✓ 单元练习数据加载完成: unit_id={unit.id}, unit_name={unit.name}, "
                f"textbook_id={textbook.id}, subject={textbook.subject}, grade={textbook.grade}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "unit": unit,
                "textbook": textbook,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载单元练习数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元练习的 Prompt"""
        return build_unit_practice_prompt(state)

