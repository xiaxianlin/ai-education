from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate
from loguru import logger

# prompts 目录路径
PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompt"


def get_question_generate_prompt_template(code: str) -> str:
    """读取 input.md 提示词文件并返回模板字符串

    Returns:
        str: 提示词模板字符串，包含 {subject}, {stage}, {count}, {unit_content}, {format_instructions} 等占位符

    Raises:
        FileNotFoundError: 如果 input.md 文件不存在
    """
    file_path = PROMPTS_DIR / f"{code}.md"
    if not file_path.exists():
        logger.error(f"提示词文件不存在: {file_path}")
        raise FileNotFoundError(f"提示词文件不存在: {file_path}")

    logger.info(f"读取提示词文件: {file_path}")
    return file_path.read_text(encoding="utf-8")


def get_question_generate_prompt(code: str) -> ChatPromptTemplate:
    """创建题目生成提示词模板

    使用 ChatPromptTemplate.from_template 创建提示词模板对象。
    模板包含以下占位符：
    - {subject}: 学科
    - {stage}: 学段
    - {count}: 题目数量
    - {unit_content}: 单元内容
    - {format_instructions}: 输出格式说明

    Returns:
        ChatPromptTemplate: LangChain 提示词模板对象

    Example:
        ```python
        from shared.util.prompt import create_question_generate_prompt
        from langchain_core.output_parsers import JsonOutputParser

        # 创建提示词模板
        prompt = create_question_generate_prompt("input")

        # 创建输出解析器（可选）
        parser = JsonOutputParser()

        # 准备输入参数
        prompt_input = {
            "subject": "语文",
            "stage": "小学低年级",
            "count": 5,
            "unit_content": "第一单元：春天的故事...",
            "format_instructions": parser.get_format_instructions(),
        }

        # 使用 call_llm_chain 调用
        from ai.llm import call_llm_chain
        result = await call_llm_chain(prompt, parser=parser, prompt_input=prompt_input)
        ```
    """
    template_str = get_question_generate_prompt_template(code)
    return ChatPromptTemplate.from_template(template_str)
