"""综合评估策略

基于能力评估算法生成自适应测试题目。
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
from shared.generation.question.services.question import get_difficulty_distribution
from .base import BasePracticeStrategy
from .registry import register_strategy


@register_strategy
class AssessPracticeStrategy(BasePracticeStrategy):
    """综合评估策略"""

    @classmethod
    def get_slug(cls) -> str:
        return "assess_practice"

    async def load_context(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载综合评估上下文（全部知识点）"""
        db: AsyncSession = state["db"]
        textbook = state["textbook"]

        logger.info(f"加载综合评估上下文: textbook_id={textbook.id}")

        knowledges = (
            await db.scalars(select(Knowledge).where(Knowledge.textbook_id == textbook.id))
        ).all()

        return {"knowledges": knowledges}

    async def build_prompt(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建综合评估 Prompt"""
        db: AsyncSession = state["db"]
        session = state["session"]
        knowledges = state.get("knowledges", [])
        recall_questions = state.get("recall_questions", [])

        subject = session.parameters.get("subject", "")
        grade = session.parameters.get("grade", 0)
        count = session.parameters.get("generate_count", 18)
        question_types = state.get("question_types", {})

        # 从 Practice 获取提示词模板
        practice = state.get("practice")
        if not practice or not practice.prompt:
            raise ValueError("综合评估提示词不存在")

        prompt = ChatPromptTemplate.from_template(practice.prompt)

        # JSON 输出解析器
        prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = prompt_parser.get_format_instructions()
        prompt = prompt.partial(format_instructions=format_instructions)

        remain_count = count - len(recall_questions)
        distribution = get_difficulty_distribution(remain_count)

        prompt_input = {
            "grade": GRADE_NAME_MAP.get(grade, str(grade)),
            "count": remain_count,
            "question_types": build_question_types_prompt(question_types),
            "knowledge_text": build_knowledges_prompt([k.name for k in knowledges]),
            "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
            **distribution,
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "prompt_parser": prompt_parser,
        }

    def get_difficulty_distribution(self, count: int) -> Dict[str, int]:
        """综合评估使用均衡难度分布"""
        easy = max(1, int(count * 0.25))
        medium = max(1, int(count * 0.5))
        hard = count - easy - medium
        return {"easy": easy, "medium": medium, "hard": hard}
