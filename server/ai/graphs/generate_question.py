from typing import Dict, Any, List, TypedDict

from langgraph.graph import StateGraph, END
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Question
from ai.services.question import (
    validate_question_params,
    load_unit_data,
    generate_prompt,
    call_llm,
    convert_to_question_objects,
    generate_images,
    generate_audio,
    upload_files,
    save_questions,
)


class QuestionGenerationState(TypedDict):
    """问题生成流程的状态"""
    unit_id: int
    count: int
    unit: Any
    textbook: Any
    knowledge_text: str
    prompt: Any
    prompt_input: Dict[str, Any]
    parser: Any
    generated_questions: List[Any]
    questions: List[Question]
    image_questions: List[Question]
    audio_questions: List[Question]
    direct_questions: List[Question]
    saved_questions: List[Question]
    db: AsyncSession


async def check_params_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点1: 检查问题生成参数，失败直接退出"""
    logger.info("开始检查问题生成参数")
    await validate_question_params(state["unit_id"], state["count"])
    logger.info("参数检查通过")
    return state


async def load_data_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点2: 加载单元数据"""
    logger.info("开始加载单元数据")
    data = await load_unit_data(state["db"], state["unit_id"])
    state.update(data)
    logger.info("单元数据加载完成")
    return state


async def create_prompt_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点3: 根据传入参数生成对应的 prompt"""
    logger.info("开始生成 prompt")
    result = await generate_prompt(state)
    state.update(result)
    logger.info("Prompt 生成完成")
    return state


async def call_llm_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点4: 调用大模型结构化输出内容"""
    logger.info("开始调用大模型生成题目")
    result = await call_llm(state)
    state.update(result)
    logger.info(f"大模型生成完成，共生成 {len(state['generated_questions'])} 道题目")
    return state


async def convert_and_route_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点5: 将内容转换成 Question 数组，并根据问题类型分流"""
    logger.info("开始转换问题对象并分流")
    result = await convert_to_question_objects(state)
    state.update(result)
    
    logger.info(
        f"问题转换完成: 辨识题 {len(state['image_questions'])}, "
        f"音频题 {len(state['audio_questions'])}, "
        f"其他题目 {len(state['direct_questions'])}"
    )
    return state


async def route_after_convert(state: QuestionGenerationState) -> str:
    """路由函数：根据问题类型决定下一步"""
    image_questions = state.get("image_questions", [])
    audio_questions = state.get("audio_questions", [])
    
    # 如果有图片题，先进入图片生成节点
    if image_questions:
        return "generate_images"
    # 如果有音频题，进入音频生成节点
    elif audio_questions:
        return "generate_audio"
    # 如果都没有，直接进入存储节点
    else:
        return "save_questions"


async def generate_images_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点6: 图片生成节点"""
    logger.info("开始生成图片")
    result = await generate_images(state)
    state.update(result)
    logger.info("图片生成完成")
    return state


async def generate_audio_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点7: 语音生成节点"""
    logger.info("开始生成语音")
    result = await generate_audio(state)
    state.update(result)
    logger.info("语音生成完成")
    return state


async def upload_files_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点8: 文件上传节点"""
    logger.info("开始上传文件到 OSS")
    result = await upload_files(state)
    state.update(result)
    logger.info("文件上传完成")
    return state


async def save_questions_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点9: 数据存储节点"""
    logger.info("开始保存问题到数据库")
    result = await save_questions(state["db"], state)
    state.update(result)
    logger.info(f"问题保存完成，共保存 {len(state['saved_questions'])} 道题目")
    return state


def create_question_generation_graph() -> StateGraph:
    """创建问题生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("check_params", check_params_node)
    workflow.add_node("load_data", load_data_node)
    workflow.add_node("create_prompt", create_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("convert_and_route", convert_and_route_node)
    workflow.add_node("generate_images", generate_images_node)
    workflow.add_node("generate_audio", generate_audio_node)
    workflow.add_node("upload_files", upload_files_node)
    workflow.add_node("save_questions", save_questions_node)

    # 设置入口
    workflow.set_entry_point("check_params")

    # 定义流程
    workflow.add_edge("check_params", "load_data")
    workflow.add_edge("load_data", "create_prompt")
    workflow.add_edge("create_prompt", "call_llm")
    workflow.add_edge("call_llm", "convert_and_route")
    
    # 根据问题类型分流
    workflow.add_conditional_edges(
        "convert_and_route",
        route_after_convert,
        {
            "generate_images": "generate_images",
            "generate_audio": "generate_audio",
            "save_questions": "save_questions",
        }
    )
    
    # 图片生成后，检查是否需要生成音频，或直接上传
    workflow.add_conditional_edges(
        "generate_images",
        lambda state: "generate_audio" if state.get("audio_questions") else "upload_files",
        {
            "generate_audio": "generate_audio",
            "upload_files": "upload_files",
        }
    )
    
    # 音频生成后进入上传节点
    workflow.add_edge("generate_audio", "upload_files")
    
    # 上传完成后进入存储节点
    workflow.add_edge("upload_files", "save_questions")
    
    # 存储节点完成后结束
    workflow.add_edge("save_questions", END)

    return workflow.compile()


# 创建全局图实例
_question_generation_graph = None


def get_question_generation_graph() -> StateGraph:
    """获取问题生成图实例（单例模式）"""
    global _question_generation_graph
    if _question_generation_graph is None:
        _question_generation_graph = create_question_generation_graph()
    return _question_generation_graph


async def generate_question_graph(
    db: AsyncSession, unit_id: int, count: int
) -> Dict[str, Any]:
    """执行问题生成流程"""
    graph = get_question_generation_graph()
    
    initial_state: QuestionGenerationState = {
        "unit_id": unit_id,
        "count": count,
        "db": db,
    }
    
    result = await graph.ainvoke(initial_state)
    return result

