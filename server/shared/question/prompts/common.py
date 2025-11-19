"""Prompt构建公共工具函数"""
from typing import Any, Dict

from langchain_core.output_parsers import JsonOutputParser

from core.constants import get_question_types, get_question_subtypes
from shared.ai.services.question import QuestionGenerationResult


def build_common_prompt_inputs(
    params: Dict[str, Any],
) -> tuple[Dict[str, Any], JsonOutputParser]:
    """
    构建题目生成所需的公共输入内容，并返回对应的解析器
    """
    unit = params["unit"]
    textbook = params["textbook"]
    knowledge_text = params.get("knowledge_text", "")
    count = params["count"]
    recalled_questions_info = params.get("recalled_questions_info", "")

    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    question_types = get_question_types(textbook.subject, textbook.grade)
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。"
            f"目前仅支持一年级的英语和数学。"
        )

    question_types_str = "、".join(question_types)

    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    subtype_info = "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"

    # 构建避免重复的提示信息
    avoid_duplicate_hint = ""
    if recalled_questions_info:
        avoid_duplicate_hint = (
            f"\n\n## 重要：避免题目重复\n"
            f"以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：\n"
            f"{recalled_questions_info}\n"
            f"请生成全新的、与上述题目不同的题目。"
        )

    prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "unit_name": unit.name,
        "unit_summary": unit.content or "",
        "knowledge_text": knowledge_text,
        "count": count,
        "format_instructions": format_instructions,
        "avoid_duplicate_hint": avoid_duplicate_hint,
    }

    return prompt_input, parser


def build_assessment_prompt_inputs(
    textbook: Any,
    count: int,
    recalled_questions_info: str = "",
) -> tuple[Dict[str, Any], JsonOutputParser]:
    """
    构建能力评估所需的输入内容，并返回对应的解析器
    """
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    question_types = get_question_types(textbook.subject, textbook.grade)
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。"
            f"目前仅支持一年级的英语和数学。"
        )

    question_types_str = "、".join(question_types)

    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    subtype_info = "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"

    # 计算难度分布
    simple_count = max(1, int(count * 0.3))
    medium_count = max(1, int(count * 0.5))
    hard_count = count - simple_count - medium_count

    # 构建避免重复的提示信息
    avoid_duplicate_hint = ""
    if recalled_questions_info:
        avoid_duplicate_hint = (
            f"\n\n## 重要：避免题目重复\n"
            f"以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：\n"
            f"{recalled_questions_info}\n"
            f"请生成全新的、与上述题目不同的题目。"
        )

    prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "count": count,
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
        "format_instructions": format_instructions,
        "avoid_duplicate_hint": avoid_duplicate_hint,
    }

    return prompt_input, parser


def format_weak_knowledge_analysis(weak_points: list[str], mastery_details: list[Dict[str, Any]] = None) -> str:
    """格式化薄弱知识点分析"""
    if not weak_points:
        return "（暂无明显薄弱知识点，学生整体掌握良好）"

    lines = []
    for i, point in enumerate(weak_points[:5]):  # 最多显示5个
        if mastery_details and i < len(mastery_details):
            detail = mastery_details[i]
            mastery_level = int(detail.get("mastery_level", 0) * 100)
            error_rate = int(detail.get("error_rate", 0) * 100)
            lines.append(f"- **{point}**：掌握度 {mastery_level}%，历史错误率 {error_rate}%")
        else:
            lines.append(f"- **{point}**")

    return "\n".join(lines)


def format_mastered_knowledge(knowledge_list: list[str]) -> str:
    """格式化已掌握知识点列表"""
    if not knowledge_list:
        return "（暂无已掌握知识点数据）"

    return "、".join(knowledge_list[:10])  # 最多显示10个


def format_review_reminder(review_units: list[Dict[str, Any]]) -> str:
    """格式化遗忘曲线复习提醒"""
    if not review_units:
        return "（近期无需复习的单元）"

    lines = []
    for unit in review_units[:3]:  # 最多显示3个
        unit_name = unit.get("unit_name", "未知单元")
        days_since = unit.get("days_since_last_practice", 0)
        lines.append(f"- **{unit_name}**：已 {days_since} 天未练习，建议复习")

    return "\n".join(lines)


def format_new_knowledge(new_knowledge: list[str]) -> str:
    """格式化新知识预览"""
    if not new_knowledge:
        return "（暂无新知识点安排）"

    return "、".join(new_knowledge[:5])

