"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from loguru import logger

from shared.core.database import Question
from ai.schema import GenerationType, QuestionGenerationState
from ai.question_generate.services import llm as llm_service
from ai.question_generate.services import resource as resource_service
from ai.question_generate.services import storage as storage_service

# 导入各生成类型的Service
from ai.question_generate.services.daily_practice import DailyPracticeGenerateService
from ai.question_generate.services.unit_practice import UnitPracticeGenerateService
from ai.question_generate.services.assessment import AssessmentGenerateService


def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    logger.info(f"进入题目生成工作流: type={state.get('type')}, count={state.get('count')}")

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if state.get("type") is None:
        raise ValueError("生成类型（type）不能为空")

    if state.get("count") is None:
        raise ValueError("题目数量（count）不能为空")

    if state.get("textbook") is None:
        raise ValueError("教材 (textbook) 不能为空")

    return {}


def router_node(state: QuestionGenerationState) -> str:
    """路由节点，根据生成类型分发"""
    return state["type"]


async def check_daily_practice_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查每日练习参数"""
    logger.info("开始检查每日练习参数")
    DailyPracticeGenerateService.validate_state(state)
    return {}


async def check_unit_practice_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查单元练习参数"""
    logger.info("开始检查单元练习参数")
    UnitPracticeGenerateService.validate_state(state)
    return {}


async def check_assessment_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查能力评估参数"""
    logger.info("开始检查能力评估参数")
    AssessmentGenerateService.validate_state(state)
    return {}


async def load_daily_practice_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载每日练习数据"""
    logger.info("开始加载每日练习数据")
    return await DailyPracticeGenerateService.load_data(state)


async def load_unit_practice_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载单元练习数据"""
    logger.info("开始加载单元练习数据")
    return await UnitPracticeGenerateService.load_data(state)


async def load_assessment_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载能力评估数据"""
    logger.info("开始加载能力评估数据")
    return await AssessmentGenerateService.load_data(state)


async def build_daily_practice_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建每日练习prompt"""
    logger.info("开始构建每日练习prompt")
    return await DailyPracticeGenerateService.build_prompt(state)


async def build_unit_practice_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元练习prompt"""
    logger.info("开始构建单元练习prompt")
    return UnitPracticeGenerateService.build_prompt(state)


async def build_assessment_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建能力评估prompt"""
    logger.info("开始构建能力评估prompt")
    return AssessmentGenerateService.build_prompt(state)


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""
    logger.info("开始调用大模型生成题目")
    try:
        result = await llm_service.call_llm(state)
        logger.info(f"大模型生成完成，共生成 {len(result.get('generated_questions', []))} 道题目")
        return result
    except Exception as e:
        logger.error(f"大模型调用失败: {e}")
        raise


async def convert_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流，然后保存到数据库"""
    logger.info("开始转换问题对象并分流")
    try:
        result = await storage_service.convert_questions(state)
        logger.info("问题对象转换和分流完成")
        return result
    except Exception as e:
        logger.error(f"数据转换或保存失败: {e}")
        raise


async def handle_image_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成图片"""
    try:
        result = await resource_service.generate_images(state)
        logger.info("图片生成完成")
        return result
    except Exception as e:
        logger.error(f"图片生成失败: {e}")
        # 图片生成失败不应阻断整个流程，可以记录错误并继续
        return {"image_generation_error": str(e)}


async def handle_audio_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成语音"""
    try:
        result = await resource_service.generate_audios(state)
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


async def save_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """汇总数据节点 - 合并召回题目和生成题目"""
    storage_service.save_questions(state)

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

    # 添加入口节点
    workflow.add_node("entry", entry_node)

    # 添加校验节点
    workflow.add_node("check_daily_practice", check_daily_practice_node)
    workflow.add_node("check_unit_practice", check_unit_practice_node)
    workflow.add_node("check_assessment", check_assessment_node)

    # 添加加载数据节点
    workflow.add_node("load_unit_practice_data", load_unit_practice_data_node)
    workflow.add_node("load_daily_practice_data", load_daily_practice_data_node)
    workflow.add_node("load_assessment_data", load_assessment_data_node)

    # 添加构建prompt节点
    workflow.add_node("build_daily_practice_prompt", build_daily_practice_prompt_node)
    workflow.add_node("build_unit_practice_prompt", build_unit_practice_prompt_node)
    workflow.add_node("build_assessment_prompt", build_assessment_prompt_node)

    # 添加其他处理节点
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("convert_data", convert_data_node)
    workflow.add_node("handle_image", handle_image_node)
    workflow.add_node("handle_audio", handle_audio_node)
    workflow.add_node("handle_text", handle_text_node)
    workflow.add_node("save_question", save_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加条件边：根据生成类型路由
    workflow.add_conditional_edges(
        "entry",
        router_node,
        {
            GenerationType.DAILY_PRACTICE.value: "check_daily_practice",
            GenerationType.UNIT_PRACTICE.value: "check_unit_practice",
            GenerationType.ASSESSTENT.value: "check_assessment",
        },
    )

    # 添加边：参数检查 -> 数据加载
    workflow.add_edge("check_daily_practice", "load_daily_practice_data")
    workflow.add_edge("check_unit_practice", "load_unit_practice_data")
    workflow.add_edge("check_assessment", "load_assessment_data")

    # 添加边：数据加载 -> prompt构建
    workflow.add_edge("load_daily_practice_data", "build_daily_practice_prompt")
    workflow.add_edge("load_unit_practice_data", "build_unit_practice_prompt")
    workflow.add_edge("load_assessment_data", "build_assessment_prompt")

    # 添加边：prompt构建 -> LLM调用
    workflow.add_edge("build_daily_practice_prompt", "call_llm")
    workflow.add_edge("build_unit_practice_prompt", "call_llm")
    workflow.add_edge("build_assessment_prompt", "call_llm")

    # 添加边：LLM调用 -> 数据转换
    workflow.add_edge("call_llm", "convert_data")

    # 添加边：数据转换 -> 资源处理（并行）
    workflow.add_edge("convert_data", "handle_image")
    workflow.add_edge("convert_data", "handle_audio")
    workflow.add_edge("convert_data", "handle_text")

    # 添加边：资源处理 -> 文件上传
    workflow.add_edge("handle_image", "save_question")
    workflow.add_edge("handle_audio", "save_question")
    workflow.add_edge("handle_text", "save_question")

    # 添加边：更新问题 -> 结束
    workflow.add_edge("save_question", END)

    return workflow.compile()
