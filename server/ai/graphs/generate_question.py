from typing import Dict, Any, List, TypedDict

from langgraph.graph import StateGraph, END
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Question, AsyncSessionLocal
from ai.services.question import (
    validate_question_params,
    load_unit_data,
    generate_prompt,
    optimize_prompt,
    call_llm,
    convert_to_question_objects,
    generate_images,
    generate_audio,
    upload_files,
    upload_questions,
)


class QuestionGenerationState(TypedDict):
    """问题生成流程的状态"""

    unit_id: int
    count: int
    unit: Any
    textbook: Any
    knowledge_text: str
    knowledge: str
    prompt: Any
    prompt_input: Dict[str, Any]
    parser: Any
    generated_questions: List[Any]
    questions: List[Question]
    image_questions: List[Question]
    audio_questions: List[Question]
    text_questions: List[Question]
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


async def optimize_prompt_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点4: 优化生成的 prompt"""
    logger.info("开始优化 prompt")
    result = await optimize_prompt(state)
    state.update(result)
    logger.info("Prompt 优化完成")
    return state


async def call_llm_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点5: 调用大模型结构化输出内容"""
    logger.info("开始调用大模型生成题目")
    result = await call_llm(state)
    state.update(result)
    logger.info(f"大模型生成完成，共生成 {len(state['generated_questions'])} 道题目")
    return state


async def convert_data_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点6: 将内容转换成 Question 数组，并根据问题类型分流，然后保存到数据库"""
    logger.info("开始转换问题对象并分流")
    result = await convert_to_question_objects(state)
    state.update(result)

    logger.info(
        f"问题转换完成: 辨识题 {len(state['image_questions'])}, "
        f"音频题 {len(state['audio_questions'])}, "
        f"其他题目 {len(state['text_questions'])}"
    )

    # 保存所有问题到数据库
    all_questions = (
        state.get("image_questions", [])
        + state.get("audio_questions", [])
        + state.get("text_questions", [])
    )

    if all_questions:
        db = state["db"]
        db.add_all(all_questions)
        await db.commit()
        # 刷新对象以获取数据库生成的 ID
        for question in all_questions:
            await db.refresh(question)
        logger.info(f"成功保存 {len(all_questions)} 道题目到数据库")
    else:
        logger.warning("没有需要保存的题目")

    return state


async def handle_image_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """图片处理节点：为辨识题生成图片"""
    image_questions = state.get("image_questions", [])
    if not image_questions:
        logger.info("跳过图片处理（没有图片题）")
        return state

    logger.info("开始生成图片")
    result = await generate_images(state)
    state.update(result)
    logger.info("图片生成完成")
    return state


async def handle_audio_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """音频处理节点：为跟读题和听力题生成语音"""
    audio_questions = state.get("audio_questions", [])
    if not audio_questions:
        logger.info("跳过音频处理（没有音频题）")
        return state

    logger.info("开始生成语音")
    result = await generate_audio(state)
    state.update(result)
    logger.info("语音生成完成")
    return state


async def handle_text_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """文本处理节点：处理文本题目"""
    text_questions = state.get("text_questions", [])
    if not text_questions:
        logger.info("跳过文本处理（没有文本题）")
        return {}

    logger.info("开始处理文本题目")
    # 文本题目已在 convert_data 节点中保存，这里不需要额外处理
    logger.info(f"文本题目处理完成，共 {len(text_questions)} 道题目")
    # 返回空字典，不更新任何状态字段，避免并发更新冲突
    return {}


async def upload_files_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点8: 文件上传节点"""
    logger.info("开始上传文件到 OSS")
    result = await upload_files(state)
    state.update(result)
    logger.info("文件上传完成")
    return state


async def upload_questions_node(state: QuestionGenerationState) -> QuestionGenerationState:
    """节点9: 数据更新节点"""
    logger.info("开始更新问题数据")
    result = await upload_questions(state["db"], state)
    state.update(result)
    logger.info(f"问题更新完成，共更新 {len(state['saved_questions'])} 道题目")
    return state


def create_question_generation_graph() -> StateGraph:
    """创建问题生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("check_params", check_params_node)
    workflow.add_node("load_data", load_data_node)
    workflow.add_node("create_prompt", create_prompt_node)
    workflow.add_node("optimize_prompt", optimize_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("convert_data", convert_data_node)
    workflow.add_node("handle_image", handle_image_node)
    workflow.add_node("handle_audio", handle_audio_node)
    workflow.add_node("handle_text", handle_text_node)
    workflow.add_node("upload_files", upload_files_node)
    workflow.add_node("upload_questions", upload_questions_node)

    # 设置入口
    workflow.set_entry_point("check_params")

    # 定义流程
    workflow.add_edge("check_params", "load_data")
    workflow.add_edge("load_data", "create_prompt")
    workflow.add_edge("create_prompt", "optimize_prompt")
    workflow.add_edge("optimize_prompt", "call_llm")
    workflow.add_edge("call_llm", "convert_data")

    # 从 convert_data 节点直接并行连接到 3 个处理节点
    # LangGraph 支持从同一节点添加多条边，这些边会并行执行
    workflow.add_edge("convert_data", "handle_image")
    workflow.add_edge("convert_data", "handle_audio")
    workflow.add_edge("convert_data", "handle_text")

    # 图片处理完成后，进入上传节点
    workflow.add_edge("handle_image", "upload_files")

    # 音频处理完成后，进入上传节点（多个边指向同一节点，会等待所有前驱节点完成）
    workflow.add_edge("handle_audio", "upload_files")

    # 上传完成后进入更新节点（等待所有上传任务完成）
    workflow.add_edge("upload_files", "upload_questions")

    # 文本处理完成后，也进入最终更新节点（合并所有结果）
    workflow.add_edge("handle_text", "upload_questions")

    # 更新节点完成后结束
    workflow.add_edge("upload_questions", END)

    return workflow.compile()


# 创建全局图实例
_question_generation_graph = None


def get_question_generation_graph() -> StateGraph:
    """获取问题生成图实例（单例模式）"""
    global _question_generation_graph
    if _question_generation_graph is None:
        _question_generation_graph = create_question_generation_graph()
    return _question_generation_graph


# LangGraph CLI 入口点
# 这个函数会被 LangGraph CLI 调用，用于在开发环境中测试图
async def create_graph_with_db():
    """为 LangGraph CLI 创建带数据库连接的图"""
    # 创建一个数据库会话
    db = AsyncSessionLocal()
    
    # 创建一个包装图，在调用时自动注入数据库会话
    graph = get_question_generation_graph()
    
    # 返回一个包装函数，用于 LangGraph CLI
    async def invoke_with_db(state: Dict[str, Any]) -> Dict[str, Any]:
        """包装函数，自动注入数据库会话"""
        state["db"] = db
        return await graph.ainvoke(state)
    
    return invoke_with_db


async def generate_question_graph(db: AsyncSession, unit_id: int, count: int) -> Dict[str, Any]:
    """执行问题生成流程"""
    graph = get_question_generation_graph()

    initial_state: QuestionGenerationState = {
        "unit_id": unit_id,
        "count": count,
        "db": db,
    }

    result = await graph.ainvoke(initial_state)
    return result
