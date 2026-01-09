"""能力练习策略

基于原子能力 code 列表生成练习题目。
"""

from typing import Any, Dict, List

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.constants import GRADE_NAME_MAP
from shared.core.database import AbilityAtomic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.generation.question.schema import QuestionGenerationResult, QuestionGenerationState
from shared.generation.question.services.prompt import (
    build_avoid_duplicate_prompt,
    build_question_types_prompt,
)
from .base import BasePracticeStrategy
from .registry import register_strategy


@register_strategy
class AbilityPracticeStrategy(BasePracticeStrategy):
    """能力练习策略
    
    基于原子能力 code 列表生成练习题目。
    """

    @classmethod
    def get_slug(cls) -> str:
        return "ability_practice"

    async def load_context(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载能力练习上下文（原子能力信息）"""
        db: AsyncSession = state["db"]
        session = state["session"]
        parameters = session.parameters or {}

        ability_codes = parameters.get("ability_codes", [])
        subject = parameters.get("subject", "")
        grade = parameters.get("grade", 0)

        if not ability_codes:
            raise ValueError("原子能力 code 列表不能为空")

        # 查询原子能力信息
        abilities = await db.scalars(
            select(AbilityAtomic).where(
                AbilityAtomic.code.in_(ability_codes),
                AbilityAtomic.subject == subject,
                AbilityAtomic.grade == grade,
                AbilityAtomic.is_active == 1,
            )
        )
        ability_list = list(abilities.all())

        if not ability_list:
            raise ValueError(f"未找到有效的原子能力: codes={ability_codes}")

        logger.info(
            f"加载能力练习上下文: ability_codes={ability_codes}, "
            f"found={len(ability_list)}, subject={subject}, grade={grade}"
        )

        return {
            "abilities": ability_list,
            "ability_codes": ability_codes,
            "subject": subject,
            "grade": grade,
        }

    async def build_prompt(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建能力练习 Prompt"""
        session = state["session"]
        abilities: List[AbilityAtomic] = state.get("abilities", [])
        recall_questions = state.get("recall_questions", [])
        question_types = state.get("question_types", {})

        parameters = session.parameters or {}
        subject = parameters.get("subject", "")
        grade = parameters.get("grade", 0)
        count = parameters.get("generate_count", 15)

        # 构建能力信息
        ability_info_list = []
        for ability in abilities:
            ability_info_list.append(f"- {ability.name}: {ability.description or ''}")
        ability_text = "\n".join(ability_info_list) if ability_info_list else "综合能力"

        # 使用提示词模板
        prompt_template = """请为{grade}年级学生生成{count}道{subject}科目的能力练习题目。

目标能力：
{ability_text}

要求：
1. 题目难度应适中，符合该年级学生的认知水平
2. 题目类型分布：{question_types}
3. 避免重复题目：{avoid_duplicate_hint}
4. 题目应能有效评估目标能力的掌握程度
5. 难度分布：简单 30%，中等 50%，困难 20%

{format_instructions}"""

        prompt = ChatPromptTemplate.from_template(prompt_template)

        # JSON 输出解析器
        prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = prompt_parser.get_format_instructions()
        prompt = prompt.partial(format_instructions=format_instructions)

        prompt_input = {
            "grade": GRADE_NAME_MAP.get(grade, str(grade)),
            "count": count - len(recall_questions),
            "subject": subject,
            "ability_text": ability_text,
            "question_types": build_question_types_prompt(question_types),
            "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "prompt_parser": prompt_parser,
        }

    def get_difficulty_distribution(self, count: int) -> Dict[str, int]:
        """能力练习使用标准难度分布"""
        easy = max(1, int(count * 0.3))
        medium = max(1, int(count * 0.5))
        hard = count - easy - medium
        return {"easy": easy, "medium": medium, "hard": hard}
