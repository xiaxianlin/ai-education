"""题目生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import Question, QuestionType
from shared.provider import get_provider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import QuestionGenerationState
from .service import (
    build_question_generation_prompt,
    format_llm_questions,
    handle_llm_questions,
)


async def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验和加载题目类型信息"""

    logger.info("[entry_node] 开始执行入口节点")
    logger.debug(
        f"[entry_node] 输入 state: question_type_code={state.get('question_type_code')}, count={state.get('count')}"
    )

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if not state.get("question_type_code"):
        raise ValueError("题目类型编码（question_type_code）不能为空")

    if not state.get("count") or state.get("count", 0) <= 0:
        raise ValueError("生成数量（count）必须大于 0")

    db: AsyncSession = state["db"]
    question_type_code = state["question_type_code"]

    # 查询题目类型
    result = await db.execute(select(QuestionType).where(QuestionType.code == question_type_code))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题目类型不存在: code={question_type_code}")

    if not question_type.is_active:
        raise ValueError(f"题目类型未启用: code={question_type_code}")

    if not question_type.ai_prompt:
        raise ValueError(f"题目类型的 ai_prompt 不能为空: code={question_type_code}")

    logger.info(f"[entry_node] 题目生成开始: type={question_type_code}")

    logger.info("[entry_node] 入口节点执行完成")
    return {"question_type": question_type}


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建 prompt 节点"""

    logger.info("[build_prompt_node] 开始构建 prompt")
    question_type = state["question_type"]
    count = state["count"]

    logger.debug(f"[build_prompt_node] 输入 state: question_type_code={question_type.code}, count={count}")
    logger.info(f"[build_prompt_node] 构建 prompt: 需要生成 {count} 道题目")

    # 构建 prompt
    prompt_data = await build_question_generation_prompt(
        question_type=question_type,
        count=count,
    )

    logger.debug(
        f"[build_prompt_node] 输出: prompt_keys={list(prompt_data.keys())}, "
        f"prompt_input_keys={list(prompt_data.get('prompt_input', {}).keys()) if 'prompt_input' in prompt_data else 'N/A'}"
    )
    logger.info("[build_prompt_node] prompt 构建完成")
    return prompt_data


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    logger.info("[call_llm_node] 开始调用大模型生成题目")
    logger.debug(
        f"[call_llm_node] 输入 state: question_type_code={state['question_type'].code}, "
        f"prompt_input_keys={list(state.get('prompt_input', {}).keys()) if 'prompt_input' in state else 'N/A'}"
    )

    # 使用固定温度参数
    temperature = 0.7
    logger.debug(f"[call_llm_node] 使用温度参数: {temperature:.2f}")

    provider = get_provider()
    result = await provider.invoke_chain(
        prompt=state["prompt"],
        parser=state["prompt_parser"],
        prompt_input=state["prompt_input"],
        temperature=temperature,
    )

    logger.debug(
        f"[call_llm_node] LLM 原始返回: result_keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}"
    )
    logger.debug(f"[call_llm_node] LLM 原始返回内容: {result}")

    # 格式化 LLM 返回的题目结果
    questions_list = format_llm_questions(result)

    logger.info(f"[call_llm_node] 大模型生成题目完成，共 {len(questions_list)} 道题目")
    logger.debug(f"[call_llm_node] 提取的题目数量: {len(questions_list)}")

    # 处理 LLM 返回的题目
    question_type = state["question_type"]
    db = state["db"]

    questions = handle_llm_questions(
        db=db,
        question_type=question_type,
        llm_questions=questions_list,
    )

    output = {"questions": questions}
    logger.debug(f"[call_llm_node] 输出: questions_count={len(questions)}")
    logger.info("[call_llm_node] 大模型调用节点执行完成")
    return output


async def save_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库节点"""

    logger.info("[save_questions_node] 开始保存题目到数据库")
    db = state["db"]
    questions = state.get("questions", [])

    logger.debug(f"[save_questions_node] 输入 state: questions_count={len(questions)}")

    if not questions:
        logger.warning("[save_questions_node] 没有题目需要保存")
        await db.commit()
        output = {"questions": []}
        logger.debug("[save_questions_node] 输出: questions_count=0")
        logger.info("[save_questions_node] 保存节点执行完成（无题目）")
        return output

    count = state.get("count", 0)
    logger.info(f"[save_questions_node] 开始保存题目到数据库: 共 {len(questions)} 道")

    # 题目已经在 handle_llm_questions 中添加到数据库，这里只需要提交
    await db.commit()

    # 刷新所有题目对象以确保它们与数据库同步
    for question in questions:
        await db.refresh(question)

    # 检查是否达到目标数量
    if len(questions) < count:
        logger.warning(
            f"[save_questions_node] ⚠️ 警告: 目标生成 {count} 道题目，实际生成 {len(questions)} 道，"
            f"完成率 {len(questions)/count*100:.1f}%"
        )
    else:
        logger.info(f"[save_questions_node] ✓ 成功: 目标生成 {count} 道题目，实际生成 {len(questions)} 道")

    logger.info(f"[save_questions_node] 题目保存完成，共 {len(questions)} 道题目")
    output = {"questions": questions}
    logger.debug(f"[save_questions_node] 输出: questions_count={len(questions)}")
    logger.info("[save_questions_node] 保存节点执行完成")
    return output


# ==================== 图构建 ====================


def create_question_generation_graph() -> CompiledStateGraph:
    """创建题目生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("save_questions", save_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边 - 线性流程
    workflow.add_edge("entry", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")
    workflow.add_edge("call_llm", "save_questions")
    workflow.add_edge("save_questions", END)

    return workflow.compile()


question_generation_graph = create_question_generation_graph()


async def invoke_question_generation_workflow(
    *,
    db: AsyncSession,
    question_type_code: str,
    count: int,
) -> List[Question]:
    """执行题目生成工作流

    Args:
        db: 数据库会话
        question_type_code: 题目类型编码
        count: 需要生成的数量

    Returns:
        List[Question]: 生成的题目列表
    """
    logger.info(
        f"[invoke_question_generation_workflow] 开始执行题目生成工作流: "
        f"question_type_code={question_type_code}, count={count}"
    )

    state = QuestionGenerationState(
        db=db,
        question_type_code=question_type_code,
        count=count,
    )

    logger.debug(
        f"[invoke_question_generation_workflow] 初始 state: question_type_code={question_type_code}, count={count}"
    )

    result = await question_generation_graph.ainvoke(state)

    # 从最终状态中获取保存的题目列表
    questions = result.get("questions", [])

    logger.info(
        f"[invoke_question_generation_workflow] 工作流执行完成: " f"生成题目数量={len(questions)}, 目标数量={count}"
    )
    logger.debug(f"[invoke_question_generation_workflow] 最终结果: questions_count={len(questions)}")

    if len(questions) == 0:
        logger.warning(
            "[invoke_question_generation_workflow] ⚠️ 警告: 未能生成任何题目。"
            "可能原因: LLM 生成失败，或 prompt 配置不当。"
        )
    elif len(questions) < count:
        logger.warning(
            f"[invoke_question_generation_workflow] ⚠️ 部分完成: 目标 {count} 道，实际 {len(questions)} 道，"
            f"完成率 {len(questions)/count*100:.1f}%"
        )
    else:
        logger.info(
            f"[invoke_question_generation_workflow] ✓ 成功完成: 生成 {len(questions)} 道题目，" f"达到目标数量 {count}"
        )

    return questions
