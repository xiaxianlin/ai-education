"""日常练习服务

本模块负责个性化日常练习题目生成的业务逻辑：
- 参数验证
- 数据加载（学生学习数据）
- Prompt 构建（基于教材和学生学习数据）
"""

from typing import Any, Dict

from generation.question.schema import QuestionGenerationResult, QuestionGenerationState
from generation.question.services.prompt import (
    build_avoid_duplicate_prompt,
    build_knowledges_prompt,
    build_question_types_prompt,
    build_units_prompt,
)
from generation.question.services.question import get_question_distribution
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from shared.core.constants import GRADE_NAME_MAP
from shared.core.database import PracticePrompt
from sqlalchemy import joinedload, select
from sqlalchemy.ext.asyncio import AsyncSession


async def load_data(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载日常练习所需的上下文数据"""
    return {}


async def build_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建日常练习的 Prompt"""
    db: AsyncSession = state["db"]
    session = state["session"]
    textbook = state["textbook"]
    recall_questions = state.get("recall_questions", [])

    subject = textbook.subject
    grade = textbook.grade
    count = session.parameters.get("generate_count", 0)
    question_types = session.parameters.get("question_types", {})

    # 异步查询 Prompt 实体，使用 provided db/grade/subject
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .where(
            PracticePrompt.subject == subject,
            PracticePrompt.grade == grade,
            PracticePrompt.practice_slug == "daily_practice",
        )
        .options(joinedload(PracticePrompt.prompt))
    )

    if not practice_prompt or not practice_prompt.prompt.template_content:
        raise ValueError("日常练习提示词不存在")

    prompt = ChatPromptTemplate.from_template(practice_prompt.prompt.template_content)

    # 构建 JSON 输出解析器
    prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = prompt_parser.get_format_instructions()
    prompt = prompt.partial(format_instructions=format_instructions)

    # 简化学生学习数据获取（server-ai 中可能没有 StudentService）
    # 这里先使用空列表，后续可以通过 API 调用 server-api 获取
    weak_knowledge_points = []
    mastered_knowledge_points = []
    challenge_knowledge_points = []
    new_knowledge_points = []
    review_units = []

    # 计算题目分布（扣除召回的题目数量）
    remain_count = count - len(recall_questions)
    distribution = get_question_distribution(remain_count)

    # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
    prompt_input = {
        "grade": GRADE_NAME_MAP[grade],
        "count": remain_count,
        "question_types": build_question_types_prompt(question_types),
        "weak_knowledge_points": build_knowledges_prompt(weak_knowledge_points),
        "mastered_knowledge_points": build_knowledges_prompt(mastered_knowledge_points),
        "challenge_knowledge_points": build_knowledges_prompt(challenge_knowledge_points),
        "new_knowledge_points": build_knowledges_prompt(new_knowledge_points),
        "review_units": build_units_prompt(review_units),
        "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
        **distribution,  # 包含 wrong_count, mastered_count, challenge_count, new_count
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "prompt_parser": prompt_parser,
    }
