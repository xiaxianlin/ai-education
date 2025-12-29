"""日常练习策略

基于学生教材生成日常练习题目。
"""

from typing import Any, Dict

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.constants import GRADE_NAME_MAP
from shared.generation.question.schema import (
    QuestionGenerationResult,
    QuestionGenerationState,
)
from shared.generation.question.services.prompt import (
    build_avoid_duplicate_prompt,
    build_knowledges_prompt,
    build_question_types_prompt,
    build_units_prompt,
)
from shared.generation.question.services.question import get_question_distribution
from sqlalchemy.ext.asyncio import AsyncSession

from .base import BasePracticeStrategy
from .registry import register_strategy


@register_strategy
class DailyPracticeStrategy(BasePracticeStrategy):
    """日常练习策略"""

    @classmethod
    def get_slug(cls) -> str:
        return "daily_practice"

    async def load_context(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载日常练习上下文

        目前返回空，后续可集成学生学习数据。
        """
        logger.info("加载日常练习上下文数据")
        return {}

    async def build_prompt(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建日常练习 Prompt"""
        db: AsyncSession = state["db"]
        session = state["session"]
        textbook = state["textbook"]
        recall_questions = state.get("recall_questions", [])

        subject = textbook.subject
        grade = textbook.grade
        count = session.parameters.get("generate_count", 15)
        question_types = state.get("question_types", {})

        # 从 Practice 获取提示词模板
        practice = state.get("practice")
        if not practice or not practice.prompt:
            raise ValueError("日常练习提示词不存在")

        prompt = ChatPromptTemplate.from_template(practice.prompt)

        # JSON 输出解析器
        prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = prompt_parser.get_format_instructions()
        prompt = prompt.partial(format_instructions=format_instructions)

        # 计算题目分布
        remain_count = count - len(recall_questions)
        distribution = get_question_distribution(remain_count)

        # TODO: 后续集成真实学习数据
        prompt_input = {
            "grade": GRADE_NAME_MAP.get(grade, str(grade)),
            "count": remain_count,
            "question_types": build_question_types_prompt(question_types),
            "weak_knowledge_points": build_knowledges_prompt([]),
            "mastered_knowledge_points": build_knowledges_prompt([]),
            "challenge_knowledge_points": build_knowledges_prompt([]),
            "new_knowledge_points": build_knowledges_prompt([]),
            "review_units": build_units_prompt([]),
            "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
            **distribution,
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "prompt_parser": prompt_parser,
        }
