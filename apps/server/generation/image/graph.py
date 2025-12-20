"""Image Generation Graph

LangGraph workflow definition for image generation.
"""

from typing import Any, Dict
from loguru import logger
from langgraph.graph import END, StateGraph

from generation.image.schema import ImageGenerationState
from generation.image.services.generate import ImageGenerateService


def entry_node(state: ImageGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    logger.info(
        f"进入图片生成工作流: prompt_length={len(state.get('prompt', ''))}, "
        f"size={state.get('width')}x{state.get('height')}"
    )

    if not state.get("prompt"):
        raise ValueError("提示词 (prompt) 不能为空")

    return {}


async def optimize_prompt_node(state: ImageGenerationState) -> Dict[str, Any]:
    """优化提示词节点"""
    if not state.get("optimize_prompt", True):
        logger.info("跳过提示词优化")
        return {"optimized_prompt": state.get("prompt")}

    logger.info("开始优化提示词")
    optimized = await ImageGenerateService.optimize_prompt(
        text=state.get("prompt", ""),
        db=state.get("db"),
    )
    logger.info(f"提示词优化完成，优化后长度: {len(optimized)}")
    return {"optimized_prompt": optimized}


async def generate_image_node(state: ImageGenerationState) -> Dict[str, Any]:
    """生成图片节点"""
    logger.info("开始生成图片")

    prompt = state.get("optimized_prompt") or state.get("prompt", "")
    width = state.get("width", 1328)
    height = state.get("height", 1328)

    image_url = await ImageGenerateService.generate(
        prompt=prompt,
        width=width,
        height=height,
    )

    logger.info(f"图片生成成功: {image_url[:100]}...")
    return {"image_url": image_url}


async def upload_oss_node(state: ImageGenerationState) -> Dict[str, Any]:
    """上传到 OSS 节点"""
    oss_path = state.get("oss_path")
    image_url = state.get("image_url")

    if not oss_path:
        logger.info("未指定 OSS 路径，跳过上传")
        return {}

    if not image_url:
        logger.warning("图片 URL 为空，无法上传")
        return {}

    logger.info(f"开始上传图片到 OSS: {oss_path}")
    final_path = await ImageGenerateService.upload(
        image_url=image_url,
        oss_path=oss_path,
    )
    logger.info(f"图片上传成功: {final_path}")
    return {"final_path": final_path, "image_url": final_path}


def create_image_generation_graph() -> StateGraph:
    """创建图片生成流程图"""
    workflow = StateGraph(ImageGenerationState)

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
