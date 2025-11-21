"""能力评估服务

本模块负责IRT能力评估题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、全部知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: shared/question/prompts/assessment.py
对应 Graph 节点: check_assessment -> load_assessment_data -> build_assessment_prompt
"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from loguru import logger

from core.database import Knowledge, Textbook, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.assessment import build_assessment_prompt


class AssessmentGenerateService:
    """能力评估服务

    功能：
    - 基于IRT理论的自适应能力评估
    - 跨单元出题，全面评估学生能力
    - 难度分布：简单30%、普通50%、困难20%
    - 题目具有高区分度和独立性
    """

    @classmethod
    async def _recall_questions(
        cls, db: AsyncSession, textbook_id: int, count: int
    ) -> List[Question]:
        """召回教材历史题目

        Args:
            db: 数据库会话
            textbook_id: 教材ID
            count: 召回数量

        Returns:
            题目列表

        Note:
            策略：从指定教材随机选择题目，用于避免生成重复题目
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
        """验证能力评估的状态参数

        Args:
            state: 题目生成状态

        Raises:
            ValueError: 参数验证失败

        Note:
            对应 Graph 节点: check_assessment_node
        """
        if state.get("textbook_id") is None:
            raise ValueError("教材 ID (textbook_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载能力评估所需的上下文数据

        Args:
            state: 题目生成状态

        Returns:
            包含以下字段的字典：
            - textbook: 教材对象
            - knowledges: 全部知识点名称列表（跨单元）
            - recall_questions: 召回的历史题目列表
            - recall_count: 实际召回数量

        Raises:
            ValueError: 教材不存在

        Note:
            对应 Graph 节点: load_assessment_data_node
            数据将用于 build_assessment_prompt 构建提示词
        """
        try:
            db: AsyncSession = state["db"]
            textbook_id: int = state["textbook_id"]
            recall_count: int = state["recall_count"]
            # 1. 加载教材信息
            textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
            if not textbook:
                raise ValueError(f"教材不存在: textbook_id={textbook_id}")

            # 2. 加载所有知识点（跨单元，用于能力维度评估）
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .options(noload(Knowledge.textbook), noload(Knowledge.unit))
                .where(Knowledge.textbook_id == textbook_id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 3. 召回历史题目（用于避免重复）
            recalled_questions = await cls._recall_questions(db, textbook_id, recall_count)

            logger.info(
                f"✓ 能力评估数据加载完成: textbook_id={textbook_id}, textbook_name={textbook.name}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "textbook": textbook,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
                "recall_count": len(recalled_questions),
            }
        except Exception as e:
            logger.error(f"✗ 加载能力评估数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建能力评估的 Prompt

        Args:
            state: 题目生成状态（必须已包含 load_data 返回的数据）

        Returns:
            包含以下字段的字典：
            - prompt: ChatPromptTemplate 对象
            - prompt_input: Prompt 输入参数
            - parser: JSON 输出解析器

        Note:
            对应 Graph 节点: build_assessment_prompt_node
            对应 Prompt 函数: shared/question/prompts/assessment.py::build_assessment_prompt
        """
        return build_assessment_prompt(state)
