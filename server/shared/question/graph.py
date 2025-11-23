"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

import time
from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Question
from core.settings import envs
from shared.question.types import GenerationType, QuestionGenerationState
from shared.question.services import llm as llm_service
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
    logger.info(f"进入题目生成工作流: type={state.get('type')}, count={state.get('count')}")

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if state.get("type") is None:
        raise ValueError("生成类型（type）不能为空")

    if state.get("count") is None:
        raise ValueError("题目数量（count）不能为空")

    return {}


def router_node(state: QuestionGenerationState) -> str:
    """路由节点，根据生成类型分发"""
    return state["type"]


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


async def load_unit_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载单元数据"""
    logger.info("开始加载单元数据")
    return await UnitGenerateService.load_data(state)


async def load_textbook_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载教材数据"""
    logger.info("开始加载教材数据")
    return await TextbookGenerateService.load_data(state)


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


async def build_unit_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元prompt"""
    logger.info("开始构建单元prompt")
    return UnitGenerateService.build_prompt(state)


async def build_textbook_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建教材prompt"""
    logger.info("开始构建教材prompt")
    return TextbookGenerateService.build_prompt(state)


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
        logger.info(f"大模型生成完成，共生成 {len(result.get("generated_questions", []))} 道题目")
        return result
    except Exception as e:
        logger.error(f"大模型调用失败: {e}")
        raise


async def convert_data_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流，然后保存到数据库"""
    logger.info("开始转换问题对象并分流")
    try:
        result = await storage_service.convert_questions(state)

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


async def update_resource_info_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """更新资源信息节点"""
    logger.info("开始更新资源信息到数据库")
    try:
        result = await storage_service.update_resource_info(state)
        logger.info("资源信息更新完成")
        return result
    except Exception as e:
        logger.error(f"资源信息更新失败: {e}")
        raise


async def gather_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """汇总数据节点 - 合并召回题目和生成题目"""
    generated_questions: List[Question] = state.get("questions", [])
    recall_questions: List[Question] = state.get("recall_questions", [])
    
    # 合并召回题目和生成题目
    all_questions = list(recall_questions) + list(generated_questions)
    
    logger.info(
        "题目汇总完成: 召回题目=%s道, 生成题目=%s道, 总计=%s道",
        len(recall_questions),
        len(generated_questions),
        len(all_questions),
    )
    
    return {"questions": all_questions}


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
    workflow.add_node("update_resource_info", update_resource_info_node)
    workflow.add_node("gather_questions_node", gather_questions_node)

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

    # 添加边：文件上传 -> 更新资源信息
    workflow.add_edge("upload_files", "update_resource_info")

    # 添加边：更新资源信息/文本处理 -> 更新问题
    workflow.add_edge("update_resource_info", "gather_questions_node")
    workflow.add_edge("handle_text", "gather_questions_node")

    # 添加边：更新问题 -> 结束
    workflow.add_edge("gather_questions_node", END)

    return workflow.compile()


app = create_question_generation_graph()


async def invoke_generate_workflow(
    *,
    db: AsyncSession,
    count: int,
    type: str,
    unit_id: int | None = None,
    textbook_id: int | None = None,
    student_id: str | None = None,
    **kwargs,
) -> List[Question]:
    """执行问题生成流程"""
    # 记录开始时间
    start_time = time.time()

    # 构建日志信息
    log_parts = [
        f"type={type}",
        f"count={count}",
    ]
    if unit_id is not None:
        log_parts.append(f"unit_id={unit_id}")
    if textbook_id is not None:
        log_parts.append(f"textbook_id={textbook_id}")
    if student_id is not None:
        log_parts.append(f"student_id={student_id}")

    logger.info("开始生成题目 | " + " | ".join(log_parts))

    # 从环境变量读取 recall_count，能力评估类型不使用召回题目
    recall_count = 0 if type == "assessment" else envs.QUESTION_RECALL_COUNT

    initial_state: QuestionGenerationState = {
        "db": db,
        "count": count,
        "type": type,
        "recall_count": recall_count,
    }
    update_kwargs = {
        "unit_id": unit_id,
        "textbook_id": textbook_id,
        "student_id": student_id,
        **kwargs,
    }
    initial_state.update({k: v for k, v in update_kwargs.items() if v is not None})

    try:
        result = await app.ainvoke(initial_state)
        questions = result.get("questions", [])

        # 计算生成时长
        elapsed_time = time.time() - start_time

        # 从结果中获取 textbook 信息用于日志
        textbook = result.get("textbook")
        if textbook:
            logger.info(
                "题目生成完成 | type={type} | subject={subject} | grade={grade} | "
                "生成题目数={question_count} | 耗时={elapsed_time:.2f}秒",
                type=type,
                subject=textbook.subject,
                grade=textbook.grade,
                question_count=len(questions),
                elapsed_time=elapsed_time,
            )
        else:
            logger.info(
                "题目生成完成 | type={type} | 生成题目数={question_count} | 耗时={elapsed_time:.2f}秒",
                type=type,
                question_count=len(questions),
                elapsed_time=elapsed_time,
            )

        return questions
    except Exception as e:
        # 计算失败时的时长
        elapsed_time = time.time() - start_time

        # 尝试从 state 中获取 textbook 信息用于日志
        textbook = initial_state.get("textbook")
        if textbook:
            logger.error(
                "题目生成失败 | type={type} | subject={subject} | grade={grade} | "
                "耗时={elapsed_time:.2f}秒 | 错误={error}",
                type=type,
                subject=textbook.subject,
                grade=textbook.grade,
                elapsed_time=elapsed_time,
                error=str(e),
            )
        else:
            logger.error(
                "题目生成失败 | type={type} | 耗时={elapsed_time:.2f}秒 | 错误={error}",
                type=type,
                elapsed_time=elapsed_time,
                error=str(e),
            )
        raise
