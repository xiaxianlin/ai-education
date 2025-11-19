"""能力评估 Prompt 构建"""
from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate

from shared.question.types import QuestionGenerationState
from shared.ai.prompts.question import get_prompt_by_subject
from shared.question.prompts.common import build_assessment_prompt_inputs


async def build_assessment_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建能力评估的prompt"""
    # 能力评测不需要单元和知识点信息，只需要基础的科目、年级、学期
    textbook = state["textbook"]
    count = state["count"]
    recalled_questions_info = state.get("recalled_questions_info", "")

    assessment_prompt_input, parser = build_assessment_prompt_inputs(
        textbook, count, recalled_questions_info
    )

    # 根据科目自动选择对应的 prompt 模板
    assessment_prompt_template = get_prompt_by_subject("assessment", textbook.subject)
    
    # 如果有避免重复的提示，追加到模板末尾
    avoid_duplicate_hint = assessment_prompt_input.get("avoid_duplicate_hint", "")
    if avoid_duplicate_hint:
        assessment_prompt_template = assessment_prompt_template + avoid_duplicate_hint

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的测评设计师，精通IRT（项目反应理论）自适应评测。"
                "你的任务是生成具有良好区分度的题目，用于评估学生在该年级的整体能力水平。"
                "题目应覆盖该年级的核心能力维度，不局限于特定单元或知识点。"
                "请确保题目答案唯一、便于判分、能力维度覆盖均衡。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", assessment_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": assessment_prompt_input,
        "parser": parser,
        "prompt_template": assessment_prompt_template,
    }

