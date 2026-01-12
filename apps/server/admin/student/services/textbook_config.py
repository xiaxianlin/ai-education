from shared.core.database import StudentTextbookConfig, Textbook
from shared.core.schema import StudentSchema, StudentTextbookConfigSchema, TextbookSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def create_student_textbook_config(
    db: AsyncSession, student: StudentSchema, config: dict[str, int]
):
    """创建单个教材配置"""
    textbook_id = config["textbook_id"]

    # 检查教材是否存在
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    # 检查是否已配置该教材
    existing = await db.scalar(
        select(StudentTextbookConfig).where(
            StudentTextbookConfig.student_id == student.id,
            StudentTextbookConfig.textbook_id == textbook_id,
        )
    )
    if existing:
        raise ValueError("该教材已配置")

    record = StudentTextbookConfig(
        student_id=student.id,
        textbook_id=textbook_id,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 返回包含教材信息的配置
    result = StudentTextbookConfigSchema.model_validate(record)
    result.textbook = TextbookSchema.model_validate(textbook)
    return result


async def update_student_textbook_config(
    db: AsyncSession, student: StudentSchema, config_id: int, config: dict[str, int]
):
    """更新单个教材配置"""
    record = await db.scalar(
        select(StudentTextbookConfig).where(
            StudentTextbookConfig.id == config_id,
            StudentTextbookConfig.student_id == student.id,
        )
    )
    if not record:
        raise ValueError("配置不存在")

    textbook_id = config["textbook_id"]

    # 检查教材是否存在
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    # 检查是否与其他配置重复
    existing = await db.scalar(
        select(StudentTextbookConfig).where(
            StudentTextbookConfig.student_id == student.id,
            StudentTextbookConfig.textbook_id == textbook_id,
            StudentTextbookConfig.id != config_id,
        )
    )
    if existing:
        raise ValueError("该教材已配置")

    record.textbook_id = textbook_id
    await db.commit()
    await db.refresh(record)

    result = StudentTextbookConfigSchema.model_validate(record)
    result.textbook = TextbookSchema.model_validate(textbook)
    return result


async def delete_student_textbook_config(db: AsyncSession, student: StudentSchema, config_id: int):
    """删除单个教材配置"""
    result = await db.execute(
        delete(StudentTextbookConfig).where(
            StudentTextbookConfig.id == config_id,
            StudentTextbookConfig.student_id == student.id,
        )
    )
    await db.commit()
    return result.rowcount > 0


async def search_student_textbook_configs(
    db: AsyncSession,
    student: StudentSchema,
    page: int = 1,
    page_size: int = 20,
    subject: str | None = None,
    grade: int | None = None,
):
    """查询学生的所有配置（支持分页和筛选）"""
    from sqlalchemy import func

    offset = (page - 1) * page_size

    # 基础查询：关联 Textbook 表
    base_query = (
        select(StudentTextbookConfig, Textbook)
        .outerjoin(Textbook, StudentTextbookConfig.textbook_id == Textbook.id)
        .where(StudentTextbookConfig.student_id == student.id)
    )

    # 根据学科和年级筛选
    if subject:
        base_query = base_query.where(Textbook.subject == subject)
    if grade is not None:
        base_query = base_query.where(Textbook.grade == grade)

    # 查询总数
    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.scalar(count_query) or 0

    # 查询数据
    data_query = (
        base_query.order_by(StudentTextbookConfig.id.desc()).offset(offset).limit(page_size)
    )
    result = await db.execute(data_query)
    rows = result.all()

    items = []
    for config, textbook in rows:
        item = StudentTextbookConfigSchema.model_validate(config)
        if textbook:
            item.textbook = TextbookSchema.model_validate(textbook)
        items.append(item)

    return {"items": items, "total": total, "page": page, "page_size": page_size}
