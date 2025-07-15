from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from store.database.models import TextbookVersion, UserSubject, Textbook


class TextbookVersionService:

    async def create(db: AsyncSession, name: str):
        version = await db.scalar(select(TextbookVersion).where(TextbookVersion.name == name))

        if version:
            raise ValueError("科目已经存在")

        version = TextbookVersion(name=name)
        db.add(version)
        await db.commit()
        await db.refresh(version)

        return version.id

    async def update(db: AsyncSession, id: int, new_name: str):
        version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
        if not version:
            raise ValueError("教材版本不存在")

        update_textbook = (
            update(Textbook).where(Textbook.version == version.name).values({"version": new_name})
        )
        update_user_subject = (
            update(UserSubject)
            .where(UserSubject.textbook_version == version.name)
            .values({"textbook_version": new_name})
        )

        version.name = new_name
        await db.execute(update_textbook)
        await db.execute(update_user_subject)
        await db.commit()

    async def delete(db: AsyncSession, id: int):
        version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
        if not version:
            return True

        count = await db.scalar(
            select(func.count())
            .select_from(UserSubject)
            .where(UserSubject.textbook_version == version.name)
        )

        if not count and count > 0:
            raise ValueError("教材版本已经被使用")

        count = await db.scalar(
            select(func.count()).select_from(Textbook).where(Textbook.version == version.name)
        )

        if not count and count > 0:
            raise ValueError("教材版本已经被使用")

        await db.delete(version)
        await db.commit()

    async def all(db: AsyncSession):
        results = await db.scalars(select(TextbookVersion).order_by(TextbookVersion.id))
        return [version.to_dict() for version in results.all()]

    async def update_status(db: AsyncSession, id: int, status: int):
        version = await db.scalar(select(TextbookVersion).where(TextbookVersion.id == id))
        if not version:
            raise ValueError("教材版本不存在")

        version.status = status
        await db.commit()
