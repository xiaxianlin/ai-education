"""
教材版本服务层
"""

from sqlalchemy import asc, delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Textbook, TextbookVersion, TeacherBook
from ..schema import (
    SaveTextbookVersionSchema,
    SearchTextbookVersionSchema,
    TextbookVersionSchema,
)


async def create_textbook_version(
    db: AsyncSession, data: SaveTextbookVersionSchema
) -> int:
    """创建教材版本"""
    # 检查唯一性：同一科目下，名称+年份不能重复
    exists_stmt = select(TextbookVersion).where(
        TextbookVersion.subject == data.subject,
        TextbookVersion.name == data.name,
        TextbookVersion.revision_year == data.revision_year,
    )
    version_exists = await db.scalar(exists_stmt)
    if version_exists:
        raise ValueError("该版本已存在")

    version = TextbookVersion(
        subject=data.subject,
        name=data.name,
        revision_year=data.revision_year,
        is_enabled=1,
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)

    return version.id


async def update_textbook_version(
    db: AsyncSession, id: int, data: SaveTextbookVersionSchema
):
    """更新教材版本"""
    version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
    if not version:
        raise ValueError("教材版本不存在")

    # 检查唯一性（排除自己）
    exists_stmt = select(TextbookVersion).where(
        TextbookVersion.subject == data.subject,
        TextbookVersion.name == data.name,
        TextbookVersion.revision_year == data.revision_year,
        TextbookVersion.id != id,
    )
    version_exists = await db.scalar(exists_stmt)
    if version_exists:
        raise ValueError("该版本已存在")

    version.subject = data.subject
    version.name = data.name
    version.revision_year = data.revision_year
    await db.commit()


async def delete_textbook_version(db: AsyncSession, id: int):
    """删除教材版本（检查是否被使用）"""
    version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
    if not version:
        raise ValueError("教材版本不存在")

    # 构建版本字符串：name(revision_year)
    version_str = f"{version.name}({version.revision_year})"

    # 检查教材表
    textbook_exists = await db.scalar(
        select(Textbook).where(Textbook.version == version_str)
    )

    # 检查教师用书表
    teacher_book_exists = await db.scalar(
        select(TeacherBook).where(TeacherBook.version == version_str)
    )

    if textbook_exists or teacher_book_exists:
        raise ValueError("该版本正在被使用，无法删除")

    await db.delete(version)
    await db.commit()


async def disable_textbook_version(db: AsyncSession, id: int):
    """停用教材版本"""
    version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
    if not version:
        raise ValueError("教材版本不存在")

    version.is_enabled = 0
    await db.commit()


async def enable_textbook_version(db: AsyncSession, id: int):
    """启用教材版本"""
    version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
    if not version:
        raise ValueError("教材版本不存在")

    version.is_enabled = 1
    await db.commit()


async def search_textbook_version(
    db: AsyncSession, params: SearchTextbookVersionSchema
):
    """查询教材版本列表"""
    stmt = select(TextbookVersion)

    if params.subject:
        stmt = stmt.where(TextbookVersion.subject == params.subject)

    # 排序：按创建时间倒序
    stmt = stmt.order_by(desc(TextbookVersion.create_time))

    results = await db.scalars(stmt)
    return [
        TextbookVersionSchema.model_validate(item) for item in results.unique().all()
    ]


async def get_textbook_version(db: AsyncSession, id: int):
    """获取教材版本详情"""
    version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
    if not version:
        raise ValueError("教材版本不存在")
    return TextbookVersionSchema.model_validate(version)
