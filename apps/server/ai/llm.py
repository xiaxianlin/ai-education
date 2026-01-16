from typing import Optional

from langchain_core.output_parsers import BaseOutputParser
from langchain_openai import ChatOpenAI, ChatPromptTemplate
from shared.core.logger import logger
from shared.core.settings import envs


async def call_llm_chain(
    prompt: ChatPromptTemplate,
    parser: Optional[BaseOutputParser] = None,
    prompt_input: dict = {},
    **kwargs,
) -> str | dict:
    """调用 LangChain 链式调用"""
    try:
        client = ChatOpenAI(
            model_name=envs.LLM_MODEL_NAME,
            openai_api_key=envs.LLM_API_KEY,
            openai_api_base=envs.LLM_API_BASE,
            **kwargs,
        )

        if parser:
            client = prompt | client | parser
        else:
            client = prompt | client

        result = await client.ainvoke(prompt_input)

        # 如果有 parser，返回解析后的结果（dict）；否则返回 content
        if parser:
            return result
        return result.content if hasattr(result, "content") else result

    except Exception as e:
        logger.error(f"LangChain 链式调用失败: {e}", exc_info=True)
        raise ValueError(f"LangChain 链式调用失败: {str(e)}")
