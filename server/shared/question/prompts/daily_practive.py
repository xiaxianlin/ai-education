"""今日练习 Prompt 构建"""
from typing import Any, Dict
from loguru import logger

from langchain_core.prompts import ChatPromptTemplate

from shared.question.types import QuestionGenerationState
from shared.ai.prompts.question import get_prompt_by_subject
from shared.question.prompts.common import (
    build_common_prompt_inputs,
    format_weak_knowledge_analysis,
    format_mastered_knowledge,
    format_review_reminder,
    format_new_knowledge,
)


async def build_daily_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建今日练习的prompt"""
    prompt_input, parser = build_common_prompt_inputs(state)

    # 从参数中获取学生相关信息
    student_id = state.get("student_id")
    textbook_id = state.get("textbook_id")
    db = state.get("db")

    # 初始化默认值（简化：不再使用复杂的掌握度计算）
    weak_knowledge_points = []
    mastered_knowledge = []
    review_units = []

    # 如果有学生数据，可以考虑从 PracticeReport 中获取基本统计信息
    # 暂时使用默认策略，保持向后兼容
    if student_id and textbook_id and db:
        try:
            # 可以考虑从 PracticeReport 中获取学习统计，但暂时保持简单
            pass
        except Exception as e:
            logger.warning(f"加载学生学习数据失败，将使用默认策略: {e}")

    # 计算题目分布
    total_count = state["count"]
    wrong_count = max(1, int(total_count * 0.3))
    consolidation_count = int(total_count * 0.4)
    challenge_count = int(total_count * 0.2)
    new_count = total_count - wrong_count - consolidation_count - challenge_count

    # 如果没有真实数据，使用通用知识点
    knowledge_names = state.get("knowledge_names", "")
    if not weak_knowledge_points:
        weak_knowledge_points = knowledge_names.split("、")[:3] if knowledge_names else []
    if not mastered_knowledge:
        mastered_knowledge = knowledge_names.split("、")[3:8] if knowledge_names else []

    # 构建富文本的学生画像
    weak_knowledge_analysis = format_weak_knowledge_analysis(weak_knowledge_points)
    mastered_knowledge_list = format_mastered_knowledge(mastered_knowledge)
    review_units_reminder = format_review_reminder(review_units)
    new_knowledge_preview = format_new_knowledge(
        state.get("new_knowledge", mastered_knowledge[-3:] if mastered_knowledge else [])
    )

    daily_prompt_input = {
        **{
            k: prompt_input[k]
            for k in ("subject", "grade", "semester", "question_types", "subtype_info", "count", "format_instructions")
        },
        "weak_knowledge_analysis": weak_knowledge_analysis,
        "mastered_knowledge_list": mastered_knowledge_list,
        "review_units_reminder": review_units_reminder,
        "weak_knowledge_points": "、".join(weak_knowledge_points[:5]) or "（无）",
        "mastered_knowledge": "、".join(mastered_knowledge[:8]) or "（无）",
        "challenge_knowledge": "、".join(mastered_knowledge[-3:]) if mastered_knowledge else "（无）",
        "new_knowledge": new_knowledge_preview,
        "wrong_count": wrong_count,
        "consolidation_count": consolidation_count,
        "challenge_count": challenge_count,
        "new_count": new_count,
    }

    # 根据科目自动选择对应的 prompt 模板
    textbook = state["textbook"]
    daily_prompt_template = get_prompt_by_subject("daily", textbook.subject)
    
    # 如果有避免重复的提示，追加到模板末尾
    avoid_duplicate_hint = prompt_input.get("avoid_duplicate_hint", "")
    if avoid_duplicate_hint:
        daily_prompt_template = daily_prompt_template + avoid_duplicate_hint

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的教研员，擅长根据学生的学习数据设计个性化的日常练习。"
                "你的目标是帮助学生巩固薄弱环节、保持已掌握知识、挑战更高难度，并激发学习兴趣。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", daily_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": daily_prompt_input,
        "parser": parser,
        "prompt_template": daily_prompt_template,
    }

