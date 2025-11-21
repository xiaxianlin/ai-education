"""教材生成服务

本模块负责教材级别题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、单元列表、全部知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: shared/question/prompts/textbook.py
对应 Graph 节点: check_textbook -> load_textbook_data -> build_textbook_prompt
"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from loguru import logger

from core.database import Knowledge, Textbook, Unit
from shared.question.types import QuestionGenerationState
from shared.question.prompts.textbook import build_textbook_prompt


class TextbookGenerateService:
    """教材生成服务

    功能：
    - 针对整本教材生成综合练习题
    - 跨单元出题，全面覆盖知识点
    - 难度分布：简单30%、普通50%、困难20%
    """

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证教材生成的状态参数

        Args:
            state: 题目生成状态

        Raises:
            ValueError: 参数验证失败

        Note:
            对应 Graph 节点: check_textbook_node
        """
        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载教材生成所需的上下文数据

        Args:
            state: 题目生成状态

        Returns:
            包含以下字段的字典：
            - textbook: 教材对象
            - units: 单元列表（用于显示教材结构）
            - knowledges: 全部知识点名称列表（跨单元）
            - recall_questions: 召回的历史题目列表

        Raises:
            ValueError: 教材不存在

        Note:
            对应 Graph 节点: load_textbook_data_node
            数据将用于 build_textbook_prompt 构建提示词
        """
        try:
            db: AsyncSession = state["db"]
            textbook_id: int = state["textbook_id"]

            # 1. 加载教材信息
            textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
            if not textbook:
                raise ValueError(f"教材不存在: textbook_id={textbook_id}")

            # 2. 加载所有单元（用于显示教材结构）
            unit_rows = await db.scalars(
                select(Unit).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
            )
            units = unit_rows.all()

            # 3. 加载所有知识点（跨单元）
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .options(noload(Knowledge.textbook), noload(Knowledge.unit))
                .where(Knowledge.textbook_id == textbook_id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            logger.info(
                f"✓ 教材数据加载完成: textbook_id={textbook_id}, textbook_name={textbook.name}, "
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
        """构建教材生成的 Prompt

        Args:
            state: 题目生成状态（必须已包含 load_data 返回的数据）

        Returns:
            包含以下字段的字典：
            - prompt: ChatPromptTemplate 对象
            - prompt_input: Prompt 输入参数
            - parser: JSON 输出解析器

        Note:
            对应 Graph 节点: build_textbook_prompt_node
            对应 Prompt 函数: shared/question/prompts/textbook.py::build_textbook_prompt
        """
        return build_textbook_prompt(state)
