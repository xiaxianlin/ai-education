"""教材生成 Prompt 构建"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from server.core.constants import get_question_subtypes, get_question_types
from shared.question.types import QuestionGenerationResult, QuestionGenerationState

# TODO: 根据需要补充英语学科的 Prompt 模板
GENERIC_TEXTBOOK_PROMPT_ENGLISH = """"""

# TODO: 根据需要补充数学学科的 Prompt 模板
GENERIC_TEXTBOOK_PROMPT_MATH = """"""


def _build_knowledge_text(knowledges: list[str]) -> str:
    """构建知识点文本"""
    if not knowledges:
        return "暂无知识点信息"

    knowledge_lines = [f"- {knowledge}" for knowledge in knowledges]
    return "\n".join(knowledge_lines)


def _build_subtype_info(question_types: list[str]) -> str:
    """构建题型子类型信息"""
    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    return "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"


def _build_avoid_duplicate_hint(recall_questions: list) -> str:
    """构建避免重复题目的提示信息"""
    if not recall_questions:
        return ""

    recalled_questions_info_lines = []
    for recall_question in recall_questions:
        recalled_questions_info_lines.append(
            f"- 题目ID: {recall_question.id}, "
            f"题干: {recall_question.question}, "
            f"选项: {recall_question.options}"
        )

    recalled_questions_info = "\n".join(recalled_questions_info_lines)

    return (
        f"\n\n## 重要：避免题目重复\n"
        f"以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：\n"
        f"{recalled_questions_info}\n"
        f"请生成全新的、与上述题目不同的题目。"
    )


def build_textbook_prompt(state: QuestionGenerationState) -> dict:
    """构建教材生成prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    # 提取状态数据
    textbook = state["textbook"]
    count = state["count"]
    grade = state["grade"]
    subject = state["subject"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])
    units = state.get("units", [])

    # 构建格式说明
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 获取题型配置
    question_types = get_question_types(subject, grade)
    if not question_types:
        raise ValueError(
            f"科目 {subject} 的 {grade} 年级暂不支持题目生成。" f"目前仅支持一年级的英语和数学。"
        )

    # 构建各种文本信息
    question_types_str = "、".join(question_types)
    subtype_info = _build_subtype_info(question_types)
    knowledge_text = _build_knowledge_text(knowledges)
    avoid_duplicate_hint = _build_avoid_duplicate_hint(recall_questions)

    # 构建单元概要
    unit_summary = ""
    if units:
        unit_names = [f"{i+1}. {unit.name}" for i, unit in enumerate(units)]
        unit_summary = "\n".join(unit_names)

    # 获取prompt模板并追加避免重复提示
    textbook_prompt_template = (
        subject == "英语" and GENERIC_TEXTBOOK_PROMPT_ENGLISH or GENERIC_TEXTBOOK_PROMPT_MATH
    )
    if avoid_duplicate_hint:
        textbook_prompt_template = textbook_prompt_template + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。"
                "你的目标是生成高质量、符合学生认知水平、紧扣知识点的题目。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", textbook_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade,
        "unit_name": f"{textbook.name}（全教材）",
        "unit_summary": unit_summary or "整本教材的综合练习",
        "count": count,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "knowledge_text": knowledge_text,
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
