from langchain_core.output_parsers import JsonOutputParser
from loguru import logger
from shared.core.schema import QuestionSchema
from shared.util.ai import get_langchain_client
from shared.util.prompt import get_question_generate_prompt


def generate_question_workflow(code: str, input_params: dict):
    """生成题目"""

    llm = get_langchain_client()
    prompt = get_question_generate_prompt(code)
    parser = JsonOutputParser(pydantic_object=QuestionSchema)

    chain = prompt | llm | parser

    result = chain.invoke({**input_params, "format_instructions": parser.get_format_instructions()})
    logger.info(f"生成题目结果: {result}")
    return result
