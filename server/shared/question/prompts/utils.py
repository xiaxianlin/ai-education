"""通用Prompt构建工具函数

本模块提供可复用的prompt构建辅助函数,用于消除代码重复并提高一致性。
"""

from typing import List, Optional
from core.database import Question, Unit
from core.constants import get_question_types


def build_common_prompt(subject: str, grade: int, recall_questions: Optional[List[Question]] = None) -> str:
    """构建题型配置信息，遍历题型和子题型生成适合 prompt 的字符串"""

    grades = [
        "",
        "小学一年级",
        "小学二年级",
        "小学三年级",
        "小学四年级",
        "小学五年级",
        "小学六年级",
        "初中一年级",
        "初中二年级",
        "初中三年级",
        "高中一年级",
        "高中二年级",
        "高中三年级",
    ]

    question_types = get_question_types(subject, grade)

    if question_types:
        prompt_lines = []
        for qtype, subtypes in question_types.items():
            prompt_lines.append(f"- **{qtype}**：{'、'.join(subtypes)}")
        question_types_text = "\n".join(prompt_lines)
    else:
        question_types_text = "（无可用题型）"

    if len(recall_questions) > 0:
        recalled_questions_info_lines = []
        for recall_question in recall_questions:
            # 转义内容中的花括号，避免被 LangChain 当作模板变量
            # 将 { 替换为 {{，将 } 替换为 }}
            content = recall_question.content.replace("{", "{{").replace("}", "}}")
            options = recall_question.options.replace("{", "{{").replace("}", "}}")
            recalled_questions_info_lines.append(
                f"- 题目ID: {recall_question.id}, "
                f"题干: {content}, "
                f"选项: {options}"
            )
        recalled_questions_info = "\n".join(recalled_questions_info_lines)
        avoid_duplicate_hint = f"""
            ## 重要：避免题目重复
            以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：
            {recalled_questions_info}
            请生成全新的、与上述题目不同的题目。
        """
    else:
        avoid_duplicate_hint = ""

    return (grades[grade], question_types_text, avoid_duplicate_hint)


def build_difficulty_distribution(
    count: int, simple_ratio: float = 0.3, medium_ratio: float = 0.5, hard_ratio: float = 0.2
) -> dict:
    """计算题目难度分布

    Args:
        count: 总题目数量
        simple_ratio: 简单题比例(默认30%)
        medium_ratio: 普通题比例(默认50%)
        hard_ratio: 困难题比例(默认20%)

    Returns:
        包含各难度题目数量的字典
        {
            'simple_count': int,
            'medium_count': int,
            'hard_count': int
        }

    Note:
        确保三个比例之和为1.0
        实际数量会根据总数调整,确保总和等于count
    """
    if abs(simple_ratio + medium_ratio + hard_ratio - 1.0) > 0.01:
        raise ValueError("难度比例之和必须为1.0")

    simple_count = max(1, int(count * simple_ratio))
    medium_count = max(1, int(count * medium_ratio))
    hard_count = count - simple_count - medium_count

    return {"simple_count": simple_count, "medium_count": medium_count, "hard_count": hard_count}


def build_question_distribution(
    count: int,
    wrong_ratio: float = 0.3,
    mastered_ratio: float = 0.4,
    challenge_ratio: float = 0.2,
    new_ratio: float = 0.1,
) -> dict:
    """计算每日练习题目类型分布

    Args:
        count: 总题目数量
        wrong_ratio: 错题复习比例(默认30%)
        mastered_ratio: 巩固练习比例(默认40%)
        challenge_ratio: 挑战题比例(默认20%)
        new_ratio: 新知引入比例(默认10%)

    Returns:
        包含各类型题目数量的字典
        {
            'wrong_count': int,
            'mastered_count': int,
            'challenge_count': int,
            'new_count': int
        }
    """
    if abs(wrong_ratio + mastered_ratio + challenge_ratio + new_ratio - 1.0) > 0.01:
        raise ValueError("题目类型比例之和必须为1.0")

    wrong_count = max(1, int(count * wrong_ratio))
    mastered_count = int(count * mastered_ratio)
    challenge_count = int(count * challenge_ratio)
    new_count = count - wrong_count - mastered_count - challenge_count

    return {
        "wrong_count": wrong_count,
        "mastered_count": mastered_count,
        "challenge_count": challenge_count,
        "new_count": new_count,
    }


def build_knowledges_prompt(knowledges: List[str]) -> str:
    """格式化知识点列表为文本"""
    if not knowledges:
        return "（无）"

    prompt_lines = []
    for knowledge in knowledges:
        prompt_lines.append(f"- **{knowledge}**")

    return "\n".join(prompt_lines) or "（无）"


def build_units_prompt(units: List[Unit]) -> str:
    """格式化单元列表为文本"""
    if not units:
        return "（无）"

    prompt_lines = []
    for unit in units:
        prompt_lines.append(f"- **{unit.name}**")
        prompt_lines.append(f"- **{unit.content}**")

    return "\n".join(prompt_lines) or "（无）"
