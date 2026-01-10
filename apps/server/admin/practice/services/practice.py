from shared.core.database import (
    AbilityAtomic,
    Practice,
    PracticeAnswer,
    PracticeReport,
    Question,
    Student,
    Unit,
)
from shared.core.schema import (
    PracticeAnswerSchema,
    PracticeDataSchema,
    PracticeReportSchema,
    PracticeSchema,
    QuestionSchema,
)
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..schema import SearchPracticeSchema


async def search_practices(db: AsyncSession, params: SearchPracticeSchema):
    """搜索练习列表

    Args:
        db: 数据库会话
        params: 搜索参数

    Returns:
        dict: 包含 data 和 total 的分页结果
    """
    # 构建查询条件
    conditions = []

    if params.practice_type:
        conditions.append(Practice.practice_type == params.practice_type)

    if params.status is not None:
        conditions.append(Practice.status == params.status)

    if params.student_id:
        conditions.append(Practice.student_id == params.student_id)

    # 查询总数
    count_query = select(func.count()).select_from(Practice)
    if conditions:
        count_query = count_query.where(*conditions)
    total = await db.scalar(count_query)

    # 查询分页数据
    offset = (params.page - 1) * params.size
    query = (
        select(Practice)
        .options(joinedload(Practice.student))
        .order_by(desc(Practice.create_time))
        .limit(params.size)
        .offset(offset)
    )
    if conditions:
        query = query.where(*conditions)

    result = await db.execute(query)
    practices = result.scalars().unique().all()

    # 转换为 Schema，包含学生信息
    data = []
    for practice in practices:
        practice_dict = PracticeSchema.model_validate(practice).model_dump()
        if practice.student:
            practice_dict["student"] = {
                "id": practice.student.id,
                "name": practice.student.name,
                "phone": practice.student.phone,
                "grade": practice.student.grade,
            }

        # 获取能力名称
        if practice.ability_code:
            ability = await db.scalar(
                select(AbilityAtomic).where(
                    AbilityAtomic.subject == practice.subject,
                    AbilityAtomic.grade == practice.grade,
                    AbilityAtomic.code == practice.ability_code,
                )
            )
            if ability:
                practice_dict["ability_name"] = ability.name

        # 获取单元名称
        if practice.unit_id:
            unit = await db.get(Unit, practice.unit_id)
            if unit:
                practice_dict["unit_name"] = unit.name

        data.append(practice_dict)

    return {
        "data": data,
        "total": total or 0,
    }


async def get_practice_detail(db: AsyncSession, session_id: str):
    """获取练习详情

    Args:
        db: 数据库会话
        session_id: 会话 ID (UUID v4)

    Returns:
        PracticeDataSchema: 练习详情数据

    Raises:
        ValueError: 练习不存在
    """
    # 查询练习会话
    session = await db.scalar(
        select(Practice).options(joinedload(Practice.student)).where(Practice.id == session_id)
    )

    if not session:
        raise ValueError("练习不存在")

    # 查询答题记录和题目
    results = await db.scalars(
        select(PracticeAnswer)
        .options(joinedload(PracticeAnswer.question).joinedload(Question.question_type))
        .where(PracticeAnswer.session_id == session_id)
        .order_by(PracticeAnswer.question_order)
    )

    # 获取所有答题记录
    answers = results.all()
    questions = [answer.question for answer in answers]

    # 查询报告
    report = None
    if session.status == 2:
        report = await db.scalar(
            select(PracticeReport).where(PracticeReport.session_id == session_id)
        )

    # 构建响应
    session_dict = PracticeSchema.model_validate(session).model_dump()
    if session.student:
        session_dict["student"] = {
            "id": session.student.id,
            "name": session.student.name,
            "phone": session.student.phone,
            "grade": session.student.grade,
        }

    # 获取能力名称
    if session.ability_code:
        ability = await db.scalar(
            select(AbilityAtomic).where(
                AbilityAtomic.subject == session.subject,
                AbilityAtomic.grade == session.grade,
                AbilityAtomic.code == session.ability_code,
            )
        )
        if ability:
            session_dict["ability_name"] = ability.name

    # 获取单元名称
    if session.unit_id:
        unit = await db.get(Unit, session.unit_id)
        if unit:
            session_dict["unit_name"] = unit.name

    return {
        "session": session_dict,
        "questions": [QuestionSchema.model_validate(question) for question in questions],
        "answers": [PracticeAnswerSchema.model_validate(answer) for answer in answers],
        "report": PracticeReportSchema.model_validate(report) if report else None,
    }


async def delete_practice(db: AsyncSession, session_id: str):
    """删除练习

    Args:
        db: 数据库会话
        session_id: 会话 ID

    Returns:
        bool: 是否删除成功

    Raises:
        ValueError: 练习不存在
    """
    # 检查练习是否存在
    session = await db.scalar(select(Practice).where(Practice.id == session_id))
    if not session:
        raise ValueError("练习不存在")

    # 删除答题记录
    await db.execute(select(PracticeAnswer).where(PracticeAnswer.session_id == session_id))
    # 注意：实际上应该使用 delete 语句
    from sqlalchemy import delete

    await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))

    # 删除报告
    await db.execute(delete(PracticeReport).where(PracticeReport.session_id == session_id))

    # 删除练习会话
    await db.execute(delete(Practice).where(Practice.id == session_id))

    await db.commit()
    return True
