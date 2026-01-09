"""练习生成流程图 - 使用LangGraph构建练习生成工作流

工作流节点：
1. load_session_node: 加载练习会话
2. validate_params_node: 验证参数
3. select_question_types_node: 选择题型
4. generate_questions_node: 生成题目
5. prepare_answer_records_node: 预生成答题记录
6. update_session_status_node: 更新会话状态
7. handle_error_node: 错误处理
"""

import asyncio
from typing import Any, Dict

import pendulum
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import Practice, PracticeAnswer, Question
from shared.generation import invoke_question_generation_workflow
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import PracticeGenerationState, PRACTICE_TYPE_ABILITY, PRACTICE_TYPE_UNIT
from .service import (
    cleanup_session_data,
    prepare_answer_records,
    select_question_types,
    validate_ability_practice_params,
    validate_unit_practice_params,
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


# ==================== 节点函数 ====================


async def load_session_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """加载练习会话节点"""
    node_name = "load_session_node"
    log_node_start(node_name, session_id=state.get("session_id"))

    db: AsyncSession = state["db"]
    session_id = state["session_id"]

    # 查询练习会话记录
    session = await db.scalar(select(Practice).where(Practice.id == session_id))
    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    log_node_debug(
        node_name,
        "练习会话加载成功",
        session_id=session_id,
        practice_type=session.practice_type,
        subject=session.subject,
        grade=session.grade,
    )

    log_node_end(node_name, session_id=session_id)
    return {
        "session": session,
        "practice_type": session.practice_type,
    }


async def validate_params_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """验证参数节点"""
    node_name = "validate_params_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    practice_type = state["practice_type"]
    context = {}

    log_node_debug(
        node_name,
        "开始验证参数",
        practice_type=practice_type,
        ability_code=session.ability_code,
        unit_id=session.unit_id,
    )

    if practice_type == PRACTICE_TYPE_ABILITY:
        if not session.ability_code:
            raise ValueError("能力练习需要提供 ability_code")

        # 调用 service 层的验证函数
        context = await validate_ability_practice_params(
            db=db,
            student_id=session.student_id,
            ability_code=session.ability_code,
            subject=session.subject,
            grade=session.grade,
        )

    elif practice_type == PRACTICE_TYPE_UNIT:
        if not session.unit_id:
            raise ValueError("单元练习需要提供 unit_id")

        # 调用 service 层的验证函数
        context = await validate_unit_practice_params(
            db=db,
            student_id=session.student_id,
            unit_id=session.unit_id,
        )
    else:
        raise ValueError(f"不支持的练习类型: practice_type={practice_type}")

    subject = context.get("subject", "") or session.subject or ""
    grade = context.get("grade", 0) or session.grade or 0

    log_node_debug(
        node_name,
        "参数验证完成",
        subject=subject,
        grade=grade,
        context_keys=list(context.keys()),
    )

    log_node_end(node_name)
    return {
        "context": context,
        "subject": subject,
        "grade": grade,
    }


async def select_question_types_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """选择题型节点"""
    node_name = "select_question_types_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    practice_type = state["practice_type"]
    subject = state["subject"]
    grade = state["grade"]
    generate_count = state["generate_count"]
    context = state["context"]

    log_node_debug(
        node_name,
        "开始选择题型",
        practice_type=practice_type,
        subject=subject,
        grade=grade,
        total_count=generate_count,
    )

    # 调用 service 层的题型选择函数
    selections = await select_question_types(
        db=db,
        practice_type=practice_type,
        subject=subject,
        grade=grade,
        total_count=generate_count,
        context=context,
    )

    log_node_debug(node_name, "题型选择完成", selections_count=len(selections))
    log_node_end(node_name, selections_count=len(selections))

    return {"selections": selections}


async def generate_questions_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """生成题目节点"""
    node_name = "generate_questions_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    selections = state["selections"]

    log_node_debug(node_name, "开始生成题目", selections_count=len(selections))

    # 并行生成题目
    tasks = []
    for selection in selections:
        task = invoke_question_generation_workflow(
            db=db,
            question_type_code=selection["question_type_code"],
            count=selection["question_count"],
        )
        tasks.append(task)

    # 并行执行所有题目生成任务
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 合并结果
    all_questions = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            log_node_error(
                node_name,
                f"题目生成任务失败: selection={selections[i]}",
                exc=result if isinstance(result, Exception) else None,
            )
        elif isinstance(result, list):
            all_questions.extend(result)

    if not all_questions:
        raise ValueError("题目生成失败，没有生成任何题目")

    log_node_debug(node_name, "题目生成完成", questions_count=len(all_questions))
    log_node_end(node_name, questions_count=len(all_questions))

    return {"questions": all_questions}


async def prepare_answer_records_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """预生成答题记录节点"""
    node_name = "prepare_answer_records_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    questions = state["questions"]

    log_node_debug(node_name, "开始预生成答题记录", questions_count=len(questions))

    # 调用 service 层的答题记录预生成函数
    await prepare_answer_records(db=db, session=session, questions=questions)

    log_node_debug(node_name, "答题记录预生成完成", records_count=len(questions))
    log_node_end(node_name, records_count=len(questions))

    return {}


async def update_session_status_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """更新会话状态节点"""
    node_name = "update_session_status_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    questions = state["questions"]
    start_time = state.get("start_time", pendulum.now())

    log_node_debug(node_name, "开始更新会话状态", questions_count=len(questions))

    # 更新会话状态为已完成
    end_time = pendulum.now()
    session.question_count = len(questions)
    session.generate_status = 1  # 已完成
    session.generate_time = int(end_time.diff(start_time).in_seconds())

    await db.commit()

    log_node_debug(
        node_name,
        "会话状态更新完成",
        question_count=session.question_count,
        generate_time=session.generate_time,
    )
    log_node_end(
        node_name,
        session_id=session.id,
        question_count=session.question_count,
        generate_time=session.generate_time,
    )

    return {}


async def handle_error_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """错误处理节点"""
    node_name = "handle_error_node"
    log_node_start(node_name)

    db: AsyncSession = state["db"]
    session_id = state["session_id"]
    error = state.get("error", "未知错误")
    session = state.get("session")

    log_node_error(node_name, f"处理错误: {error}", session_id=session_id)

    try:
        # 更新会话状态为生成失败
        if session:
            session.generate_status = -1  # 生成失败
            await db.commit()

        # 调用 service 层的清理函数
        await cleanup_session_data(db=db, session_id=session_id)

        log_node_debug(node_name, "错误处理完成，已清理数据", session_id=session_id)
    except Exception as e:
        log_node_error(node_name, f"错误处理失败: {e}", exc=e)
        await db.rollback()

    log_node_end(node_name, session_id=session_id)
    return {}


# ==================== 图构建 ====================


def create_practice_generation_graph() -> CompiledStateGraph:
    """创建练习生成流程图"""
    workflow = StateGraph(PracticeGenerationState)

    # 添加节点
    workflow.add_node("load_session", load_session_node)
    workflow.add_node("validate_params", validate_params_node)
    workflow.add_node("select_question_types", select_question_types_node)
    workflow.add_node("generate_questions", generate_questions_node)
    workflow.add_node("prepare_answer_records", prepare_answer_records_node)
    workflow.add_node("update_session_status", update_session_status_node)
    workflow.add_node("handle_error", handle_error_node)

    # 设置入口点
    workflow.set_entry_point("load_session")

    # 添加边 - 线性流程
    workflow.add_edge("load_session", "validate_params")
    workflow.add_edge("validate_params", "select_question_types")
    workflow.add_edge("select_question_types", "generate_questions")
    workflow.add_edge("generate_questions", "prepare_answer_records")
    workflow.add_edge("prepare_answer_records", "update_session_status")
    workflow.add_edge("update_session_status", END)

    # 错误处理：所有节点失败时跳转到 handle_error
    workflow.add_edge("handle_error", END)

    return workflow.compile()


# 创建工作流实例
practice_generation_graph = create_practice_generation_graph()


# ==================== 工作流入口函数 ====================


async def invoke_practice_generation_workflow(
    *,
    db: AsyncSession,
    session_id: str,
    generate_count: int = 15,
) -> None:
    """执行练习生成工作流

    Args:
        db: 数据库会话
        session_id: 练习会话 ID
        generate_count: 生成题目数量
    """
    workflow_name = "invoke_practice_generation_workflow"
    logger.info(
        f"[{workflow_name}] 开始执行练习生成工作流",
        session_id=session_id,
        generate_count=generate_count,
    )

    state = PracticeGenerationState(
        db=db,
        session_id=session_id,
        generate_count=generate_count,
        start_time=pendulum.now(),
    )

    try:
        result = await practice_generation_graph.ainvoke(state)
        logger.info(
            f"[{workflow_name}] 工作流执行完成",
            session_id=session_id,
            questions_count=len(result.get("questions", [])),
        )
    except Exception as e:
        logger.error(
            f"[{workflow_name}] 工作流执行失败: session_id={session_id}, error={e}",
            exc_info=True,
        )
        # 尝试清理数据
        try:
            await cleanup_session_data(db, session_id)
        except Exception as cleanup_error:
            logger.error(
                f"[{workflow_name}] 清理数据失败: {cleanup_error}",
                exc_info=True,
            )
        raise
