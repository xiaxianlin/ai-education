from shared.core.database import StudentTextbookConfig
from shared.core.schema import StudentSchema, StudentTextbookConfigSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def create_student_textbook_config(
    db: AsyncSession, student: StudentSchema, config: dict[str, str | int]
):
    """创建单个教材配置"""
    record = StudentTextbookConfig(
        student_id=student.id,
        subject=config["subject"],
        grade=config["grade"],
        semester=config["semester"],
        version=config["version"],
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return StudentTextbookConfigSchema.model_validate(record)


async def update_student_textbook_config(
    db: AsyncSession, student: StudentSchema, config_id: int, config: dict[str, str | int]
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

    record.subject = config["subject"]
    record.grade = config["grade"]
    record.semester = config["semester"]
    record.version = config["version"]

    await db.commit()
    await db.refresh(record)
    return StudentTextbookConfigSchema.model_validate(record)


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
    db: AsyncSession, student: StudentSchema, page: int = 1, page_size: int = 20
):
    """查询学生的所有配置（支持分页）"""
    from sqlalchemy import func

    offset = (page - 1) * page_size

    # 查询总数
    total_result = await db.scalar(
        select(func.count(StudentTextbookConfig.id)).where(
            StudentTextbookConfig.student_id == student.id
        )
    )
    total = total_result or 0

    # 查询数据
    result = await db.scalars(
        select(StudentTextbookConfig)
        .where(StudentTextbookConfig.student_id == student.id)
        .order_by(StudentTextbookConfig.id.desc())
        .offset(offset)
        .limit(page_size)
    )
    items = [StudentTextbookConfigSchema.model_validate(item) for item in result.all()]

    return {"items": items, "total": total, "page": page, "page_size": page_size}
