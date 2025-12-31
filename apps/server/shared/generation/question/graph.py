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
    get_llm_temperature,
    handle_llm_questions,
)

# 最大循环次数，避免无限循环
MAX_LOOP_COUNT = 3


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
    return {"question_type": question_type, "loop_count": 0}


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建 prompt 节点"""

    logger.info("[build_prompt_node] 开始构建 prompt")
    question_type = state["question_type"]
    count = state["count"]
    generated_questions = state.get("generated_questions", [])

    # 计算还需要生成的数量
    remaining_count = count - len(generated_questions)

    logger.debug(
        f"[build_prompt_node] 输入 state: question_type_code={question_type.code}, "
        f"count={count}, generated_questions_count={len(generated_questions)}, remaining_count={remaining_count}"
    )
    logger.info(
        f"[build_prompt_node] 构建 prompt: 已生成={len(generated_questions)}, " f"需要={count}, 还需={remaining_count}"
    )

    # 构建 prompt
    prompt_data = await build_question_generation_prompt(
        question_type=question_type,
        count=remaining_count,
        generated_questions=generated_questions,
    )

    logger.debug(
        f"[build_prompt_node] 输出: prompt_keys={list(prompt_data.keys())}, "
        f"prompt_input_keys={list(prompt_data.get('prompt_input', {}).keys()) if 'prompt_input' in prompt_data else 'N/A'}"
    )
    logger.info("[build_prompt_node] prompt 构建完成")
    return prompt_data


def should_generate_node(state: QuestionGenerationState) -> str:
    """判断是否需要生成题目

    Returns:
        str: "generate" 表示需要生成, "skip" 表示跳过生成
    """
    logger.info("[should_generate_node] 开始判断是否需要生成")
    count = state["count"]
    generated_questions = state.get("generated_questions", [])
    remaining_count = count - len(generated_questions)

    logger.debug(
        f"[should_generate_node] 输入 state: count={count}, "
        f"generated_questions_count={len(generated_questions)}, remaining_count={remaining_count}"
    )

    if remaining_count <= 0:
        logger.info("[should_generate_node] 题目数量已足够，跳过生成")
        logger.debug("[should_generate_node] 输出: skip")
        return "skip"

    logger.info("[should_generate_node] 需要继续生成题目")
    logger.debug("[should_generate_node] 输出: generate")
    return "generate"


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    logger.info("[call_llm_node] 开始调用大模型生成题目")
    logger.debug(
        f"[call_llm_node] 输入 state: question_type_code={state['question_type'].code}, "
        f"prompt_input_keys={list(state.get('prompt_input', {}).keys()) if 'prompt_input' in state else 'N/A'}"
    )

    # 动态调整温度参数以提高多样性
    loop_count = state.get("loop_count", 0)
    generated_questions_count = len(state.get("generated_questions", []))
    count = state.get("count", 1)

    temperature = get_llm_temperature(loop_count, generated_questions_count, count)

    logger.debug(
        f"[call_llm_node] 使用温度参数: {temperature:.2f} (循环次数={loop_count}, 已有题目={generated_questions_count})"
    )

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

    new_generated_questions = handle_llm_questions(
        db=db,
        question_type=question_type,
        llm_questions=questions_list,
    )

    output = {"new_generated_questions": new_generated_questions}
    logger.debug(f"[call_llm_node] 输出: generated_questions_count={len(new_generated_questions)}")
    logger.info("[call_llm_node] 大模型调用节点执行完成")
    return output


async def merge_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """合并题目节点，将新生成的题目合并到唯一题目列表中"""

    logger.info("[merge_questions_node] 开始合并题目")
    generated_questions = state.get("generated_questions", [])
    new_generated_questions = state.get("new_generated_questions", [])

    logger.debug(
        f"[merge_questions_node] 输入 state: generated_questions_count={len(generated_questions)}, "
        f"new_generated_questions_count={len(new_generated_questions)}"
    )

    if not new_generated_questions:
        logger.warning("[merge_questions_node] 没有生成的题目需要合并")
        output = {"generated_questions": generated_questions}
        logger.debug(f"[merge_questions_node] 输出: generated_questions_count={len(generated_questions)}")
        return output

    logger.info(
        f"[merge_questions_node] 合并题目: 新生成={len(new_generated_questions)}, " f"已有={len(generated_questions)}"
    )

    # 合并所有生成的题目到唯一题目列表
    new_generated_questions = list(generated_questions) + list(new_generated_questions)

    logger.info(
        f"[merge_questions_node] 题目合并完成: 新增={len(generated_questions)}道, "
        f"总计={len(new_generated_questions)}道"
    )

    output = {"generated_questions": new_generated_questions}
    logger.debug(f"[merge_questions_node] 输出: generated_questions_count={len(new_generated_questions)}")
    logger.info("[merge_questions_node] 合并节点执行完成")
    return output


def loop_condition_node(state: QuestionGenerationState) -> str:
    """循环条件判断节点

    Returns:
        str: "continue" 表示继续生成, "save" 表示保存并结束
    """
    logger.info("[loop_condition_node] 开始判断循环条件")
    count = state["count"]
    generated_questions = state.get("generated_questions", [])
    loop_count = state.get("loop_count", 0)

    current_count = len(generated_questions)

    logger.debug(
        f"[loop_condition_node] 输入 state: count={count}, "
        f"generated_questions_count={current_count}, loop_count={loop_count}"
    )

    # 检查是否达到目标数量
    if current_count >= count:
        logger.info(f"[loop_condition_node] 题目数量已足够: {current_count} >= {count}")
        logger.debug("[loop_condition_node] 输出: save")
        return "save"

    # 检查是否超过最大循环次数
    if loop_count >= MAX_LOOP_COUNT:
        logger.warning(
            f"[loop_condition_node] 达到最大循环次数: {loop_count} >= {MAX_LOOP_COUNT}, "
            f"当前数量={current_count}, 目标数量={count}"
        )
        logger.debug("[loop_condition_node] 输出: save")
        return "save"

    # 继续生成
    remaining = count - current_count
    logger.info(
        f"[loop_condition_node] 题目数量不足: {current_count} < {count}, "
        f"还需={remaining}道, 继续生成 (循环次数={loop_count + 1})"
    )
    logger.debug("[loop_condition_node] 输出: continue")
    return "continue"


async def increment_loop_count_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """增加循环计数节点"""
    logger.info("[increment_loop_count_node] 开始增加循环计数")
    loop_count = state.get("loop_count", 0)
    logger.debug(f"[increment_loop_count_node] 输入 state: loop_count={loop_count}")

    new_loop_count = loop_count + 1
    output = {"loop_count": new_loop_count}
    logger.debug(f"[increment_loop_count_node] 输出: loop_count={new_loop_count}")
    logger.info(f"[increment_loop_count_node] 循环计数已增加到 {new_loop_count}")
    return output


async def save_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库节点"""

    logger.info("[save_questions_node] 开始保存题目到数据库")
    db = state["db"]
    generated_questions = state.get("generated_questions", [])

    logger.debug(f"[save_questions_node] 输入 state: generated_questions_count={len(generated_questions)}")

    if not generated_questions:
        logger.warning("[save_questions_node] 没有题目需要保存")
        await db.commit()
        output = {"questions": []}
        logger.debug("[save_questions_node] 输出: questions_count=0")
        logger.info("[save_questions_node] 保存节点执行完成（无题目）")
        return output

    count = state.get("count", 0)
    loop_count = state.get("loop_count", 0)

    logger.info(f"[save_questions_node] 开始保存题目到数据库: 共 {len(generated_questions)} 道")

    # 题目已经在 handle_llm_questions 中添加到数据库，这里只需要提交
    await db.commit()

    # 刷新所有题目对象以确保它们与数据库同步
    for question in generated_questions:
        await db.refresh(question)

    # 检查是否达到目标数量
    if len(generated_questions) < count:
        logger.warning(
            f"[save_questions_node] ⚠️ 警告: 目标生成 {count} 道题目，实际生成 {len(generated_questions)} 道，"
            f"完成率 {len(generated_questions)/count*100:.1f}%，循环次数={loop_count}"
        )
    else:
        logger.info(
            f"[save_questions_node] ✓ 成功: 目标生成 {count} 道题目，实际生成 {len(generated_questions)} 道，"
            f"循环次数={loop_count}"
        )

    logger.info(f"[save_questions_node] 题目保存完成，共 {len(generated_questions)} 道题目")
    output = {"questions": generated_questions}
    logger.debug(f"[save_questions_node] 输出: questions_count={len(generated_questions)}")
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
    workflow.add_node("merge_questions", merge_questions_node)
    workflow.add_node("increment_loop", increment_loop_count_node)
    workflow.add_node("save_questions", save_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边
    workflow.add_edge("entry", "build_prompt")

    # 在 build_prompt 之后判断是否需要生成
    workflow.add_conditional_edges(
        "build_prompt",
        should_generate_node,
        {
            "generate": "call_llm",
            "skip": "save_questions",  # 如果不需要生成，直接保存并结束
        },
    )

    workflow.add_edge("call_llm", "merge_questions")

    # 循环条件判断
    workflow.add_conditional_edges(
        "merge_questions",
        loop_condition_node,
        {
            "continue": "increment_loop",
            "save": "save_questions",
        },
    )

    # 增加循环计数后继续生成
    workflow.add_edge("increment_loop", "build_prompt")

    # 保存后结束
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

    # 增加递归限制配置，避免无限循环
    config = {"recursion_limit": 50}  # 增加递归限制到 50
    result = await question_generation_graph.ainvoke(state, config=config)

    # 从最终状态中获取保存的题目列表
    questions = result.get("questions", [])

    # 如果 questions 为空但 generated_questions 不为空，使用 generated_questions
    if not questions:
        generated_questions = result.get("generated_questions", [])
        if generated_questions:
            logger.warning(
                f"[invoke_question_generation_workflow] questions 字段为空，但 generated_questions 有 {len(generated_questions)} 道题目，使用 generated_questions"
            )
            questions = generated_questions

    # 记录最终结果统计
    loop_count = result.get("loop_count", 0)

    logger.info(
        f"[invoke_question_generation_workflow] 工作流执行完成: "
        f"生成题目数量={len(questions)}, 目标数量={count}, "
        f"循环次数={loop_count}"
    )
    logger.debug(f"[invoke_question_generation_workflow] 最终结果: questions_count={len(questions)}")

    if len(questions) == 0:
        if result.get("generated_questions"):
            logger.error(
                f"[invoke_question_generation_workflow] ❌ 错误: 最终返回题目数量为 0，"
                f"但 generated_questions 中有 {len(result.get('generated_questions', []))} 道题目"
            )
        else:
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
