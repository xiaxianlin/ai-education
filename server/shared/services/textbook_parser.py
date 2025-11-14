"""
教材解析服务
功能：
1. 解析PDF文档内容，提取单元信息
2. 使用AI解析单元内容，提取单元和知识点数据
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF
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
    def parse_pdf_content(pdf_path: str) -> Dict[str, Any]:
        """
        解析PDF文档内容，提取文字和图片

        Args:
            pdf_path: PDF文件路径

        Returns:
            包含文本内容和图片信息的字典
        """
        if not os.path.exists(pdf_path):
            raise ValueError(f"PDF文件不存在: {pdf_path}")

        doc = fitz.open(pdf_path)
        pages_text = []
        pages_images = []

        logger.info(f"开始解析PDF: {pdf_path}，共{len(doc)}页")

        for page_num in range(len(doc)):
            page = doc[page_num]

            # 提取文本
            text = page.get_text()
            pages_text.append({"page": page_num + 1, "text": text})

            # 提取图片
            image_list = page.get_images()
            page_images = []
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]

                    # 保存图片到临时目录
                    tmp_dir = Path(envs.TMP_DIR) / "textbooks" / "images"
                    tmp_dir.mkdir(parents=True, exist_ok=True)
                    image_path = tmp_dir / f"page_{page_num + 1}_img_{img_index}.{image_ext}"

                    with open(image_path, "wb") as img_file:
                        img_file.write(image_bytes)

                    page_images.append(
                        {"index": img_index, "path": str(image_path), "ext": image_ext}
                    )
                except Exception as e:
                    logger.warning(f"提取第{page_num + 1}页第{img_index}张图片失败: {e}")

            pages_images.append({"page": page_num + 1, "images": page_images})

            if (page_num + 1) % 10 == 0:
                logger.info(f"已解析{page_num + 1}页")

        doc.close()

        logger.info(
            f"PDF解析完成，共提取{len(pages_text)}页文本，{sum(len(p['images']) for p in pages_images)}张图片"
        )

        return {
            "pages_text": pages_text,
            "pages_images": pages_images,
            "total_pages": len(pages_text),
        }

    @staticmethod
    def extract_units_from_pdf(pdf_content: Dict[str, Any]) -> List[UnitContent]:
        """
        从PDF内容中提取单元信息

        Args:
            pdf_content: PDF解析结果

        Returns:
            单元内容列表
        """
        pages_text = pdf_content["pages_text"]
        pages_images = pdf_content["pages_images"]

        # 简单的单元提取逻辑：根据标题模式识别单元
        # 这里可以根据实际需求调整提取逻辑
        units = []
        current_unit = None
        current_pages = []

        for page_info in pages_text:
            page_num = page_info["page"]
            text = page_info["text"].strip()

            # 查找单元标题（可以根据实际PDF格式调整）
            # 假设单元标题格式为：第X单元、Unit X、单元X等
            lines = text.split("\n")
            unit_title = None

            for line in lines[:5]:  # 只检查前5行
                line = line.strip()
                if any(keyword in line for keyword in ["第", "单元", "Unit", "unit"]):
                    # 检查是否是单元标题
                    if len(line) < 50:  # 单元标题通常较短
                        unit_title = line
                        break

            if unit_title:
                # 保存上一个单元
                if current_unit:
                    # 收集上一个单元的图片
                    unit_images = []
                    for page_img_info in pages_images:
                        if page_img_info["page"] in current_pages:
                            for img in page_img_info["images"]:
                                unit_images.append(img["path"])

                    units.append(
                        UnitContent(
                            unit_name=current_unit,
                            unit_content="\n".join(
                                [p["text"] for p in pages_text if p["page"] in current_pages]
                            ),
                            page_numbers=current_pages.copy(),
                            images=unit_images,
                        )
                    )

                # 开始新单元
                current_unit = unit_title
                current_pages = [page_num]
            else:
                # 继续当前单元
                if current_unit:
                    current_pages.append(page_num)

        # 保存最后一个单元
        if current_unit:
            # 收集当前单元的图片
            unit_images = []
            for page_img_info in pages_images:
                if page_img_info["page"] in current_pages:
                    for img in page_img_info["images"]:
                        unit_images.append(img["path"])

            units.append(
                UnitContent(
                    unit_name=current_unit,
                    unit_content="\n".join(
                        [p["text"] for p in pages_text if p["page"] in current_pages]
                    ),
                    page_numbers=current_pages.copy(),
                    images=unit_images,
                )
            )

        # 如果没有找到单元，将整个PDF作为一个单元
        if not units:
            all_images = []
            for page_img_info in pages_images:
                for img in page_img_info["images"]:
                    all_images.append(img["path"])

            units.append(
                UnitContent(
                    unit_name="完整教材",
                    unit_content="\n".join([p["text"] for p in pages_text]),
                    page_numbers=list(range(1, len(pages_text) + 1)),
                    images=all_images,
                )
            )

        logger.info(f"提取到{len(units)}个单元")
        return units

    @staticmethod
    async def parse_units_with_ai(units: List[UnitContent]) -> List[UnitInfo]:
        """
        使用AI解析单元内容，提取单元信息和知识点

        Args:
            units: 单元内容列表

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
                ("human", "请分析以下教材单元内容，提取单元信息和知识点：\n\n{units_content}"),
            ]
        )

        # 构建单元内容文本
        units_content = []
        for idx, unit in enumerate(units, 1):
            content = f"单元{idx}：{unit.unit_name}\n"
            content += f"内容：{unit.unit_content[:2000]}...\n"  # 限制长度避免超出token限制
            if unit.images:
                content += f"包含{len(unit.images)}张图片\n"
            units_content.append(content)

        prompt_input = {
            "units_content": "\n\n".join(units_content),
            "format_instructions": format_instructions,
        }

        # 调用LLM
        llm = ChatOpenAI(
            model_name="qwen3-max",
            temperature=0.3,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
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
                ("human", "请分析以下教材单元内容，提取单元信息和知识点：\n\n{units_content}"),
            ]
        )

        prompt_input = {
            "units_content": full_content,
            "format_instructions": format_instructions,
        }

        # 调用LLM
        llm = ChatOpenAI(
            model_name="qwen3-max",
            temperature=0.3,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
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
    async def parse_by_oss(oss_path: str, local_path: Optional[str] = None) -> List[UnitInfo]:
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

        logger.info(chunks)
        if not chunks:
            raise ValueError(f"未找到文件ID为 {file_id} 的切片数据")

        logger.info(f"共获取到 {len(chunks)} 个切片")

        # 合并所有切片内容
        full_content = "\n\n".join(chunks)

        # 使用AI解析单元信息
        parsed_units = await TextbookParser.parse_units_with_content(full_content)

        return parsed_units
