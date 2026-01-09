"""单元练习策略

基于特定单元和知识点生成练习题目。
"""

from typing import Any, Dict

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.constants import GRADE_NAME_MAP
from shared.core.database import Knowledge
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.generation.question.schema import QuestionGenerationResult, QuestionGenerationState
from shared.generation.question.services.prompt import (
    build_avoid_duplicate_prompt,
    build_knowledges_prompt,
    build_question_types_prompt,
)
from .base import BasePracticeStrategy
from .registry import register_strategy


@register_strategy
class UnitPracticeStrategy(BasePracticeStrategy):
    """单元练习策略"""

    @classmethod
    def get_slug(cls) -> str:
        return "unit_practice"

    async def load_context(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习上下文（单元信息、知识点）"""
        db: AsyncSession = state["db"]
        units = state["units"]
        session = state["session"]
        unit_id = session.parameters.get("unit_id", 0)

        unit = next((u for u in units if u.id == unit_id), None)
        if not unit:
            raise ValueError(f"单元不存在: unit_id={unit_id}")

        logger.info(f"加载单元练习上下文: unit_id={unit_id}, unit_name={unit.name}")

        knowledges = (await db.scalars(select(Knowledge).where(Knowledge.unit_id == unit.id))).all()

        return {"unit": unit, "knowledges": knowledges}

    async def build_prompt(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元练习 Prompt"""
        db: AsyncSession = state["db"]
        session = state["session"]
        unit = state["unit"]
        knowledges = state.get("knowledges", [])
        recall_questions = state.get("recall_questions", [])

        subject = session.parameters.get("subject", "")
        grade = session.parameters.get("grade", 0)
        count = session.parameters.get("generate_count", 15)
        question_types = state.get("question_types", {})

        # 使用默认提示词模板（Practice 表已删除）
        default_prompt_template = """请为{grade}年级学生生成{count}道{subject}科目的单元练习题目。
        
单元信息：
- 单元名称：{unit_name}
- 单元内容：{unit_summary}
- 知识点：{knowledges}

要求：
1. 题目难度适中，符合该年级学生的认知水平
2. 题目类型分布：{question_types}
3. 避免重复题目：{avoid_duplicate_hint}
4. 题目应覆盖单元内的所有知识点

{format_instructions}"""
        
        prompt = ChatPromptTemplate.from_template(default_prompt_template)

        # JSON 输出解析器
        prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = prompt_parser.get_format_instructions()
        prompt = prompt.partial(format_instructions=format_instructions)

        prompt_input = {
            "grade": GRADE_NAME_MAP.get(grade, str(grade)),
            "unit_name": unit.name,
            "unit_summary": unit.content or "",
            "count": count - len(recall_questions),
            "question_types": build_question_types_prompt(question_types),
            "knowledges": build_knowledges_prompt([k.name for k in knowledges]),
            "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "prompt_parser": prompt_parser,
        }
