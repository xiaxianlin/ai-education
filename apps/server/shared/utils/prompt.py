from shared.core.database import Question


def build_question_prompt(question: Question) -> str:
    """构建完整的问题内容，包含题目、选项、答案"""
    parts = []
    content = question.content or {}

    # 题目内容：从 content.stem 获取
    stem = content.get("stem", "")
    if isinstance(stem, dict):
        stem_text = stem.get("text", "")
    else:
        stem_text = str(stem) if stem else ""
    
    if stem_text:
        parts.append(f"题目：{stem_text}")

    # 选项：从 content.options 获取
    options = content.get("options", [])
    if options:
        try:
            if isinstance(options, list):
                options_text = "\n".join(
                    [
                        f"{opt.get('id', chr(65 + i))}. {opt.get('text', str(opt))}"
                        for i, opt in enumerate(options)
                    ]
                )
            else:
                options_text = str(options)
            if options_text:
                parts.append(f"选项：\n{options_text}")
        except Exception:
            parts.append(f"选项：\n{options}")

    # 答案：从 answer 字段获取
    if question.answer:
        if isinstance(question.answer, dict):
            correct_answers = question.answer.get("correct_answers", [])
            answer_text = ", ".join(correct_answers) if correct_answers else ""
        else:
            answer_text = str(question.answer)
        if answer_text:
            parts.append(f"答案：{answer_text}")

    return "\n\n".join(parts) if parts else stem_text or ""
