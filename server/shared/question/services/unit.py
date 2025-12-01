"""单元生成服务

本模块负责单元级别题目生成的业务逻辑：
- 参数验证
- 数据加载（单元、教材、知识点）
- Prompt 构建

对应 Prompt: shared/question/prompts/unit.py
对应 Graph 节点: check_unit -> load_unit_data -> build_unit_prompt
"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Unit, Textbook
from shared.question.types import QuestionGenerationState
from shared.question.prompts.unit import build_unit_prompt


class UnitGenerateService:
    """单元生成服务

    功能：
    - 针对特定单元生成练习题
    - 基于单元知识点出题
    - 难度分布：简单40%、普通40%、困难20%
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元生成的状态参数"""
        if state.get("unit") is None:
            raise ValueError("单元 (unit) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元生成所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            unit: Unit = state["unit"]
            textbook: Textbook = state["textbook"]

            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit.id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            logger.info(
                f"✓ 单元数据加载完成: unit_id={unit.id}, unit_name={unit.name}, "
                f"textbook_id={textbook.id}, subject={textbook.subject}, grade={textbook.grade}"
            )

            return {"knowledges": knowledges}
        except Exception as e:
            logger.error(f"✗ 加载单元数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元生成的 Prompt"""
        return build_unit_prompt(state)
