"""通用Prompt构建工具函数

本模块提供可复用的prompt构建辅助函数,用于消除代码重复并提高一致性。
"""

from typing import List

from shared.core.database import Unit
from shared.core.database import Question


def build_units_prompt(units: List[Unit]) -> str:
    """格式化单元列表为文本"""
    if not units:
        return "（无）"

    prompt_lines = []
    for unit in units:
        prompt_lines.append(f"- **{unit.name}**")
        prompt_lines.append(f"- **{unit.content}**")

    return "\n".join(prompt_lines) or "（无）"


def build_knowledges_prompt(knowledges: List[str]) -> str:
    """格式化知识点列表为文本"""
    if not knowledges:
        return "（无）"

    prompt_lines = []
    for knowledge in knowledges:
        prompt_lines.append(f"- **{knowledge}**")

    return "\n".join(prompt_lines) or "（无）"


def build_avoid_duplicate_prompt(recall_questions: List[Question]) -> str:
    """格式化召回题目列表为文本"""
    if not recall_questions:
        return ""

    prompt_lines = []
    for recall_question in recall_questions:
        prompt_lines.append(f"- **{recall_question.stem.get('text', '')}**")
        prompt_lines.append(f"- **{recall_question.options}**")

    recalled_questions_info = "\n".join(prompt_lines) or "（无）"
    return f"""
        ## 重要：避免题目重复
        以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：
        {recalled_questions_info}
        请生成全新的、与上述题目不同的题目。
    """


def build_question_types_prompt(question_types: dict[str, list[dict]]) -> str:
    """格式化题型列表为文本"""

    prompt_lines = []

    for scene, type_list in question_types.items():
        # 提取每个题型的名称
        type_names = [
            item.get("name", "")
            for item in type_list
            if isinstance(item, dict) and item.get("name")
        ]
        if type_names:
            prompt_lines.append(f"- **{scene}**：{'、'.join(type_names)}")
        else:
            prompt_lines.append(f"- **{scene}**")

    return "\n".join(prompt_lines) or "（无）"
