"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List
from loguru import logger
from langgraph.graph import END, StateGraph
from sqlalchemy import select

from shared.core.database import Question, Practice
from shared.utils.practice_config import get_practice_config
from generation.question.schema import QuestionGenerationState
from generation.question.utils import generate_images, generate_audios
from generation.question.services.daily_practice import DailyPracticeGenerateService
from generation.question.services.unit_practice import UnitPracticeGenerateService
from generation.question.services.assessment import AssessmentGenerateService
from generation.question.services.llm import LLMService


async def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验和加载练习信息"""
    slug = state.get("slug")
    logger.info(f"进入题目生成工作流: slug={slug}")

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if slug is None:
        raise ValueError("练习标识（slug）不能为空")

    if state.get("textbook") is None:
        raise ValueError("教材 (textbook) 不能为空")

    # 通过 slug 查询 Practice
    db = state["db"]
    practice = await db.scalar(select(Practice).where(Practice.slug == slug))
    if not practice:
        raise ValueError(f"练习不存在: slug={slug}")

    # 解析配置（使用 textbook 的 grade）
    textbook = state["textbook"]
    practice_config = get_practice_config(practice, grade=textbook.grade)

    generate_count = practice_config.get("generate_count", 15)
    logger.info(
        f"练习信息加载完成: practice_id={practice.id}, slug={practice.slug}, " f"generate_count={generate_count}"
    )

    return {
        "practice": practice,
        "practice_config": practice_config,
        "count": generate_count,  # 为了兼容服务类，保留 count 字段
    }


# 练习服务映射
PRACTICE_SERVICES = {
    "daily_practice": DailyPracticeGenerateService,
    "unit_practice": UnitPracticeGenerateService,
    "assessment": AssessmentGenerateService,
}


async def check_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """统一的参数检查节点，根据 practice.slug 路由到对应服务"""
    practice = state["practice"]
    slug = practice.slug

    if slug not in PRACTICE_SERVICES:
        raise ValueError(f"不支持的练习类型: slug={slug}")

    service = PRACTICE_SERVICES[slug]
    logger.info(f"开始检查练习参数: slug={slug}")
    service.validate_state(state)
    return {}


async def load_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """统一的数据加载节点，根据 practice.slug 路由到对应服务"""
    practice = state["practice"]
    slug = practice.slug

    if slug not in PRACTICE_SERVICES:
        raise ValueError(f"不支持的练习类型: slug={slug}")

    service = PRACTICE_SERVICES[slug]
    logger.info(f"开始加载练习数据: slug={slug}")
    return await service.load_data(state)


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """统一的 prompt 构建节点，根据 practice.slug 路由到对应服务"""
    practice = state["practice"]
    slug = practice.slug

    if slug not in PRACTICE_SERVICES:
        raise ValueError(f"不支持的练习类型: slug={slug}")

    service = PRACTICE_SERVICES[slug]
    logger.info(f"开始构建练习 prompt: slug={slug}")
    return await service.build_prompt(state)


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    logger.info("开始调用大模型生成题目")
    questions = await LLMService.call_llm(state)
    logger.info(f"大模型生成题目完成，共 {len(questions)} 道题目")

    return {"questions": questions}


async def handle_image_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成图片"""
    try:
        result = await generate_images(state)
        logger.info("图片生成完成")
        return result
    except Exception as e:
        logger.error(f"图片生成失败: {e}")
        # 图片生成失败不应阻断整个流程，可以记录错误并继续
        return {"image_generation_error": str(e)}


async def handle_audio_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成语音"""
    try:
        result = await generate_audios(state)
        logger.info("语音生成完成")
        return result
    except Exception as e:
        logger.error(f"语音生成失败: {e}")
        # 语音生成失败不应阻断整个流程
        return {"audio_generation_error": str(e)}


async def handle_text_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """处理文本题"""
    text_questions = state.get("text_questions", [])
    if not text_questions:
        logger.info("跳过文本处理（没有文本题）")
        return {}

    logger.info(
        f"文本题目处理完成，共 {len(text_questions)} 道题目",
    )
    return {}


async def update_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """汇总数据节点 - 合并召回题目和生成题目"""

    db = state["db"]
    await db.commit()

    generated_questions: List[Question] = state.get("questions", [])
    recall_questions: List[Question] = state.get("recall_questions", [])

    # 合并召回题目和生成题目
    all_questions = list(recall_questions) + list(generated_questions)

    logger.info(
        f"题目汇总完成: 召回题目={len(recall_questions)}道, 生成题目={len(generated_questions)}道, 总计={len(all_questions)}道",
    )

    return {"questions": all_questions}


# ==================== 图构建 ====================


def create_question_generation_graph() -> StateGraph:
    """创建问题生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("check", check_node)
    workflow.add_node("load_data", load_data_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("handle_image", handle_image_node)
    workflow.add_node("handle_audio", handle_audio_node)
    workflow.add_node("handle_text", handle_text_node)
    workflow.add_node("update_questions", update_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边：entry -> check -> load_data -> build_prompt -> call_llm
    workflow.add_edge("entry", "check")
    workflow.add_edge("check", "load_data")
    workflow.add_edge("load_data", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")

    # 添加边：LLM调用 -> 资源处理（并行）
    workflow.add_edge("call_llm", "handle_image")
    workflow.add_edge("call_llm", "handle_audio")
    workflow.add_edge("call_llm", "handle_text")

    # 添加边：资源处理 -> 保存题目
    workflow.add_edge("handle_image", "update_questions")
    workflow.add_edge("handle_audio", "update_questions")
    workflow.add_edge("handle_text", "update_questions")

    # 添加边：保存题目 -> 结束
    workflow.add_edge("update_questions", END)

    return workflow.compile()
