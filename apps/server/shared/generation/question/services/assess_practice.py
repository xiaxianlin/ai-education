"""综合评估服务

本模块负责IRT综合评估题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、全部知识点）
- Prompt 构建（基于教材和知识点）
"""

from typing import Any, Dict

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from shared.core.constants import GRADE_NAME_MAP
from shared.core.database import Knowledge, PracticePrompt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..schema import QuestionGenerationResult, QuestionGenerationState
from ..services.prompt import (
    build_avoid_duplicate_prompt,
    build_knowledges_prompt,
    build_question_types_prompt,
)
from ..services.question import get_difficulty_distribution


async def load_data(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载综合评估所需的上下文数据"""
    db: AsyncSession = state["db"]
    textbook = state["textbook"]

    # 加载教材的所有知识点
    knowledges = (
        await db.scalars(select(Knowledge).where(Knowledge.textbook_id == textbook.id))
    ).all()
    return {"knowledges": knowledges}


async def build_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建综合评估的 Prompt"""
    db: AsyncSession = state["db"]
    session = state["session"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])

    subject = session.parameters.get("subject", "")
    grade = session.parameters.get("grade", 0)
    count = session.parameters.get("generate_count", 0)
    question_types = session.parameters.get("question_types", {})

    # 异步查询 Prompt 实体，使用 provided db/grade/subject
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .where(
            PracticePrompt.subject == subject,
            PracticePrompt.grade == grade,
            PracticePrompt.practice_slug == "assess_practice",
        )
        .options(joinedload(PracticePrompt.prompt))
    )

    if not practice_prompt or not practice_prompt.prompt.template_content:
        raise ValueError("综合评估提示词不存在")

    prompt = ChatPromptTemplate.from_template(practice_prompt.prompt.template_content)

    # 构建 JSON 输出解析器
    prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = prompt_parser.get_format_instructions()
    prompt = prompt.partial(format_instructions=format_instructions)

    remain_count = count - len(recall_questions)
    # 计算难度分布
    distribution = get_difficulty_distribution(remain_count)

    # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
    prompt_input = {
        "grade": GRADE_NAME_MAP[grade],
        "count": remain_count,
        "question_types": build_question_types_prompt(question_types),
        "knowledge_text": build_knowledges_prompt([k.name for k in knowledges]),
        "avoid_duplicate_hint": build_avoid_duplicate_prompt(recall_questions),
        **distribution,  # 包含 simple_count, medium_count, hard_count
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "prompt_parser": prompt_parser,
    }
