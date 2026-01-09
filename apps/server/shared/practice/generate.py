"""
练习会话生成模块

练习会话生成流程：
1. 生成会话 ID (UUID v4)，初始化练习会话记录，状态为生成中
2. 提交到任务队列或立即执行生成工作流
3. 工作流中验证参数、选择题型、生成题目、预生成答题记录
4. 更新练习会话状态为已完成
5. 如果生成失败，清理所有相关数据

练习类型：
- ability_practice: 能力练习 - 基于原子能力 code 生成
- unit_practice: 单元练习 - 基于单元 ID 生成
"""

from typing import Optional

from loguru import logger
from shared.core.database import Practice, generate_session_id
from shared.core.logger import log_error
from shared.generation.practice.schema import (
    PRACTICE_TYPE_ABILITY,
    PRACTICE_TYPE_UNIT,
    VALID_PRACTICE_TYPES,
)
from shared.worker import Executor, submit_task
from sqlalchemy.ext.asyncio import AsyncSession


async def execute_generate_practice(
    db: AsyncSession,
    session_id: str,
    generate_count: int = 15,
    session_factory=None,
) -> None:
    """执行练习会话生成（调用 LangGraph 工作流）

    Args:
        db: 数据库会话
        session_id: 练习会话 ID
        generate_count: 生成题目数量
        session_factory: 可选的数据库会话工厂。在 Celery worker 中必须传入，
                        因为全局的 AsyncSessionLocal 绑定到了不同的事件循环。
    """
    # Lazy import to avoid circular dependency
    from shared.generation.practice import invoke_practice_generation_workflow

    await invoke_practice_generation_workflow(
        db=db,
        session_id=session_id,
        generate_count=generate_count,
        session_factory=session_factory,
    )


async def create_practice(
    *,
    db: AsyncSession,
    practice_type: str,
    student_id: str,
    ability_code: Optional[str] = None,
    unit_id: Optional[int] = None,
    generate_count: int = 10,
    immediately: bool = False,
) -> str:
    """创建练习会话

    Args:
        db: 数据库会话
        practice_type: 练习类型 (ability_practice / unit_practice)
        student_id: 学生 ID
        ability_code: 原子能力代码（能力练习必填）
        unit_id: 单元ID（单元练习必填）
        generate_count: 生成题目数量，默认10
        immediately: 是否立即执行生成（同步模式）

    Returns:
        str: 练习会话 ID (UUID v4)
    """
    # 验证练习类型
    if practice_type not in VALID_PRACTICE_TYPES:
        raise ValueError(f"无效的练习类型: practice_type={practice_type}")

    # 验证参数
    if practice_type == PRACTICE_TYPE_ABILITY and not ability_code:
        raise ValueError("能力练习需要提供 ability_code")

    if practice_type == PRACTICE_TYPE_UNIT and not unit_id:
        raise ValueError("单元练习需要提供 unit_id")

    logger.info(
        f"开始创建练习会话 | practice_type={practice_type} | "
        f"student_id={student_id} | ability_code={ability_code} | "
        f"unit_id={unit_id} | generate_count={generate_count} | "
        f"immediately={immediately}"
    )

    # 生成练习 ID，初始化练习记录，状态为生成中
    # subject 和 grade 将在工作流的 validate_params_node 中设置
    session_id = generate_session_id()

    session = Practice(
        id=session_id,
        student_id=student_id,
        practice_type=practice_type,
        ability_code=ability_code,
        unit_id=unit_id,
        generate_status=0,
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)

    logger.info(f"练习会话记录创建成功: session_id={session_id}")

    try:
        if immediately:
            # 同步模式：立即执行生成
            await execute_generate_practice(db, session_id, generate_count)
            logger.info(f"练习会话生成完成: session_id={session_id}")
        else:
            # 异步模式：提交到任务队列
            submit_task(session_id, Executor.generate_practice_task, [session_id, generate_count])
            logger.info(f"练习会话生成任务提交完成: session_id={session_id}")

        return session_id

    except Exception as e:
        log_error(
            f"创建练习会话失败: session_id={session_id}",
            exc=e,
            session_id=session_id,
            practice_type=practice_type,
            student_id=student_id,
            ability_code=ability_code,
            unit_id=unit_id,
        )
        # Lazy import to avoid circular dependency
        from shared.generation.practice.service import cleanup_session_data

        await cleanup_session_data(db, session_id)
        raise ValueError(f"会话创建失败: {str(e)}")
