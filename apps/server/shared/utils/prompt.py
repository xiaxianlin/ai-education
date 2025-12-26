import json

from shared.core.database import Question


def build_question_prompt(question: Question) -> str:
    """构建完整的问题内容，包含题目、选项、答案"""
    parts = []

    # 题目内容
    if question.content:
        parts.append(f"题目：{question.content}")

    # 选项
    if question.options:
        try:
            parsed = json.loads(question.options)
            if isinstance(parsed, list):
                options_text = "\n".join(
                    [
                        f"{chr(65 + i)}. {opt if isinstance(opt, str) else opt.get('text', opt.get('label', str(opt)))}"
                        for i, opt in enumerate(parsed)
                    ]
                )
            else:
                # 如果不是数组，尝试按换行符分割
                options_text = question.options
            if options_text:
                parts.append(f"选项：\n{options_text}")
        except (json.JSONDecodeError, Exception):
            # 如果解析失败，直接使用原始文本
            if question.options.strip():
                parts.append(f"选项：\n{question.options}")

    # 答案
    if question.answer:
        parts.append(f"答案：{question.answer}")

    return "\n\n".join(parts) if parts else question.content or ""
