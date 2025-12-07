"""教材生成服务

本模块负责教材级别题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、单元列表、全部知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: question/prompts/textbook.py
对应 Graph 节点: check_textbook -> load_textbook_data -> build_textbook_prompt
"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from loguru import logger

from core.database import Knowledge, Textbook, Unit
from question.types import QuestionGenerationState
from question.prompts.textbook import build_textbook_prompt


class TextbookGenerateService:
    """教材生成服务

    功能：
    - 针对整本教材生成综合练习题
    - 跨单元出题，全面覆盖知识点
    - 难度分布：简单30%、普通50%、困难20%
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证教材生成的状态参数"""
        pass

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载教材生成所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            textbook: Textbook = state["textbook"]

            # 加载所有单元（用于显示教材结构）
            unit_rows = await db.scalars(
                select(Unit).where(Unit.textbook_id == textbook.id).order_by(Unit.id)
            )
            units = unit_rows.all()

            # 加载所有知识点（跨单元）
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .options(noload(Knowledge.textbook), noload(Knowledge.unit))
                .where(Knowledge.textbook_id == textbook.id)
            )
            knowledges = knowledge_rows.all()

            logger.info(
                f"✓ 教材数据加载完成: textbook_id={textbook.id}, "
                f"subject={textbook.subject}, version={textbook.version}, "
                f"grade={textbook.grade}, semester={textbook.semester}, "
                f"单元数={len(units)}, 知识点数={len(knowledges)}"
            )

            return {
                "units": units,
                "knowledges": knowledges,
            }
        except Exception as e:
            logger.error(f"✗ 加载教材数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建教材生成的 Prompt"""
        return build_textbook_prompt(state)

