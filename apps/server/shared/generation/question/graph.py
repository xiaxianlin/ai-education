"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import AsyncSession, PracticeSession, Question, Textbook, Unit
from shared.generation.audio import invoke_question_audio_workflow
from shared.generation.image import invoke_question_image_workflow
from shared.provider import get_provider
from shared.utils.prompt import build_question_prompt

from .schema import QuestionGenerationState
from .services import (
    assess_practice,
    daily_practice,
    question,
    unit_practice,
)

PRACTICE_SERVICES = {
    "daily_practice": daily_practice,
    "unit_practice": unit_practice,
    "assess_practice": assess_practice,
}


async def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验和加载练习信息"""

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    session = state.get("session")
    if session is None:
        raise ValueError("练习会话 (session) 不能为空")

    if state.get("textbook") is None:
        raise ValueError("练习会话 (session) 不能为空")

    if state.get("units") is None:
        raise ValueError("单元列表 (units) 不能为空")

    if state.get("question_types") is None:
        raise ValueError("题型列表 (question_types) 不能为空")

    if session.practice_slug not in PRACTICE_SERVICES:
        raise ValueError(f"练习类型: slug={session.practice_slug} 暂不支持")

    logger.info(f"练习信息加载完成: slug={session.practice_slug}, " f"parameters={session.parameters}")

    return {}


async def load_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """统一的数据加载节点，根据 practice.slug 路由到对应服务"""
    session = state["session"]

    logger.info(f"开始加载练习数据: slug={session.practice_slug}")

    recall_questions = await question.recall_questions(state["db"], session)
    data = await PRACTICE_SERVICES[session.practice_slug].load_data(state)

    return {"recall_questions": recall_questions, **data}


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """统一的 prompt 构建节点，根据 practice.slug 路由到对应服务"""
    session = state["session"]
    logger.info(f"开始构建练习 prompt: slug={session.practice_slug}")
    return await PRACTICE_SERVICES[session.practice_slug].build_prompt(state)


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    logger.info("开始调用大模型生成题目")

    provider = get_provider()
    result = await provider.invoke_chain(
        prompt=state["prompt"], parser=state["prompt_parser"], prompt_input=state["prompt_input"]
    )

    if "questions" not in result:
        raise ValueError("LLM 返回结果中没有 questions 字段")

    if not isinstance(result["questions"], list):
        raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")

    logger.info(f"大模型生成题目完成，共 {len(result['questions'])} 道题目")

    return {"generated_questions": question.handle_llm_questions(result["questions"])}


async def handle_resource_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成图片"""
    db = state["db"]
    textbook = state["textbook"]
    generated_questions = state["generated_questions"]

    for question in generated_questions:

        if question.resource_type == "image":
            prompt = build_question_prompt(question)
            question.resource = f"textbook/{textbook.id}/question_image/{question.id}.png"
            await invoke_question_image_workflow(
                db=db,
                prompt=prompt,
                oss_path=question.resource,
            )

        if question.resource_type == "audio":
            question.resource = f"textbook/{textbook.id}/question_audio/{question.id}.mp3"
            language = "Chinese" if textbook.subject == "英语" else "English"
            await invoke_question_audio_workflow(
                text=question.resource_content,
                language=language,
                oss_path=question.resource,
            )

    return {"generated_questions": generated_questions}


async def update_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """汇总数据节点 - 合并召回题目和生成题目"""

    db = state["db"]

    recall_questions: List[Question] = state.get("recall_questions", [])
    generated_questions: List[Question] = state.get("generated_questions", [])

    # 合并召回题目和生成题目
    questions = list(recall_questions) + list(generated_questions)

    logger.info(
        f"题目汇总完成: 召回题目={len(recall_questions)}道, 生成题目={len(generated_questions)}道, 总计={len(questions)}道",
    )
    await db.commit()
    return {"questions": questions}


# ==================== 图构建 ====================


def create_question_generation_graph() -> CompiledStateGraph:
    """创建问题生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("load_data", load_data_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("handle_resource", handle_resource_node)
    workflow.add_node("update_questions", update_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")
    workflow.add_edge("entry", "load_data")
    workflow.add_edge("load_data", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")
    workflow.add_edge("call_llm", "handle_resource")
    workflow.add_edge("handle_resource", "update_questions")
    workflow.add_edge("update_questions", END)

    return workflow.compile()


question_generation_graph = create_question_generation_graph()


async def invoke_question_generation_workflow(
    *,
    db: AsyncSession,
    session: PracticeSession,
    textbook: Textbook,
    units: list[Unit],
    question_types: dict[str, list[str]],
) -> List[Question]:
    state = QuestionGenerationState(
        db=db,
        session=session,
        textbook=textbook,
        units=units,
        question_types=question_types,
    )
    result = await question_generation_graph.ainvoke(state)
    return result.get("questions", [])
