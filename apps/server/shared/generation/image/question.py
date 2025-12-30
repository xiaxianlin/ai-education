"""Image Generation Graph

LangGraph workflow definition for image generation.
"""

from typing import NotRequired, TypedDict

import requests
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, StateGraph
from loguru import logger
from shared.core.database import AsyncSession
from shared.provider import BaseProvider, get_provider
from shared.utils import oss

from .prompt import OPTIMIZE_IMAGE_PROMPT


class QuestionImageGenerationState(TypedDict, total=False):
    """图片生成流程的状态"""

    db: AsyncSession
    # 原始提示词
    prompt: str
    # OSS 路径
    oss_path: str
    # 图片宽度
    width: NotRequired[int]
    # 图片高度
    height: NotRequired[int]
    # AI 功能提供商
    provider: NotRequired[BaseProvider]
    # 是否优化
    optimize: NotRequired[bool]
    # 生成的图片 URL（临时 URL）
    image_url: NotRequired[str]


async def entry_node(state: QuestionImageGenerationState):
    """入口节点，负责基础校验"""

    db: AsyncSession = state.get("db")
    optimize = state.get("optimize", False)

    if not db:
        raise ValueError("数据库会话 (db) 不能为空")

    if not state.get("prompt"):
        raise ValueError("提示词 (prompt) 不能为空")

    if not state.get("width") or not state.get("height"):
        raise ValueError("图片尺寸 (width, height) 不能为空")

    logger.info(
        f"进入图片生成工作流: prompt_length={len(state.get('prompt', ''))}, "
        f"size={state.get('width')}x{state.get('height')}"
    )

    return {
        "optimize": optimize,
        "provider": get_provider(),
    }


async def optimize_prompt_node(state: QuestionImageGenerationState):
    """优化提示词节点"""
    optimize = state["optimize"]

    if not optimize:
        logger.info("跳过提示词优化")
        return {}

    prompt = state["prompt"]
    provider = state["provider"]
    logger.info(f"开始优化提示词，原始提示词: {prompt}")

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", OPTIMIZE_IMAGE_PROMPT),
            ("user", prompt),
        ]
    )

    optimized_prompt = await provider.invoke_chain(prompt)

    logger.info(f"提示词优化完成，优化后提示词: {optimized_prompt}")
    return {"prompt": optimized_prompt}


async def generate_image_node(state: QuestionImageGenerationState):
    """生成图片节点"""
    logger.info("开始生成图片")

    prompt = state["prompt"]
    provider = state["provider"]
    width = state.get("width", 1328)
    height = state.get("height", 1328)

    image_url = provider.invoke_image_generate(prompt, width, height)

    logger.info(f"图片生成成功: {image_url[:100]}...")
    return {"image_url": image_url}


async def upload_oss_node(state: QuestionImageGenerationState):
    """上传到 OSS 节点"""
    oss_path = state.get("oss_path")
    image_url = state.get("image_url")

    logger.info(f"开始上传图片到 OSS: {oss_path}")

    response = requests.get(image_url, stream=True)
    response.raise_for_status()
    oss.upload(oss_path, response.content)
    logger.info("图片上传成功")
    return {}


def create_image_generation_graph():
    """创建图片生成流程图"""
    workflow = StateGraph(QuestionImageGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("prompt_optimizer", optimize_prompt_node)
    workflow.add_node("generate_image", generate_image_node)
    workflow.add_node("upload_oss", upload_oss_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边
    workflow.add_edge("entry", "prompt_optimizer")
    workflow.add_edge("prompt_optimizer", "generate_image")
    workflow.add_edge("generate_image", "upload_oss")
    workflow.add_edge("upload_oss", END)

    return workflow.compile()


question_image_graph = create_image_generation_graph()


async def invoke_question_image_workflow(
    *,
    db: AsyncSession,
    prompt: str,
    oss_path: str,
    width: int = 1328,
    height: int = 1328,
    optimize: bool = True,
) -> str:
    """执行图片生成流程"""
    state = QuestionImageGenerationState(
        db=db,
        prompt=prompt,
        oss_path=oss_path,
        width=width,
        height=height,
        optimize=optimize,
    )
    await question_image_graph.ainvoke(state)
    return oss_path
