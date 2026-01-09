from shared.core.database import Question


def build_question_prompt(question: Question) -> str:
    """构建完整的问题内容，包含题目、选项、答案"""
    parts = []

    # 题目内容 (V2 uses stem dict)
    stem_text = question.stem.get("text", "") if isinstance(question.stem, dict) else ""
    if stem_text:
        parts.append(f"题目：{stem_text}")

    # 选项 (V2 options is already a list of dicts)
    if question.options:
        try:
            if isinstance(question.options, list):
                options_text = "\n".join(
                    [
                        f"{opt.get('id', chr(65 + i))}. {opt.get('text', str(opt))}"
                        for i, opt in enumerate(question.options)
                    ]
                )
            else:
                options_text = str(question.options)
            if options_text:
                parts.append(f"选项：\n{options_text}")
        except Exception:
            parts.append(f"选项：\n{question.options}")

    # 答案 (V2 uses answer dict with correct_answers)
    if question.answer:
        if isinstance(question.answer, dict):
            correct_answers = question.answer.get("correct_answers", [])
            answer_text = ", ".join(correct_answers) if correct_answers else ""
        else:
            answer_text = str(question.answer)
        if answer_text:
            parts.append(f"答案：{answer_text}")

    return "\n\n".join(parts) if parts else stem_text or ""
