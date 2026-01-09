"""
练习会话生成模块

练习会话生成流程：
1. 生成会话 ID (UUID v4)，初始化练习会话记录，状态为生成中
2. 检查参数信息：db、学生 ID；能力练习检查原子能力 code (数组类型)；单元练习检查单元 ID
3. 构建题型选择 prompt，根据不同类型的练习生成不同的题型选择 prompt
4. 调用大模型选择题型
5. 根据题型列表调用题目生成并行生成题目，并归拢题目
6. 预生成练习答题数据，并启用题目
7. 更新练习会话状态为已完成并返回会话 ID
8. 如果生成失败，删除所有练习会话相关的数据

练习类型：
- ability_practice: 能力练习 - 基于原子能力 code 列表生成
- unit_practice: 单元练习 - 基于单元 ID 生成
"""

from typing import Optional

from loguru import logger
from shared.core.database import (
    AbilityAtomic,
    Practice,
    Textbook,
    Unit,
    generate_session_id,
)
from shared.generation.practice import invoke_practice_generation_workflow
from shared.generation.practice.schema import (
    PRACTICE_TYPE_ABILITY,
    PRACTICE_TYPE_UNIT,
    VALID_PRACTICE_TYPES,
)
from shared.generation.practice.service import cleanup_session_data
from shared.worker import Executor, submit_task
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def execute_generate_practice(db: AsyncSession, session_id: str, generate_count: int = 15) -> None:
    """执行练习会话生成（调用 LangGraph 工作流）

    Args:
        db: 数据库会话
        session_id: 练习会话 ID
        generate_count: 生成题目数量
    """
    await invoke_practice_generation_workflow(
        db=db,
        session_id=session_id,
        generate_count=generate_count,
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
        generate_count: 生成题目数量，默认15
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

    # 根据练习类型获取 subject 和 grade
    subject: Optional[str] = None
    grade: Optional[int] = None

    if practice_type == PRACTICE_TYPE_ABILITY:
        # 从 ability_code 查询获取 subject 和 grade
        abilities = await db.scalars(
            select(AbilityAtomic).where(
                AbilityAtomic.code == ability_code,
                AbilityAtomic.is_active == 1,
            )
        )
        ability_list = list(abilities.all())

        if not ability_list:
            raise ValueError(f"未找到有效的原子能力: code={ability_code}")

        if len(ability_list) > 1:
            raise ValueError(f"找到多个匹配的原子能力: code={ability_code}, " f"请确保 ability_code 在系统中是唯一的")

        ability = ability_list[0]
        subject = ability.subject
        grade = ability.grade
    elif practice_type == PRACTICE_TYPE_UNIT:
        # 从 unit_id 查询获取 subject 和 grade
        unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
        if not unit:
            raise ValueError(f"单元不存在: unit_id={unit_id}")
        textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
        if not textbook:
            raise ValueError(f"教材不存在: textbook_id={unit.textbook_id}")
        subject = textbook.subject
        grade = textbook.grade

    # 1. 生成练习 ID，初始化练习记录，状态为生成中
    session_id = generate_session_id()

    session = Practice(
        id=session_id,
        student_id=student_id,
        practice_type=practice_type,
        subject=subject,
        grade=grade,
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
            # 异步模式：提交到任务队列，传递 generate_count
            await submit_task(session_id, Executor.generate_practice_task, [session_id, generate_count])
            logger.info(f"练习会话生成任务提交完成: session_id={session_id}")

        return session_id

    except Exception as e:
        logger.error(f"创建练习会话失败: session_id={session_id}, error={e}")
        # 清理数据
        await cleanup_session_data(db, session_id)
        raise ValueError(f"会话创建失败: {str(e)}")
