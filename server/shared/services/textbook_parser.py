"""
教材解析服务
功能：
1. 解析PDF文档内容，提取单元信息
2. 使用AI解析单元内容，提取单元和知识点数据
"""

import os
from pathlib import Path
from typing import List, Dict, Optional
from loguru import logger
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from core.settings import envs
from shared.provider.aliyun import AliyunOSS, AliyunRag


class UnitContent(BaseModel):
    """单元内容模型"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容（文本和图片描述）")
    page_numbers: List[int] = Field(description="单元所在页码列表", default=[])
    images: List[str] = Field(description="单元相关图片的本地路径列表", default=[])


class UnitInfo(BaseModel):
    """单元信息模型（AI解析后）"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容摘要")
    topics: List[Dict[str, str]] = Field(
        description="知识点列表，每个知识点包含topic_name和topic_content"
    )


class UnitExtractionResult(BaseModel):
    """单元提取结果"""

    units: List[UnitInfo] = Field(description="单元信息列表")


class TextbookParser:
    """教材解析服务"""

    @staticmethod
    async def parse_units_with_content(full_content: str) -> List[UnitInfo]:
        """
        使用AI解析单元内容，提取单元信息和知识点

        Args:
            full_content: 完整内容

        Returns:
            解析后的单元信息列表
        """
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

        # 调用LLM
        llm = ChatOpenAI(
            model_name="qwen3-max-preview",
            temperature=0.7,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base=envs.AI_PLATFORM_URL,
        )

        chain = prompt | llm | parser

        try:
            result = chain.invoke(prompt_input)
            logger.info("AI解析单元信息成功")

            # 验证结果
            if not isinstance(result, dict) or "units" not in result:
                raise ValueError("AI返回结果格式错误")

            validated_result = UnitExtractionResult.model_validate(result)
            return validated_result.units

        except Exception as e:
            logger.error(f"AI解析单元信息失败: {e}")
            raise ValueError(f"AI解析失败: {str(e)}")

    @staticmethod
    async def parse_by_oss(
        oss_path: str, local_path: Optional[str] = None
    ) -> List[UnitInfo]:
        """
        从OSS下载PDF文件并解析

        Args:
            oss_path: OSS文件路径
            local_path: 本地存储路径，如果不提供则自动生成

        Returns:
            解析后的单元信息列表
        """
        oss = AliyunOSS()

        if not oss.exist(oss_path):
            raise ValueError(f"OSS文件不存在: {oss_path}")

        # 生成本地路径
        if not local_path:
            file_name = os.path.basename(oss_path)
            tmp_dir = Path(envs.TMP_DIR) / "textbooks"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            local_path = str(tmp_dir / file_name)

        try:
            # 从OSS下载文件
            file_data = oss.get_file(oss_path)

            local_path_obj = Path(local_path)
            local_path_obj.parent.mkdir(parents=True, exist_ok=True)
            with open(local_path, "wb") as f:
                f.write(file_data)

            logger.info(f"PDF文件已从OSS下载到本地: {local_path}")

            # 解析PDF内容
            pdf_content = TextbookParser.parse_pdf_content(local_path)

            # 提取单元信息
            units = TextbookParser.extract_units_from_pdf(pdf_content)

            # 使用AI解析单元信息
            parsed_units = await TextbookParser.parse_units_with_ai(units)

            return parsed_units

        finally:
            # 清理临时文件
            if local_path and os.path.exists(local_path):
                os.remove(local_path)
                logger.info(f"已清理临时文件: {local_path}")

    @staticmethod
    async def parse_by_rag(file_id: str) -> List[UnitInfo]:
        """
        从RAG知识库获取切片数据并解析

        Args:
            file_id: 知识库中的文件ID

        Returns:
            解析后的单元信息列表
        """
        rag = AliyunRag()

        # 获取所有切片数据
        logger.info(f"开始从RAG知识库获取文件切片，file_id: {file_id}")
        chunks = rag.get_all_chunks(file_id=file_id)

        if not chunks:
            raise ValueError(f"未找到文件ID为 {file_id} 的切片数据")

        # 合并所有切片内容
        full_content = "\n\n".join(chunks)

        # 使用AI解析单元信息
        parsed_units = await TextbookParser.parse_units_with_content(full_content)

        return parsed_units
