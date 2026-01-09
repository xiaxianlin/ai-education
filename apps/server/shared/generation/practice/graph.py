"""练习生成流程图 - 使用LangGraph构建练习生成工作流

工作流节点：
1. load_session_node: 加载练习会话
2. validate_params_node: 验证参数并更新会话的 subject/grade
3. select_question_types_node: 选择题型
4. generate_questions_node: 生成题目
5. prepare_answer_records_node: 预生成答题记录
6. update_session_status_node: 更新会话状态
"""

import asyncio
from typing import Any, Dict, Optional

import pendulum
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import Practice
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import PRACTICE_TYPE_ABILITY, PRACTICE_TYPE_UNIT, PracticeGenerationState
from .service import (
    cleanup_session_data,
    prepare_answer_records,
    select_question_types,
    validate_ability_practice_params,
    validate_unit_practice_params,
)

# 进度常量
PROGRESS_STEP_LOAD = "load_session"
PROGRESS_STEP_VALIDATE = "validate_params"
PROGRESS_STEP_SELECT_TYPES = "select_question_types"
PROGRESS_STEP_GENERATE = "generate_questions"
PROGRESS_STEP_PREPARE = "prepare_records"
PROGRESS_STEP_COMPLETE = "complete"


async def _update_progress(session_id: str, progress: int, step: str, message: str = "") -> None:
    """更新进度（安全调用，不抛出异常）"""
    try:
        from shared.services.progress import progress_service

        await progress_service.update_progress(session_id, progress, step, message)
    except Exception:
        pass  # 进度更新失败不影响主流程


async def _checkpoint_step(session_id: str, step: str, data: Optional[Dict[str, Any]] = None) -> None:
    """保存步骤检查点（安全调用）"""
    try:
        from shared.services.checkpoint import checkpoint_service

        await checkpoint_service.save_checkpoint(session_id, step, data)
    except Exception:
        pass  # 检查点保存失败不影响主流程


# ==================== 节点函数 ====================


async def load_session_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """加载练习会话节点"""
    log = logger.bind(node="load_session")
    db: AsyncSession = state["db"]
    session_id = state["session_id"]

    await _update_progress(session_id, 5, PROGRESS_STEP_LOAD, "加载会话...")
    log.info(f"开始加载会话: session_id={session_id}")

    session = await db.scalar(select(Practice).where(Practice.id == session_id))
    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    log.debug(
        f"会话加载成功: practice_type={session.practice_type}, "
        f"ability_code={session.ability_code}, unit_id={session.unit_id}"
    )

    await _update_progress(session_id, 10, PROGRESS_STEP_LOAD, "会话加载完成")
    await _checkpoint_step(session_id, PROGRESS_STEP_LOAD)

    return {
        "session": session,
        "practice_type": session.practice_type,
    }


async def validate_params_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """验证参数节点 - 同时更新会话的 subject 和 grade"""
    log = logger.bind(node="validate_params")
    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    practice_type = state["practice_type"]
    session_id = state["session_id"]
    context = {}

    await _update_progress(session_id, 15, PROGRESS_STEP_VALIDATE, "验证参数...")
    log.info(f"开始验证参数: practice_type={practice_type}")

    if practice_type == PRACTICE_TYPE_ABILITY:
        if not session.ability_code:
            raise ValueError("能力练习需要提供 ability_code")

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

        context = await validate_unit_practice_params(
            db=db,
            student_id=session.student_id,
            unit_id=session.unit_id,
        )
    else:
        raise ValueError(f"不支持的练习类型: practice_type={practice_type}")

    subject = context.get("subject", "") or session.subject or ""
    grade = context.get("grade", 0) or session.grade or 0

    # 更新会话的 subject 和 grade（如果之前未设置）
    if not session.subject or not session.grade:
        session.subject = subject
        session.grade = grade
        await db.flush()
        log.debug(f"更新会话 subject/grade: subject={subject}, grade={grade}")

    await _update_progress(session_id, 20, PROGRESS_STEP_VALIDATE, "参数验证完成")
    await _checkpoint_step(session_id, PROGRESS_STEP_VALIDATE, {"subject": subject, "grade": grade})
    log.info(f"参数验证完成: subject={subject}, grade={grade}")

    return {
        "context": context,
        "subject": subject,
        "grade": grade,
    }


async def select_question_types_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """选择题型节点"""
    log = logger.bind(node="select_question_types")
    db: AsyncSession = state["db"]
    practice_type = state["practice_type"]
    subject = state["subject"]
    grade = state["grade"]
    generate_count = state["generate_count"]
    context = state["context"]
    session_id = state["session_id"]

    await _update_progress(session_id, 25, PROGRESS_STEP_SELECT_TYPES, "选择题型...")
    log.info(f"开始选择题型: subject={subject}, grade={grade}, count={generate_count}")

    selections = await select_question_types(
        db=db,
        practice_type=practice_type,
        subject=subject,
        grade=grade,
        total_count=generate_count,
        context=context,
    )

    await _update_progress(session_id, 35, PROGRESS_STEP_SELECT_TYPES, f"已选择 {len(selections)} 种题型")
    await _checkpoint_step(session_id, PROGRESS_STEP_SELECT_TYPES, {"selections_count": len(selections)})
    log.info(f"题型选择完成: {len(selections)} 种题型")

    return {"selections": selections}


async def generate_questions_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """生成题目节点 - 支持部分成功

    当至少 50% 的题目生成成功时，视为部分成功，允许继续流程。
    """
    # Lazy import to avoid circular dependency
    from shared.generation import invoke_question_generation_workflow

    log = logger.bind(node="generate_questions")
    db: AsyncSession = state["db"]
    selections = state["selections"]
    session_id = state["session_id"]

    # 最小成功率阈值
    MIN_SUCCESS_RATE = 0.5

    await _update_progress(session_id, 40, PROGRESS_STEP_GENERATE, "开始生成题目...")
    log.info(f"开始并行生成题目: {len(selections)} 种题型")

    # 计算期望的总题目数
    total_expected = sum(s["question_count"] for s in selections)

    # 并行生成题目
    tasks = [
        invoke_question_generation_workflow(
            db=db,
            question_type_code=selection["question_type_code"],
            count=selection["question_count"],
        )
        for selection in selections
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 合并结果，记录失败
    all_questions = []
    failed_selections = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            failed_selections.append(selections[i])
            log.error(f"题目生成失败: selection={selections[i]}, error={result}")
        elif isinstance(result, list):
            all_questions.extend(result)

    # 计算成功率
    success_count = len(all_questions)
    success_rate = success_count / total_expected if total_expected > 0 else 0

    # 检查是否达到最小成功率
    if success_count == 0:
        raise ValueError("题目生成失败，没有生成任何题目")

    if success_rate < MIN_SUCCESS_RATE:
        raise ValueError(
            f"题目生成成功率过低: {success_rate:.0%} < {MIN_SUCCESS_RATE:.0%} "
            f"(成功 {success_count}/{total_expected} 题)"
        )

    # 部分成功
    if failed_selections:
        log.warning(
            f"部分题目生成失败，但成功率 {success_rate:.0%} >= {MIN_SUCCESS_RATE:.0%}，继续流程。"
            f"失败的题型: {[s['question_type_code'] for s in failed_selections]}"
        )

    await _update_progress(session_id, 85, PROGRESS_STEP_GENERATE, f"已生成 {success_count} 道题目")
    await _checkpoint_step(
        session_id,
        PROGRESS_STEP_GENERATE,
        {"questions_count": success_count, "success_rate": success_rate},
    )
    log.info(
        f"题目生成完成: 成功 {success_count}/{total_expected} 题 ({success_rate:.0%}), "
        f"失败 {len(failed_selections)} 种题型"
    )

    return {
        "questions": all_questions,
        "generation_stats": {
            "expected": total_expected,
            "actual": success_count,
            "success_rate": success_rate,
            "failed_types": [s["question_type_code"] for s in failed_selections],
        },
    }


async def prepare_answer_records_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """预生成答题记录节点"""
    log = logger.bind(node="prepare_answer_records")
    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    questions = state["questions"]
    session_id = state["session_id"]

    await _update_progress(session_id, 90, PROGRESS_STEP_PREPARE, "准备答题记录...")
    log.info(f"开始预生成答题记录: {len(questions)} 题")

    await prepare_answer_records(db=db, session=session, questions=questions)

    await _update_progress(session_id, 95, PROGRESS_STEP_PREPARE, "答题记录准备完成")
    await _checkpoint_step(session_id, PROGRESS_STEP_PREPARE, {"records_count": len(questions)})
    log.info(f"答题记录预生成完成: {len(questions)} 条")

    return {}


async def update_session_status_node(state: PracticeGenerationState) -> Dict[str, Any]:
    """更新会话状态节点"""
    log = logger.bind(node="update_session_status")
    db: AsyncSession = state["db"]
    session: Practice = state["session"]
    questions = state["questions"]
    session_id = state["session_id"]
    start_time = state.get("start_time", pendulum.now())

    log.info(f"开始更新会话状态: {len(questions)} 题")

    # 更新会话状态为已完成
    end_time = pendulum.now()
    session.question_count = len(questions)
    session.generate_status = 1  # 已完成
    session.generate_time = int(end_time.diff(start_time).in_seconds())

    await db.commit()

    await _update_progress(session_id, 100, PROGRESS_STEP_COMPLETE, "练习生成完成")
    log.info(
        f"会话状态更新完成: session_id={session.id}, "
        f"question_count={session.question_count}, "
        f"generate_time={session.generate_time}s"
    )

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

    # 设置入口点
    workflow.set_entry_point("load_session")

    # 添加边 - 线性流程
    workflow.add_edge("load_session", "validate_params")
    workflow.add_edge("validate_params", "select_question_types")
    workflow.add_edge("select_question_types", "generate_questions")
    workflow.add_edge("generate_questions", "prepare_answer_records")
    workflow.add_edge("prepare_answer_records", "update_session_status")
    workflow.add_edge("update_session_status", END)

    return workflow.compile()


# 创建工作流实例
practice_generation_graph = create_practice_generation_graph()


# ==================== 工作流入口函数 ====================


async def _save_checkpoint(session_id: str, step: str, data: Optional[Dict[str, Any]] = None) -> None:
    """保存检查点（安全调用）"""
    try:
        from shared.services.checkpoint import checkpoint_service

        await checkpoint_service.save_checkpoint(session_id, step, data)
    except Exception:
        pass  # 检查点保存失败不影响主流程


async def _get_checkpoint(session_id: str) -> Optional[Dict[str, Any]]:
    """获取检查点"""
    try:
        from shared.services.checkpoint import checkpoint_service

        return await checkpoint_service.get_checkpoint(session_id)
    except Exception:
        return None


async def _delete_checkpoint(session_id: str) -> None:
    """删除检查点"""
    try:
        from shared.services.checkpoint import checkpoint_service

        await checkpoint_service.delete_checkpoint(session_id)
    except Exception:
        pass


async def invoke_practice_generation_workflow(
    *,
    db: AsyncSession,
    session_id: str,
    generate_count: int = 15,
) -> None:
    """执行练习生成工作流

    支持简化的检查点机制：
    - 每个节点完成后保存检查点
    - 失败后可以通过检查点了解进度（完整恢复需要额外实现）

    Args:
        db: 数据库会话
        session_id: 练习会话 ID
        generate_count: 生成题目数量
    """
    workflow_name = "invoke_practice_generation_workflow"

    # 检查是否有之前的检查点（用于日志记录）
    checkpoint = await _get_checkpoint(session_id)
    if checkpoint:
        logger.info(
            f"[{workflow_name}] 发现之前的检查点: step={checkpoint.get('step')}",
            session_id=session_id,
        )

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
        # 保存初始检查点
        await _save_checkpoint(session_id, "started")

        result = await practice_generation_graph.ainvoke(state)

        # 成功完成，删除检查点
        await _delete_checkpoint(session_id)

        logger.info(
            f"[{workflow_name}] 工作流执行完成",
            session_id=session_id,
            questions_count=len(result.get("questions", [])),
        )
    except Exception as e:
        # 保存失败检查点
        await _save_checkpoint(session_id, "failed", {"error": str(e)})

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
