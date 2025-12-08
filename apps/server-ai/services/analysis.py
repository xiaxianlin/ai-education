from typing import List
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import (
    Question,
    PracticeSession,
    PracticeAnswer,
    PracticeWrongRecord,
)
from core.schema import TextAnswerAnalysisResponse
from utils import llm


ANALYSIS_PROMPT = """
请分析以下学生答题情况：

题目：{content}
选项：{options}
知识点：{knowledge}
参考答案：{question_answer}
学生答案：{student_answer}

请按照以下步骤进行分析：

第一步：判断答案正确性
请仔细判断学生的答案是否正确。判断标准：
- 如果答案在语义、逻辑、数值上与参考答案一致，即使表达方式不同，也应判定为正确
- 考虑答案的格式差异（如：小数、分数、百分数的不同表示方式）
- 对于选择题，如果学生选择了与参考答案等价的选项，应判定为正确
- 对于填空题或计算题，如果数值正确但单位或格式略有不同，需要根据题目要求判断

第二步：给出分析结果
根据判断结果，提供相应的分析：

【如果答案正确】
1. 肯定学生的答案，给予鼓励
2. 简要说明答案的正确性
3. 可以适当补充相关知识点或解题思路的进一步说明
4. 字数控制在100-150字

【如果答案错误】
1. 明确指出答案错误
2. 分析学生为什么会答错（可能的原因，如：概念理解错误、计算失误、审题不清等）
3. 解释相关知识点，帮助学生理解正确思路
4. 提供如何避免类似错误的建议
5. 字数控制在200字以内

要求：
- 语言简洁明了，适合学生阅读
- 语气温和鼓励，避免打击学生积极性
- 重点突出知识点和解题思路
- 如果答案正确，要给予肯定和鼓励
- 如果答案错误，要明确指出问题并提供改进建议

请严格按照以下JSON格式返回结果：
{format_instructions}
"""


async def text_answer_analysis(question: Question, text_answer: str):
    logger.info(
        f"开始分析答题情况: content_length={len(question.content)}, text_answer={text_answer}"
    )

    # 创建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=TextAnswerAnalysisResponse)

    # 格式化提示词
    analysis_prompt = ANALYSIS_PROMPT.format(
        content=question.content,
        options=question.options if question.options else "无",
        knowledge=question.knowledge if question.knowledge else "无",
        question_answer=question.answer,
        student_answer=text_answer,
        format_instructions=parser.get_format_instructions(),
    )

    prompt = ChatPromptTemplate.from_messages([("user", analysis_prompt)])
    client = llm.get_chat_client()
    chain = prompt | client | parser
    result = await chain.ainvoke({})

    # 验证结果
    if not isinstance(result, dict):
        raise ValueError(f"LLM 返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 解析结果
    analysis_result = TextAnswerAnalysisResponse.model_validate(result)

    return analysis_result


def practice_report_analysis(
    db: AsyncSession,
    session: PracticeSession,
    answers: List[PracticeAnswer],
    wrong_records: List[PracticeWrongRecord],
) -> int:
    pass
