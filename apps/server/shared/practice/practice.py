"""
练习会话管理模块

提供练习会话的查询、状态管理等功能。
"""

from loguru import logger
from shared.core.database import (
    Practice,
    PracticeAnswer,
    PracticeReport,
)
from shared.core.schema import (
    PracticeAnswerSchema,
    PracticeDataSchema,
    PracticeReportSchema,
    PracticeSchema,
    QuestionSchema,
)
from shared.utils.time import now
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from .report import generate_practice_report


async def get_practices(
    db: AsyncSession,
    student_id: str,
    practice_type: str,
    page: int = 1,
    page_size: int = 20,
):
    """获取指定练习类型的练习会话记录（支持分页）

    Args:
        db: 数据库会话
        student_id: 学生 ID
        practice_type: 练习类型 (ability_practice / unit_practice)
        limit: 返回数量限制（兼容旧版，已废弃，使用 page_size）
        page: 页码（从1开始）
        page_size: 每页数量

    Returns:
        dict: 包含 data, total, page, pageSize 的分页结果
    """
    # 查询总数
    count_query = select(Practice).where(
        Practice.student_id == student_id,
        Practice.practice_type == practice_type,
    )
    total = await db.scalar(select(func.count()).select_from(count_query.subquery()))

    # 查询分页数据
    offset = (page - 1) * page_size
    sessions = await db.scalars(
        select(Practice)
        .where(
            Practice.student_id == student_id,
            Practice.practice_type == practice_type,
        )
        .order_by(desc(Practice.create_time))
        .limit(page_size)
        .offset(offset)
    )

    return {
        "data": [PracticeSchema.model_validate(session) for session in sessions.all()],
        "total": total or 0,
        "page": page,
        "pageSize": page_size,
    }


async def get_practice_data(
    db: AsyncSession,
    student_id: str,
    session_id: str,
):
    """根据练习会话 ID 查询会话详情

    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)

    Returns:
        PracticeDataSchema: 练习详情数据

    Raises:
        ValueError: 练习不存在
    """
    session = await db.scalar(
        select(Practice).where(
            Practice.id == session_id,
            Practice.student_id == student_id,
        )
    )
    if not session:
        raise ValueError("练习不存在")

    results = await db.scalars(
        select(PracticeAnswer)
        .options(joinedload(PracticeAnswer.question))
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
    )

    # 获取所有答题记录
    answers = results.all()
    questions = [answer.question for answer in answers]

    # 查询报告
    report = None
    if session.status == 2:
        report = await db.scalar(select(PracticeReport).where(PracticeReport.session_id == session_id))

    return PracticeDataSchema(
        session=PracticeSchema.model_validate(session),
        questions=[QuestionSchema.model_validate(question) for question in questions],
        answers=[PracticeAnswerSchema.model_validate(answer) for answer in answers],
        report=PracticeReportSchema.model_validate(report) if report else None,
    )


async def get_ability_practice_by_code(
    db: AsyncSession,
    student_id: str,
    ability_code: str,
) -> PracticeSchema | None:
    """获取指定能力代码的练习（返回最新的未完成练习）

    Args:
        db: 数据库会话
        student_id: 学生 ID
        ability_code: 原子能力代码

    Returns:
        PracticeSchema | None: 匹配的练习（未开始或进行中），如果没有则返回 None
    """
    # 查询匹配该能力代码的能力练习
    query = (
        select(Practice)
        .where(
            Practice.student_id == student_id,
            Practice.practice_type == "ability_practice",
            Practice.ability_code == ability_code,  # 直接匹配字符串
            Practice.status != 2,  # 排除已完成的练习（status=2）
        )
        .order_by(desc(Practice.create_time))
        .limit(1)
    )

    result = await db.scalar(query)
    if result:
        return PracticeSchema.model_validate(result)
    return None


async def get_unit_practice_by_id(
    db: AsyncSession,
    student_id: str,
    unit_id: int,
) -> PracticeSchema | None:
    """获取指定单元 ID 的练习（返回最新的未完成练习）

    Args:
        db: 数据库会话
        student_id: 学生 ID
        unit_id: 单元 ID

    Returns:
        PracticeSchema | None: 匹配的练习（未开始或进行中），如果没有则返回 None
    """
    # 查询匹配该单元 ID 的单元练习
    query = (
        select(Practice)
        .where(
            Practice.student_id == student_id,
            Practice.practice_type == "unit_practice",
            Practice.unit_id == unit_id,  # 直接匹配 unit_id
            Practice.status != 2,  # 排除已完成的练习（status=2）
        )
        .order_by(desc(Practice.create_time))
        .limit(1)
    )

    result = await db.scalar(query)
    if result:
        return PracticeSchema.model_validate(result)
    return None


async def begin_practice(
    db: AsyncSession,
    student_id: str,
    session_id: str,
) -> None:
    """开始练习会话

    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)

    Raises:
        ValueError: 会话不存在或状态异常
    """
    # 查询练习
    session = await db.scalar(select(Practice).where(Practice.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    if session.status == 0:
        # 检查生成状态
        if session.generate_status == 0:
            raise ValueError("练习正在生成中，请稍候")
        if session.generate_status == -1:
            raise ValueError("练习生成失败，请重新生成")
        if session.generate_status != 1:
            raise ValueError(f"练习状态异常，无法开始（generate_status={session.generate_status}）")

        # 更新状态为进行中
        session.status = 1
        session.start_time = now()
        session.update_time = now()
        await db.commit()
        logger.info(f"练习开始: session_id={session_id}, student_id={student_id}")
    elif session.status == 1:
        # 已经在进行中，不需要再次开始
        logger.info(f"练习已在进行中: session_id={session_id}")
    else:
        raise ValueError("练习已完成或已废弃")


async def complete_practice(
    db: AsyncSession,
    student_id: str,
    session_id: str,
) -> int:
    """完成练习会话，生成报告

    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)

    Returns:
        int: 报告 ID

    Raises:
        ValueError: 会话不存在或状态异常
    """
    # 查询练习
    session = await db.scalar(select(Practice).where(Practice.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    # 检查练习会话是否已完成
    if session.status == 2:
        raise ValueError(f"练习已完成: session_id={session_id}")

    # 检查题目是否全部作答
    if session.answer_count < session.question_count:
        logger.warning(
            f"练习未完成所有题目: session_id={session_id}, "
            f"已答={session.answer_count}, 总数={session.question_count}"
        )
        raise ValueError(
            f"练习未完成所有题目: session_id={session_id}, "
            f"已答={session.answer_count}, 总数={session.question_count}"
        )

    # 更新状态为已完成
    session.status = 2
    session.end_time = now()
    session.update_time = now()
    await db.commit()

    logger.info(f"练习完成: session_id={session_id}, student_id={student_id}")

    return await generate_practice_report(db, student_id, session_id)
