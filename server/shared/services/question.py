import asyncio
import json
from typing import List

from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.constants import QUESTION_TYPES
from common.database import Knowledge, Question, Textbook, Unit
from common.settings import envs

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from shared.schema import QuestionGenerationResult, QuestionOption


async def generate_question_by_unit(db: AsyncSession, unit_id: int, count: int) -> List[dict]:
    """根据单元 ID 生成指定数量的题目并入库。"""

    if count <= 0:
        raise ValueError("生成题目的数量必须大于 0")

    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("课程单元不存在")

    textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    knowledge_rows = await db.scalars(
        select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
    )
    knowledge_list = knowledge_rows.all()

    knowledge_lines = []
    for item in knowledge_list:
        snippet = item.content.strip() if item.content else ""
        if len(snippet) > 200:
            snippet = snippet[:200] + "..."
        knowledge_lines.append(f"- {item.name}: {snippet}")

    knowledge_text = "\n".join(knowledge_lines) if knowledge_lines else "(未提供知识点)"

    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            (
                "human",
                """
学科：{subject}
年级：{grade}
学期：{semester}
题型：{question_types}
单元名称：{unit_name}
单元概要：{unit_summary}
知识点：
{knowledge_text}

请基于上述信息生成 {count} 道符合条件的题目，并确保：
1. 题目紧扣单元与知识点；
2. 难度与年级匹配；
3. 输出为合法 JSON；
4. 根据知识点从题型中匹配相关题型，并随机选择
4. 若题型为选择题，提供 4 个选项并标明正确答案；
5. 其他题型提供完整答案与解析；
6. 难度字段从“简单”、“轻松”、“中等”、“较难”、“困难”中选择。
""",
            ),
        ]
    )

    llm = ChatOpenAI(
        model_name=envs.ALIYUN_LLM_MODEL,
        temperature=0.7,
        openai_api_key=envs.ALIYUN_AI_KEY,
        openai_api_base=envs.ALIYUN_AI_BASE_URL,
    )
    chain = prompt | llm | parser
    result = chain.invoke(
        {
            "subject": textbook.subject,
            "grade": textbook.grade,
            "semester": textbook.semester,
            "question_types": QUESTION_TYPES,
            "unit_name": unit.name,
            "unit_summary": unit.content or "",
            "knowledge_text": knowledge_text,
            "count": count,
            "format_instructions": format_instructions,
        }
    )

    result = QuestionGenerationResult.model_validate(result)

    questions: List[Question] = []
    for item in result.questions:
        question_type = item.question_type
        if question_type not in QUESTION_TYPES:
            logger.warning(f"生成的题型 {question_type} 不在预期列表中，将使用默认题型")
            question_type = QUESTION_TYPES[0]

        questions.append(
            Question(
                subject=textbook.subject,
                grade=textbook.grade,
                type=question_type,
                content=item.question,
                options=TypeAdapter(List[QuestionOption])
                .dump_json(item.options, by_alias=True, exclude_none=True)
                .decode(),
                answer=item.answer,
                difficulty=item.difficulty,
                textbook_id=textbook.id,
                unit_id=unit.id,
                knowledge_id=None,
            )
        )

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    db.add_all(questions)
    await db.commit()
    return questions
