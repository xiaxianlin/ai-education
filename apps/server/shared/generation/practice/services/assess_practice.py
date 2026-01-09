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
from shared.core.database import Knowledge
from sqlalchemy.ext.asyncio import AsyncSession

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
    knowledges = (await db.scalars(select(Knowledge).where(Knowledge.textbook_id == textbook.id))).all()
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
