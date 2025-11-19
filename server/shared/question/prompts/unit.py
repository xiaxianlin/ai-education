"""单元练习 Prompt 构建"""
from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate

from shared.question.types import QuestionGenerationState
from shared.ai.prompts.question import get_prompt_by_subject
from shared.question.prompts.common import build_common_prompt_inputs


async def build_unit_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元练习的prompt"""
    prompt_input, parser = build_common_prompt_inputs(state)

    # 根据科目自动选择对应的 prompt 模板
    textbook = state["textbook"]
    unit_prompt_template = get_prompt_by_subject("unit", textbook.subject)
    
    # 如果有避免重复的提示，追加到模板末尾
    avoid_duplicate_hint = prompt_input.get("avoid_duplicate_hint", "")
    if avoid_duplicate_hint:
        unit_prompt_template = unit_prompt_template + avoid_duplicate_hint

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。"
                "你的目标是生成高质量、符合学生认知水平、紧扣知识点的题目。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", unit_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
        "prompt_template": unit_prompt_template,
    }

