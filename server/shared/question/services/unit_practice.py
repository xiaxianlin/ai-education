"""单元练习服务

本模块负责单元练习题目生成的业务逻辑：
- 参数验证
- 数据加载（单元、知识点）
- 题目召回（避免重复）
- Prompt 构建

对应 Prompt: shared/question/prompts/unit_practice.py
对应 Graph 节点: check_unit_practice -> load_unit_practice_data -> build_unit_practice_prompt
"""

from typing import Any, Dict, List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Knowledge, Unit, Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.unit_practice import build_unit_practice_prompt


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
    async def _recall_questions(
        cls, db: AsyncSession, unit_id: int, count: int
    ) -> List[Question]:
        """召回单元历史题目
        
        Args:
            db: 数据库会话
            unit_id: 单元ID
            count: 召回数量
            
        Returns:
            题目列表
            
        Note:
            策略：从指定单元随机选择题目，优先保持题型多样性
        """
        stmt = (
            select(Question)
            .where(and_(Question.unit_id == unit_id))
            .order_by(func.random())  # 随机排序保持多样性
            .limit(count)
        )

        result = await db.execute(stmt)
        questions = result.scalars().all()

        return list(questions)

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元练习的状态参数
        
        Args:
            state: 题目生成状态
            
        Raises:
            ValueError: 参数验证失败
            
        Note:
            对应 Graph 节点: check_unit_practice_node
        """
        if state.get("unit_id") is None:
            raise ValueError("单元 ID (unit_id) 不能为空")

        if state.get("recall_count") is None:
            raise ValueError("召回题目数量 (recall_count) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习所需的上下文数据
        
        Args:
            state: 题目生成状态
            
        Returns:
            包含以下字段的字典：
            - unit: 单元对象
            - knowledges: 知识点名称列表
            - recall_questions: 召回的历史题目列表
            
        Raises:
            ValueError: 单元不存在
            
        Note:
            对应 Graph 节点: load_unit_practice_data_node
            数据将用于 build_unit_practice_prompt 构建提示词
        """
        try:
            db: AsyncSession = state["db"]
            unit_id: int = state["unit_id"]
            recall_count: int = state.get("recall_count", 15)  # 默认召回15题

            # 1. 加载单元信息
            unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
            if not unit:
                raise ValueError(f"单元不存在: unit_id={unit_id}")

            # 2. 加载知识点列表
            knowledge_rows = await db.scalars(
                select(Knowledge)
                .where(Knowledge.unit_id == unit_id)
                .order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 3. 召回历史题目（用于避免重复）
            recalled_questions = await cls._recall_questions(
                db, unit_id, recall_count
            )

            logger.info(
                f"✓ 单元练习数据加载完成: unit_id={unit_id}, unit_name={unit.name}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "unit": unit,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载单元练习数据失败: {e}")
            raise

    @classmethod
    def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元练习的 Prompt
        
        Args:
            state: 题目生成状态（必须已包含 load_data 返回的数据）
            
        Returns:
            包含以下字段的字典：
            - prompt: ChatPromptTemplate 对象
            - prompt_input: Prompt 输入参数
            - parser: JSON 输出解析器
            
        Note:
            对应 Graph 节点: build_unit_practice_prompt_node
            对应 Prompt 函数: shared/question/prompts/unit_practice.py::build_unit_practice_prompt
        """
        return build_unit_practice_prompt(state)
