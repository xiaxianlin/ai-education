from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from schema import SubjectSchema
from store.database.models import Subject, UserSubject, Textbook


class SubjectService:

    async def create(db: AsyncSession, name: str):
        subject = await db.scalar(select(Subject).where(Subject.name == name))

        if subject:
            raise ValueError("科目已经存在")

        subject = Subject(name=name)
        db.add(subject)
        await db.commit()
        await db.refresh(subject)

        return subject.id

    async def update(db: AsyncSession, id: int, new_name: str):
        subject = await db.scalar(select(Subject).where(Subject.id == id))
        if not subject:
            raise ValueError("科目不存在")

        update_textbook = (
            update(Textbook).where(Textbook.subject == subject.name).values({"subject": new_name})
        )

        update_user_subject = (
            update(UserSubject)
            .where(UserSubject.subject == subject.name)
            .values({"subject": new_name})
        )

        subject.name = new_name
        await db.execute(update_textbook)
        await db.execute(update_user_subject)
        await db.commit()

    async def delete(db: AsyncSession, id: int):
        subject = await db.scalar(select(Subject).where(Subject.id == id))
        if not subject:
            return True

        count = await db.scalar(
            select(func.count()).select_from(UserSubject).where(UserSubject.subject == subject.name)
        )

        if not count and count > 0:
            raise ValueError("科目已经被使用")

        count = await db.scalar(
            select(func.count()).select_from(Textbook).where(Textbook.subject == subject.name)
        )

        if not count and count > 0:
            raise ValueError("科目已经被使用")

        await db.delete(subject)
        await db.commit()

    async def all(db: AsyncSession):
        results = await db.scalars(select(Subject).order_by(Subject.id))
        return [SubjectSchema.model_validate(subject) for subject in results.all()]

    async def update_status(db: AsyncSession, id: int, status: int):
        subject = await db.scalar(select(Subject).where(Subject.id == id))
        if not subject:
            raise ValueError("科目不存在")

        subject.status = status
        await db.commit()
