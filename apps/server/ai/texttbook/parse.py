from typing import List
from loguru import logger
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from ai.utils import rag
from ai.schema import UnitInfo, UnitExtractionResult
from shared.provider import get_provider


async def parse_textbook_units(file_index_id: str) -> List[UnitInfo]:
    """
    从RAG知识库获取文件索引数据并解析

    Args:
        file_index_id: 知识库中的文件索引ID

    Returns:
        解析后的文件索引信息列表
    """

    # 获取所有切片数据
    logger.info(f"开始从RAG知识库获取文件切片，file_index_id: {file_index_id}")
    chunks = rag.get_all_chunks(file_id=file_index_id)

    if not chunks:
        raise ValueError(f"未找到文件索引ID为 {file_index_id} 的切片数据")

    # 合并所有切片内容
    full_content = "\n\n".join(chunks)

    parser = JsonOutputParser(pydantic_object=UnitExtractionResult)
    format_instructions = parser.get_format_instructions()

    # 构建prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的教材分析专家，擅长从教材内容中提取单元信息和知识点。"
                "请仔细分析每个单元的内容，提取出单元名称、单元内容摘要，以及该单元包含的知识点。"
                "每个知识点应包含知识点名称（topic_name）和知识点内容（topic_content）。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            (
                "human",
                "请分析以下教材单元内容，提取单元信息和知识点：\n\n{units_content}",
            ),
        ]
    )

    prompt_input = {
        "units_content": full_content,
        "format_instructions": format_instructions,
    }

    provider = get_provider()

    try:
        result = provider.invoke_chain(
            prompt=prompt,
            parser=parser,
            prompt_input=prompt_input,
        )
        logger.info("AI解析单元信息成功")

        # 验证结果
        if not isinstance(result, dict) or "units" not in result:
            raise ValueError("AI返回结果格式错误")

        validated_result = UnitExtractionResult.model_validate(result)
        return validated_result.units

    except Exception as e:
        logger.error(f"AI解析单元信息失败: {e}")
        raise ValueError(f"AI解析失败: {str(e)}")
