"""题目生成流程图 - 使用LangGraph构建题目生成工作流

工作流节点：
1. entry_node: 入口节点，校验参数并加载题目类型
2. build_prompt_node: 构建 prompt
3. call_llm_node: 调用大模型生成题目
4. save_questions_node: 保存题目到数据库
5. generate_resources_node: 生成题目资源（图片、音频等）
"""

import asyncio
from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import Question, QuestionType
from shared.provider import get_provider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from .schema import QuestionGenerationState
from .service import (
    build_question_generation_prompt,
    format_llm_questions,
    generate_question_resources,
    handle_llm_questions,
)

# ==================== 日志辅助函数 ====================


def log_node_start(node_name: str, **context):
    """记录节点开始执行的日志"""
    logger.info(f"[{node_name}] 开始执行节点", **context)


def log_node_end(node_name: str, **context):
    """记录节点执行完成的日志"""
    logger.info(f"[{node_name}] 节点执行完成", **context)


def log_node_debug(node_name: str, message: str, **context):
    """记录节点调试信息"""
    logger.debug(f"[{node_name}] {message}", **context)


def log_node_warning(node_name: str, message: str, **context):
    """记录节点警告信息"""
    logger.warning(f"[{node_name}] {message}", **context)


def log_node_error(node_name: str, message: str, exc: Exception = None, **context):
    """记录节点错误信息"""
    if exc:
        logger.error(f"[{node_name}] {message}", exc_info=exc, **context)
    else:
        logger.error(f"[{node_name}] {message}", **context)


async def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验和加载题目类型信息"""

    node_name = "entry_node"
    log_node_start(node_name)
    log_node_debug(
        node_name,
        "输入 state",
        question_type_code=state.get("question_type_code"),
        count=state.get("count"),
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

    log_node_debug(node_name, f"题目生成开始: type={question_type_code}")
    log_node_end(node_name, question_type_code=question_type_code)
    return {"question_type": question_type}


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建 prompt 节点"""

    node_name = "build_prompt_node"
    log_node_start(node_name)
    question_type = state["question_type"]
    count = state["count"]

    log_node_debug(node_name, "输入 state", question_type_code=question_type.code, count=count)
    log_node_debug(node_name, f"构建 prompt: 需要生成 {count} 道题目")

    # 构建 prompt
    prompt_data = await build_question_generation_prompt(
        question_type=question_type,
        count=count,
    )

    log_node_debug(
        node_name,
        "输出",
        prompt_keys=list(prompt_data.keys()),
        prompt_input_keys=list(prompt_data.get("prompt_input", {}).keys()) if "prompt_input" in prompt_data else "N/A",
    )
    log_node_end(node_name)
    return prompt_data


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    node_name = "call_llm_node"
    log_node_start(node_name, action="调用大模型生成题目")
    log_node_debug(
        node_name,
        "输入 state",
        question_type_code=state["question_type"].code,
        prompt_input_keys=list(state.get("prompt_input", {}).keys()) if "prompt_input" in state else "N/A",
    )

    # 使用固定温度参数
    temperature = 0.7
    log_node_debug(node_name, f"使用温度参数: {temperature:.2f}")

    provider = get_provider()
    result = await provider.invoke_chain(
        prompt=state["prompt"],
        parser=state["prompt_parser"],
        prompt_input=state["prompt_input"],
        temperature=temperature,
    )

    log_node_debug(
        node_name,
        "LLM 原始返回",
        result_keys=list(result.keys()) if isinstance(result, dict) else "N/A",
    )
    log_node_debug(node_name, "LLM 原始返回内容", result=result)

    # 格式化 LLM 返回的题目结果
    questions_list = format_llm_questions(result)

    log_node_debug(node_name, f"大模型生成题目完成，共 {len(questions_list)} 道题目")
    log_node_debug(node_name, "提取的题目数量", questions_count=len(questions_list))

    # 处理 LLM 返回的题目
    question_type = state["question_type"]
    db = state["db"]

    questions = handle_llm_questions(
        db=db,
        question_type=question_type,
        llm_questions=questions_list,
    )

    output = {"questions": questions}
    log_node_debug(node_name, "输出", questions_count=len(questions))
    log_node_end(node_name, questions_count=len(questions))
    return output


async def save_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库节点"""

    node_name = "save_questions_node"
    log_node_start(node_name, action="保存题目到数据库")
    db = state["db"]
    questions = state.get("questions", [])

    log_node_debug(node_name, "输入 state", questions_count=len(questions))

    if not questions:
        log_node_warning(node_name, "没有题目需要保存")
        # 没有题目时不需要提交事务
        output = {"questions": []}
        log_node_debug(node_name, "输出", questions_count=0)
        log_node_end(node_name, status="无题目")
        return output

    count = state.get("count", 0)
    log_node_debug(node_name, f"开始保存题目到数据库: 共 {len(questions)} 道")

    try:
        # 题目已经在 handle_llm_questions 中添加到数据库，这里只需要提交
        await db.commit()
        log_node_debug(node_name, "数据库事务提交成功")

        # 批量刷新所有题目对象以确保它们与数据库同步
        # 注意：SQLAlchemy 异步会话不支持并发操作，必须串行执行
        if questions:
            for question in questions:
                await db.refresh(question)
            log_node_debug(node_name, f"已刷新 {len(questions)} 个题目对象")

    except Exception as e:
        log_node_error(node_name, f"保存题目失败: {type(e).__name__}: {str(e)}", exc=e)
        try:
            await db.rollback()
            log_node_debug(node_name, "已回滚数据库事务")
        except Exception as rollback_error:
            log_node_error(
                node_name,
                f"回滚事务失败: {type(rollback_error).__name__}: {str(rollback_error)}",
                exc=rollback_error,
            )
        raise

    # 检查是否达到目标数量
    if len(questions) < count:
        completion_rate = len(questions) / count * 100
        log_node_warning(
            node_name,
            f"⚠️ 警告: 目标生成 {count} 道题目，实际生成 {len(questions)} 道，完成率 {completion_rate:.1f}%",
            target_count=count,
            actual_count=len(questions),
            completion_rate=completion_rate,
        )
    else:
        log_node_debug(
            node_name,
            f"✓ 成功: 目标生成 {count} 道题目，实际生成 {len(questions)} 道",
            target_count=count,
            actual_count=len(questions),
        )

    log_node_debug(node_name, f"题目保存完成，共 {len(questions)} 道题目")
    output = {"questions": questions}
    log_node_debug(node_name, "输出", questions_count=len(questions))
    log_node_end(node_name, questions_count=len(questions))
    return output


async def _generate_resources_for_question(question: Question, node_name: str) -> bool:
    """为单个题目生成所有资源

    Args:
        question: 题目对象
        node_name: 节点名称（用于日志）

    Returns:
        bool: 是否成功生成资源
    """
    try:
        new_resources = await generate_question_resources(question)
        question.resources = new_resources
        flag_modified(question, "resources")
        log_node_debug(node_name, f"题目资源生成完成: question_id={question.id}, resources_count={len(new_resources)}")
        return True
    except Exception as e:
        log_node_error(
            node_name,
            f"题目资源生成失败: question_id={question.id}, error={type(e).__name__}: {str(e)}",
            exc=e,
        )
        # 资源生成失败不影响其他题目，继续处理
        return False


async def generate_resources_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """生成题目资源节点（图片、音频等）

    节点负责并发调用 service 层的资源生成函数
    """

    node_name = "generate_resources_node"
    log_node_start(node_name, action="生成题目资源")
    db = state["db"]
    questions = state.get("questions", [])

    log_node_debug(node_name, "输入 state", questions_count=len(questions))

    if not questions:
        log_node_debug(node_name, "没有题目需要生成资源")
        log_node_end(node_name, status="无题目")
        return {"questions": questions}

    # 统计需要生成资源的题目数量
    questions_with_resources = [q for q in questions if q.resources]
    log_node_debug(
        node_name,
        f"开始生成资源: 共 {len(questions)} 道题目，其中 {len(questions_with_resources)} 道需要生成资源",
        total_questions=len(questions),
        questions_with_resources=len(questions_with_resources),
    )

    if not questions_with_resources:
        log_node_debug(node_name, "没有题目需要生成资源")
        log_node_end(node_name, status="无资源")
        return {"questions": questions}

    # 并发执行所有题目的资源生成
    log_node_debug(node_name, f"开始并发生成 {len(questions_with_resources)} 道题目的资源")
    try:
        results = await asyncio.gather(
            *[_generate_resources_for_question(q, node_name) for q in questions_with_resources]
        )
        success_count = sum(1 for r in results if r)
        log_node_debug(
            node_name,
            f"资源生成完成: 成功 {success_count}/{len(questions_with_resources)} 道题目",
            success_count=success_count,
            total_count=len(questions_with_resources),
        )
    except Exception as e:
        log_node_error(node_name, f"资源生成过程中发生错误: {type(e).__name__}: {str(e)}", exc=e)
        # 部分资源生成失败不影响已生成的资源，继续处理

    # 提交资源更新到数据库
    try:
        await db.commit()
        log_node_debug(node_name, "资源更新已提交到数据库")
    except Exception as e:
        log_node_error(node_name, f"提交资源更新失败: {type(e).__name__}: {str(e)}", exc=e)
        try:
            await db.rollback()
            log_node_debug(node_name, "已回滚资源更新事务")
        except Exception as rollback_error:
            log_node_error(
                node_name,
                f"回滚资源更新事务失败: {type(rollback_error).__name__}: {str(rollback_error)}",
                exc=rollback_error,
            )
        # 资源生成失败不影响题目本身，不抛出异常

    log_node_end(
        node_name,
        total_questions=len(questions),
        questions_with_resources=len(questions_with_resources),
    )
    return {"questions": questions}


# ==================== 图构建 ====================


def create_question_generation_graph() -> CompiledStateGraph:
    """创建题目生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("save_questions", save_questions_node)
    workflow.add_node("generate_resources", generate_resources_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边 - 线性流程
    workflow.add_edge("entry", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")
    workflow.add_edge("call_llm", "save_questions")
    workflow.add_edge("save_questions", "generate_resources")
    workflow.add_edge("generate_resources", END)

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

    Raises:
        ValueError: 如果输入参数无效
        Exception: 如果工作流执行失败
    """
    workflow_name = "invoke_question_generation_workflow"
    logger.info(
        f"[{workflow_name}] 开始执行题目生成工作流",
        question_type_code=question_type_code,
        count=count,
    )

    # 输入验证
    if not question_type_code or not isinstance(question_type_code, str):
        raise ValueError("题目类型编码（question_type_code）不能为空且必须是字符串")

    if not isinstance(count, int) or count <= 0:
        raise ValueError("生成数量（count）必须是大于 0 的整数")

    if count > 100:
        raise ValueError(f"生成数量（count）不能超过 100，当前值: {count}")

    state = QuestionGenerationState(
        db=db,
        question_type_code=question_type_code,
        count=count,
    )

    logger.debug(
        f"[{workflow_name}] 初始 state",
        question_type_code=question_type_code,
        count=count,
    )

    try:
        result = await question_generation_graph.ainvoke(state)

        # 从最终状态中获取保存的题目列表
        questions = result.get("questions", [])

        logger.info(
            f"[{workflow_name}] 工作流执行完成",
            questions_count=len(questions),
            target_count=count,
        )
        logger.debug(f"[{workflow_name}] 最终结果", questions_count=len(questions))

        if len(questions) == 0:
            logger.warning(
                f"[{workflow_name}] ⚠️ 警告: 未能生成任何题目。可能原因: LLM 生成失败，或 prompt 配置不当。",
                question_type_code=question_type_code,
                target_count=count,
            )
        elif len(questions) < count:
            completion_rate = len(questions) / count * 100
            logger.warning(
                f"[{workflow_name}] ⚠️ 部分完成: 目标 {count} 道，实际 {len(questions)} 道，完成率 {completion_rate:.1f}%",
                question_type_code=question_type_code,
                target_count=count,
                actual_count=len(questions),
                completion_rate=completion_rate,
            )
        else:
            logger.info(
                f"[{workflow_name}] ✓ 成功完成: 生成 {len(questions)} 道题目，达到目标数量 {count}",
                question_type_code=question_type_code,
                target_count=count,
                actual_count=len(questions),
            )

        return questions
    except Exception as e:
        # 工作流执行失败，回滚数据库事务
        logger.error(
            f"[{workflow_name}] 工作流执行失败: {type(e).__name__}: {str(e)}",
            exc_info=True,
            question_type_code=question_type_code,
            count=count,
        )
        try:
            await db.rollback()
            logger.debug(f"[{workflow_name}] 已回滚数据库事务")
        except Exception as rollback_error:
            logger.error(
                f"[{workflow_name}] 回滚事务失败: {type(rollback_error).__name__}: {str(rollback_error)}",
                exc_info=True,
            )
        raise
