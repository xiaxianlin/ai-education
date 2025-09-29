from typing import List

from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from common.constants import QUESTION_TYPES
from common.database import Knowledge, Textbook, Unit
from common.settings import envs

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI


class _QuestionOption(BaseModel):
    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class _GeneratedQuestion(BaseModel):
    question_type: str = Field(description="题型")
    question: str = Field(description="题干内容")
    options: List[_QuestionOption] = Field(description="题目选项列表，非选择题时可为空数组")
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度，如 简单/中等/较难")


class _QuestionGenerationResult(BaseModel):
    questions: List[_GeneratedQuestion]


async def generate_question_by_unit(db: AsyncSession, unit_id: int, count: int) -> List[dict]:
    """根据单元 ID 成指定数量的题目。"""

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

    parser = JsonOutputParser(pydantic_object=_QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                "你是一名专业教研员，负责根据教材内容命题。请严格按照 {format_instructions} 生成 JSON 输出。"
            ),
            HumanMessage(
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
6. 难度字段从“简单”、“中等”、“较难”中选择。
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

    inputs = {
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
    logger.info(prompt.invoke(inputs).to_string())
    result = chain.invoke(inputs)
    logger.info(result)
    return [question for question in result.get("questions")]
