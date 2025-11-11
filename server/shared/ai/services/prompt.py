"""
提示词优化服务
"""
import re
from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from core.settings import envs
from shared.ai.prompts.image import IMAGE_GENERATION_PROMPT
from shared.ai.prompts.question import PROMPT_OPTIMIZATION_INSTRUCTION


class PromptOptimizationService:
    """提示词优化服务"""

    # LLM 配置常量
    _LLM_MODEL = "qwen-plus-latest"
    _LLM_TEMPERATURE = 0.3
    _LLM_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    @classmethod
    def _create_llm(cls) -> ChatOpenAI:
        """创建 LLM 实例"""
        return ChatOpenAI(
            model_name=cls._LLM_MODEL,
            temperature=cls._LLM_TEMPERATURE,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base=cls._LLM_BASE_URL,
        )

    @staticmethod
    def _clean_markdown(text: str) -> str:
        """
        清理 markdown 代码块标记
        
        Args:
            text: 原始文本
        
        Returns:
            清理后的文本
        """
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        return text

    @staticmethod
    def _fix_placeholder_format(text: str) -> str:
        """
        修复占位符格式，将 JSON 格式占位符转换为标准格式
        
        Args:
            text: 原始文本
        
        Returns:
            修复后的文本
        """
        # 处理多行 JSON 格式：{\n  "subject"} -> {subject}
        text = re.sub(
            r'\{\s*\n\s*["\'](\w+)["\']\s*\}', r'{\1}', text, flags=re.MULTILINE
        )
        # 处理单行 JSON 格式：{"subject"} -> {subject}
        text = re.sub(r'\{\s*["\'](\w+)["\']\s*\}', r'{\1}', text)
        return text

    @classmethod
    def _optimize_with_llm(
        cls, prompt_template: ChatPromptTemplate, input_data: dict[str, Any]
    ) -> str:
        """
        使用 LLM 优化提示词（通用方法）
        
        Args:
            prompt_template: Prompt 模板
            input_data: 输入数据
        
        Returns:
            优化后的文本
        """
        llm = cls._create_llm()
        chain = prompt_template | llm
        result = chain.invoke(input_data)
        return cls._clean_markdown(result.content)

    @staticmethod
    def optimize_image_prompt(question_content: str) -> str:
        """
        优化图片生成提示词
        
        将问题内容转换为适合图片生成的提示词
        
        Args:
            question_content: 问题内容
        
        Returns:
            优化后的图片生成提示词
        """
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "你是一名专业的图片生成提示词工程师。"),
            ("human", IMAGE_GENERATION_PROMPT),
        ])

        return PromptOptimizationService._optimize_with_llm(
            prompt_template, {"question_content": question_content}
        )

    @staticmethod
    def optimize_question_prompt(original_prompt_text: str) -> str:
        """
        优化问题生成 Prompt
        
        优化问题生成的 prompt，使其更清晰、更有效，同时保留所有变量占位符
        
        Args:
            original_prompt_text: 原始 prompt 文本（已填充变量）
        
        Returns:
            优化后的 prompt 文本（保留变量占位符）
        """
        optimization_instruction = (
            PROMPT_OPTIMIZATION_INSTRUCTION
            + "\n\n重要要求：\n"
            + "1. 优化后的 Prompt 必须保留所有变量占位符，格式为：{{subject}}、{{grade}}、{{semester}}、{{question_types}}、{{unit_name}}、{{unit_summary}}、{{knowledge_text}}、{{count}}\n"
            + "2. 占位符必须使用单大括号格式，例如 {{subject}}，不要使用 JSON 格式或其他格式\n"
            + "3. 不要将占位符替换为具体值，保持占位符原样\n"
            + "4. 优化后的文本应该可以直接用于 Python 的 .format() 方法"
        )

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", optimization_instruction),
            (
                "human",
                "请优化以下 Prompt（必须保留所有变量占位符，格式为 {{variable_name}}）：\n\n{original_prompt}\n\n注意：优化后的 Prompt 必须保留所有 {{variable}} 格式的占位符，不要使用 JSON 格式。",
            ),
        ])

        optimized_text = PromptOptimizationService._optimize_with_llm(
            prompt_template, {"original_prompt": original_prompt_text}
        )

        # 修复占位符格式
        return PromptOptimizationService._fix_placeholder_format(optimized_text)

