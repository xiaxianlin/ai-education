import fitz
from typing import List, Dict, Any
from ai.models.factory import ModelFactory
from core import get_logger
from ai.prompts.pdf import PDF_EXTRACT_SYSTEM_PROMPT, get_pdf_extract_prompt


class PDFProcessor:
    """PDF处理器，负责提取文本和图像，并通过AI识别单元结构"""

    def __init__(self):
        self.logger = get_logger("PDFProcessor")
        self.vision_model = ModelFactory.get_vision_provider()
        self.llm_model = ModelFactory.get_llm_provider()

    def _extract_pdf_pages(self, pdf_path: str) -> List[bytes]:
        """提取PDF页面为图像数据"""
        images = []

        try:
            doc = fitz.open(pdf_path)

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)

                # 转换为图像 (300 DPI)
                mat = fitz.Matrix(2.0, 2.0)  # 放大2倍提高清晰度
                pix = page.get_pixmap(matrix=mat)

                # 转换为PNG字节数据
                img_data = pix.tobytes("png")
                images.append(img_data)

            doc.close()
            return images

        except Exception as e:
            self.logger.error(f"Error extracting PDF pages: {str(e)}")
            raise

    async def extract_units_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """从PDF中提取课程单元信息"""
        try:
            # 1. 提取PDF页面为图像
            images = self._extract_pdf_pages(pdf_path)

            # 2. 批量OCR识别文本
            page_texts = []
            for i, image_data in enumerate(images):
                self.logger.info(f"Processing page {i+1}/{len(images)}")
                text = await self.vision_model.ocr(image_data)
                page_texts.append({"page": i + 1, "text": text})

            # 3. 使用LLM分析单元结构
            units = await self._analyze_unit_structure(page_texts)

            return units

        except Exception as e:
            self.logger.error(f"Error processing PDF {pdf_path}: {str(e)}")
            raise

    async def _analyze_unit_structure(
        self, page_texts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """使用LLM分析单元结构"""

        # 合并所有页面文本
        full_text = "\n\n".join([f"第{page['page']}页:\n{page['text']}" for page in page_texts])

        # 构建分析提示词
        prompt = get_pdf_extract_prompt(full_text)

        messages = [
            {"role": "system", "content": PDF_EXTRACT_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.llm_model.chat(messages)

            # 尝试解析JSON响应
            import json

            # 提取JSON部分
            start_idx = response.find("[")
            end_idx = response.rfind("]") + 1

            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                units = json.loads(json_str)

                # 验证和清理数据
                cleaned_units = []
                for unit in units:
                    if isinstance(unit, dict) and "name" in unit and "content" in unit:
                        cleaned_units.append(
                            {
                                "name": str(unit.get("name", "")).strip(),
                                "content": str(unit.get("content", "")).strip(),
                                "start_page": unit.get("start_page", 1),
                                "end_page": unit.get("end_page", 1),
                            }
                        )

                return cleaned_units
            else:
                self.logger.warning("Could not extract JSON from LLM response")
                return []

        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
            return []
        except Exception as e:
            self.logger.error(f"Error analyzing unit structure: {str(e)}")
            return []
