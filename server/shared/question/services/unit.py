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

from core.database import Knowledge, Unit
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
        """验证单元生成的状态参数

        Args:
            state: 题目生成状态

        Raises:
            ValueError: 参数验证失败

        Note:
            对应 Graph 节点: check_unit_node
        """
        if state.get("unit_id") is None:
            raise ValueError("单元 ID (unit_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元生成所需的上下文数据

        Args:
            state: 题目生成状态

        Returns:
            包含以下字段的字典：
            - unit: 单元对象
            - textbook: 教材对象
            - knowledges: 知识点名称列表
            - recall_questions: 召回的历史题目列表

        Raises:
            ValueError: 单元或教材不存在

        Note:
            对应 Graph 节点: load_unit_data_node
            数据将用于 build_unit_prompt 构建提示词
        """
        try:
            db: AsyncSession = state["db"]
            unit_id: int = state["unit_id"]

            unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
            if not unit:
                raise ValueError(f"单元不存在: unit_id={unit_id}")

            # 加载教材信息
            textbook = unit.textbook

            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            logger.info(
                f"✓ 单元数据加载完成: unit_id={unit_id}, unit_name={unit.name}, "
                f"textbook_id={textbook.id}, subject={textbook.subject}, grade={textbook.grade}"
            )

            return {
                "unit": unit,
                "textbook": textbook,
                "knowledges": knowledges,
            }
        except Exception as e:
            logger.error(f"✗ 加载单元数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元生成的 Prompt

        Args:
            state: 题目生成状态（必须已包含 load_data 返回的数据）

        Returns:
            包含以下字段的字典：
            - prompt: ChatPromptTemplate 对象
            - prompt_input: Prompt 输入参数
            - parser: JSON 输出解析器

        Note:
            对应 Graph 节点: build_unit_prompt_node
            对应 Prompt 函数: shared/question/prompts/unit.py::build_unit_prompt
        """
        return build_unit_prompt(state)
