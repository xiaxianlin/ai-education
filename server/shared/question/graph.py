"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

from __future__ import annotations

from typing import Any, Dict

from langgraph.graph import END, StateGraph
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from shared.question.types import GenerationType, QuestionGenerationState
from shared.question.services import llm as llm_service
from shared.question.services import converter as converter_service
from shared.question.services import resource as resource_service
from shared.question.services import storage as storage_service

# 导入各生成类型的Service
from shared.question.services.unit import UnitGenerateService
from shared.question.services.textbook import TextbookGenerateService
from shared.question.services.daily_practice import DailyPracticeGenerateService
from shared.question.services.unit_practice import UnitPracticeGenerateService
from shared.question.services.assessment import AssessmentGenerateService


def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    logger.info(
        f"进入题目生成工作流: type={state.get('generation_type')}, count={state.get('count')}"
    )

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if state.get("generation_type") is None:
        raise ValueError("生成类型（generation_type）不能为空")

    if state.get("count") is None:
        raise ValueError("题目数量（count）不能为空")

    if state.get("subject") is None:
        raise ValueError("学科（subject）不能为空")

    if state.get("grade") is None:
        raise ValueError("年级（grade）不能为空")

    return {}


def router_node(state: QuestionGenerationState) -> str:
    """路由节点，根据生成类型分发"""
    return state["generation_type"]


async def check_unit_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查单元生成参数"""
    logger.info("开始检查单元生成参数")
    UnitGenerateService.validate_state(state)
    return {}


async def check_textbook_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查教材生成参数"""
    logger.info("开始检查教材生成参数")
    TextbookGenerateService.validate_state(state)
    return {}


async def check_daily_practice_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查今日练习参数"""
    logger.info("开始检查今日练习参数")
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


async def load_unit_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载单元数据"""
    logger.info("开始加载单元数据")
    return await UnitGenerateService.load_data(state)


async def load_textbook_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载教材数据"""
    logger.info("开始加载教材数据")
    return await TextbookGenerateService.load_data(state)


async def load_daily_practice_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载今日练习数据"""
    logger.info("开始加载今日练习数据")
    return await DailyPracticeGenerateService.load_data(state)


async def load_unit_practice_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载单元练习数据"""
    logger.info("开始加载单元练习数据")
    return await UnitPracticeGenerateService.load_data(state)


async def load_assessment_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载能力评估数据"""
    logger.info("开始加载能力评估数据")
    return await AssessmentGenerateService.load_data(state)


async def build_unit_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元prompt"""
    logger.info("开始构建单元prompt")
    return UnitGenerateService.build_prompt(state)


async def build_textbook_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建教材prompt"""
    logger.info("开始构建教材prompt")
    return TextbookGenerateService.build_prompt(state)


async def build_daily_practice_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建今日练习prompt"""
    logger.info("开始构建今日练习prompt")
    return DailyPracticeGenerateService.build_prompt(state)


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
        logger.info("大模型生成完成，共生成 %s 道题目", len(result.get("generated_questions", [])))
        return result
    except Exception as e:
        logger.error(f"大模型调用失败: {e}")
        raise


async def convert_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流，然后保存到数据库"""
    logger.info("开始转换问题对象并分流")
    try:
        result = await converter_service.convert_to_question_objects(state)

        image_questions = result.get("image_questions", [])
        audio_questions = result.get("audio_questions", [])
        text_questions = result.get("text_questions", [])

        logger.info(
            "问题转换完成: 辨识题 %s, 音频题 %s, 其他题目 %s",
            len(image_questions),
            len(audio_questions),
            len(text_questions),
        )

        # 保存题目到数据库
        save_result = await storage_service.save_questions({**state, **result})
        result.update(save_result)

        return result
    except Exception as e:
        logger.error(f"数据转换或保存失败: {e}")
        raise


async def handle_image_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """根据 resource_type 标识生成图片"""
    try:
        image_questions = state.get("image_questions", [])
        needs_image_count = sum(1 for q in image_questions if q.resource_type == "image")
        if needs_image_count == 0:
            logger.info("跳过图片处理（没有需要生成图片的题目）")
            return {}

        logger.info("开始为 %s 道题目生成图片", needs_image_count)
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
        audio_questions = state.get("audio_questions", [])
        needs_audio_count = sum(1 for q in audio_questions if q.resource_type == "audio")
        if needs_audio_count == 0:
            logger.info("跳过音频处理（没有需要生成语音的题目）")
            return {}

        logger.info("开始为 %s 道题目生成语音", needs_audio_count)
        result = await resource_service.generate_audio(state)
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

    logger.info("文本题目处理完成，共 %s 道题目", len(text_questions))
    return {}


async def upload_files_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """文件上传节点"""
    logger.info("开始上传文件到 OSS")
    try:
        result = await storage_service.upload_files(state)
        logger.info("文件上传完成")
        return result
    except Exception as e:
        logger.error(f"文件上传失败: {e}")
        raise


async def upload_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """数据更新节点"""
    logger.info("开始更新问题数据")
    try:
        result = await storage_service.update_questions(state)
        logger.info("问题更新完成，共更新 %s 道题目", len(result.get("saved_questions", [])))
        return result
    except Exception as e:
        logger.error(f"问题更新失败: {e}")
        raise


# ==================== 图构建 ====================


def create_question_generation_graph() -> StateGraph:
    """创建问题生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加入口节点
    workflow.add_node("entry", entry_node)

    # 添加校验节点
    workflow.add_node("check_unit", check_unit_node)
    workflow.add_node("check_textbook", check_textbook_node)
    workflow.add_node("check_daily_practice", check_daily_practice_node)
    workflow.add_node("check_unit_practice", check_unit_practice_node)
    workflow.add_node("check_assessment", check_assessment_node)

    # 添加加载数据节点
    workflow.add_node("load_unit_data", load_unit_data_node)
    workflow.add_node("load_textbook_data", load_textbook_data_node)
    workflow.add_node("load_unit_practice_data", load_unit_practice_data_node)
    workflow.add_node("load_daily_practice_data", load_daily_practice_data_node)
    workflow.add_node("load_assessment_data", load_assessment_data_node)

    # 添加构建prompt节点
    workflow.add_node("build_unit_prompt", build_unit_prompt_node)
    workflow.add_node("build_textbook_prompt", build_textbook_prompt_node)
    workflow.add_node("build_daily_practice_prompt", build_daily_practice_prompt_node)
    workflow.add_node("build_unit_practice_prompt", build_unit_practice_prompt_node)
    workflow.add_node("build_assessment_prompt", build_assessment_prompt_node)

    # 添加其他处理节点
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("convert_data", convert_data_node)
    workflow.add_node("handle_image", handle_image_node)
    workflow.add_node("handle_audio", handle_audio_node)
    workflow.add_node("handle_text", handle_text_node)
    workflow.add_node("upload_files", upload_files_node)
    workflow.add_node("upload_questions", upload_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加条件边：根据生成类型路由
    workflow.add_conditional_edges(
        "entry",
        router_node,
        {
            GenerationType.UNIT.value: "check_unit",
            GenerationType.TEXTBOOK.value: "check_textbook",
            GenerationType.DAILY_PRACTICE.value: "check_daily_practice",
            GenerationType.UNIT_PRACTICE.value: "check_unit_practice",
            GenerationType.ASSESSTENT.value: "check_assessment",
        },
    )

    # 添加边：参数检查 -> 数据加载
    workflow.add_edge("check_unit", "load_unit_data")
    workflow.add_edge("check_textbook", "load_textbook_data")
    workflow.add_edge("check_daily_practice", "load_daily_practice_data")
    workflow.add_edge("check_unit_practice", "load_unit_practice_data")
    workflow.add_edge("check_assessment", "load_assessment_data")

    # 添加边：数据加载 -> prompt构建
    workflow.add_edge("load_unit_data", "build_unit_prompt")
    workflow.add_edge("load_textbook_data", "build_textbook_prompt")
    workflow.add_edge("load_daily_practice_data", "build_daily_practice_prompt")
    workflow.add_edge("load_unit_practice_data", "build_unit_practice_prompt")
    workflow.add_edge("load_assessment_data", "build_assessment_prompt")

    # 添加边：prompt构建 -> LLM调用
    workflow.add_edge("build_unit_prompt", "call_llm")
    workflow.add_edge("build_textbook_prompt", "call_llm")
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
    workflow.add_edge("handle_image", "upload_files")
    workflow.add_edge("handle_audio", "upload_files")

    # 添加边：文件上传/文本处理 -> 更新问题
    workflow.add_edge("upload_files", "upload_questions")
    workflow.add_edge("handle_text", "upload_questions")

    # 添加边：更新问题 -> 结束
    workflow.add_edge("upload_questions", END)

    return workflow.compile()


app = create_question_generation_graph()


async def invoke_generate_workflow(
    *,
    db: AsyncSession,
    count: int = 30,
    generation_type: str = GenerationType.UNIT.value,
    subject: str,
    grade: int,
    unit_id: int | None = None,
    textbook_id: int | None = None,
    student_id: str | None = None,
    **kwargs,
):
    """执行问题生成流程"""

    initial_state: QuestionGenerationState = {
        "db": db,
        "count": count,
        "grade": grade,
        "subject": subject,
        "generation_type": generation_type,
    }
    update_kwargs = {
        "unit_id": unit_id,
        "textbook_id": textbook_id,
        "student_id": student_id,
        **kwargs,
    }
    initial_state.update({k: v for k, v in update_kwargs.items() if v is not None})

    result = await app.ainvoke(initial_state)
    return result["saved_questions"]
