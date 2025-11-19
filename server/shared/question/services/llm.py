"""LLM调用服务 - 负责调用大模型生成题目"""
from typing import Any, Dict
from loguru import logger

from langchain_openai import ChatOpenAI

from core.settings import envs
from shared.question.types import QuestionGenerationState
from shared.question.types import QuestionGenerationResult


async def call_llm(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型结构化输出内容，内容为数组"""
    prompt = state["prompt"]
    prompt_input = state["prompt_input"]
    parser = state["parser"]

    llm = ChatOpenAI(
        model_name="qwen3-max",
        temperature=0.7,
        openai_api_key=envs.AI_PLATFORM_KEY,
        openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    chain = prompt | llm | parser

    try:
        result = chain.invoke(prompt_input)
    except Exception as e:
        logger.error(f"LLM 调用失败: {e}")
        raise ValueError(f"大模型调用失败: {str(e)}")

    # 检查结果是否为 None
    if result is None:
        logger.error("LLM 返回结果为 None")
        raise ValueError("大模型返回结果为空，请检查 prompt 或重试")

    # 确保 result 是字典类型
    if not isinstance(result, dict):
        logger.error(f"LLM 返回结果类型错误: {type(result)}, 内容: {result}")
        raise ValueError(f"大模型返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 处理 knowledge 字段：如果 LLM 返回的是列表，转换为字符串
    if "questions" in result:
        # 确保 questions 是列表
        if not isinstance(result["questions"], list):
            logger.error(f"questions 字段类型错误: {type(result['questions'])}")
            raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")

        for question in result["questions"]:
            if not isinstance(question, dict):
                logger.warning(f"题目项类型错误: {type(question)}, 跳过处理")
                continue

            if "knowledge" in question and isinstance(question["knowledge"], list):
                # 将列表转换为字符串，用顿号分隔
                question["knowledge"] = "、".join(str(k) for k in question["knowledge"])
            elif "knowledge" in question and not isinstance(question["knowledge"], str):
                # 如果不是字符串也不是列表，转换为字符串
                question["knowledge"] = str(question["knowledge"]) if question["knowledge"] else ""
            elif "knowledge" not in question:
                # 如果没有 knowledge 字段，设置为空字符串
                question["knowledge"] = ""
    else:
        logger.warning("LLM 返回结果中没有 questions 字段，尝试创建空列表")
        result["questions"] = []

    # 验证并转换结果
    try:
        validated_result = QuestionGenerationResult.model_validate(result)
    except Exception as e:
        logger.error(f"结果验证失败: {e}, 原始结果: {result}")
        raise ValueError(f"题目生成结果验证失败: {str(e)}，请检查 prompt 或重试")

    return {
        "generated_questions": validated_result.questions,
    }

