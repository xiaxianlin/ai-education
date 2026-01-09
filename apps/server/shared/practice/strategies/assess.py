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

        subject = session.subject or ""
        grade = session.grade or 0
        count = state.get("generate_count", 18)
        question_types = state.get("question_types", {})

        # 使用默认提示词模板（Practice 表已删除）
        default_prompt_template = """请为{grade}年级学生生成{count}道{subject}科目的综合评估题目。
        
知识点范围：{knowledge_text}

要求：
1. 题目难度分布：简单{simple_count}道，中等{medium_count}道，困难{hard_count}道
2. 题目类型分布：{question_types}
3. 避免重复题目：{avoid_duplicate_hint}
4. 题目应全面评估学生的知识掌握情况

{format_instructions}"""
        
        prompt = ChatPromptTemplate.from_template(default_prompt_template)

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
