"""教材生成服务

本模块负责教材级别题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、单元列表、全部知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: shared/question/prompts/textbook.py
对应 Graph 节点: check_textbook -> load_textbook_data -> build_textbook_prompt
"""

from typing import Any, Dict, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Textbook, Unit, Question
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
            count: int = state.get("count", 10)

            # 1. 加载教材信息
            textbook = await db.scalar(
                select(Textbook).where(Textbook.id == textbook_id)
            )
            if not textbook:
                raise ValueError(f"教材不存在: textbook_id={textbook_id}")

            # 2. 加载所有单元（用于显示教材结构）
            unit_rows = await db.scalars(
                select(Unit)
                .where(Unit.textbook_id == textbook_id)
                .order_by(Unit.id)
            )
            units = unit_rows.all()

            # 3. 加载所有知识点（跨单元）
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .join(Knowledge.unit)
                .where(Knowledge.unit.has(textbook_id=textbook_id))
                .order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 4. 召回历史题目（用于避免重复）
            recall_count = min(count, 30)  # 最多召回30道题
            recalled_questions = await cls._recall_questions(
                db, textbook_id, recall_count
            )

            logger.info(
                f"✓ 教材数据加载完成: textbook_id={textbook_id}, textbook_name={textbook.name}, "
                f"单元={len(units)}个, 知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "textbook": textbook,
                "units": units,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
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
