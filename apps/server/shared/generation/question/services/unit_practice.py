"""单元练习服务

本模块负责单元练习题目生成的业务逻辑：
- 参数验证
- 数据加载（单元、知识点）
- Prompt 构建（基于教材和单元知识点）

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


async def load_data(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载单元练习所需的上下文数据"""
    db: AsyncSession = state["db"]
    units = state["units"]
    session = state["session"]
    unit_id = session.parameters.get("unit_id", 0)
    unit = next((u for u in units if u.id == unit_id), None)
    if not unit:
        raise ValueError("单元不存在")

    knowledges = (await db.scalars(select(Knowledge).where(Knowledge.unit_id == unit.id))).all()
    return {"unit": unit, "knowledges": knowledges}


async def build_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元练习的 Prompt"""
    db: AsyncSession = state["db"]
    session = state["session"]
    unit = state["unit"]
    knowledges = state["knowledges"]
    recall_questions = state.get("recall_questions", [])

    subject = session.parameters.get("subject", "")
    grade = session.parameters.get("grade", 0)
    count = session.parameters.get("generate_count", 0)
    question_types = session.parameters.get("question_types", {})

    # 根据年级、学科去查询关联到的 Prompt 实体（数据查询）

    # 异步查询 Prompt 实体，使用 provided db/grade/subject
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .where(
            PracticePrompt.subject == subject,
            PracticePrompt.grade == grade,
            PracticePrompt.practice_slug == "unit_practice",
        )
        .options(joinedload(PracticePrompt.prompt))
    )

    if not practice_prompt or not practice_prompt.prompt.template_content:
        raise ValueError("单元练习提示词不存在")

    prompt = ChatPromptTemplate.from_template(practice_prompt.prompt.template_content)

    # 构建 JSON 输出解析器
    prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = prompt_parser.get_format_instructions()
    prompt = prompt.partial(format_instructions=format_instructions)

    # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
    prompt_input = {
        "grade": GRADE_NAME_MAP[grade],
        "unit_name": unit.name,
        "unit_summary": unit.content,
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
