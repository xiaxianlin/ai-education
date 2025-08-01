from sqlalchemy import asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_logger
from store.database.models import Textbook, CourseUnit, Subject, TextbookVersion
from schema import TextbookSaveSchema, TextbookSchema, TextbookSearchSchema
from aliyun import AliyunOSS
from util import time


logger = get_logger("TextbookService")


class TextbookService:

    async def create(db: AsyncSession, data: TextbookSaveSchema):
        subject = await db.scalar(select(Subject).where(Subject.name == data.subject))
        if not subject:
            raise ValueError(f"{data.subject}暂时不支持")

        version = await db.scalar(
            select(TextbookVersion).where(TextbookVersion.name == data.version)
        )
        if not version:
            raise ValueError(f"{data.version}暂时不支持")

        textbook = Textbook(
            stage=data.stage.strip(),
            subject=data.subject.strip(),
            version=data.version.strip(),
            grade=data.grade,
            semester=data.semester,
        )
        db.add(textbook)
        await db.commit()
        await db.refresh(textbook)

        return textbook.id

    async def update(db: AsyncSession, id: int, data: TextbookSaveSchema):
        textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
        if not textbook:
            raise ValueError("教材不存在")

        textbook.stage = data.stage
        textbook.subject = data.subject
        textbook.version = data.version
        textbook.grade = data.grade
        textbook.semester = data.semester
        textbook.update_time = time.now()
        await db.commit()

    async def delete(db: AsyncSession, id: int):
        textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
        if not textbook:
            return True

        count = (
            await db.scalar(
                select(func.count()).select_from(CourseUnit).where(CourseUnit.textbook_id == id)
            )
            or 0
        )

        if count > 0:
            raise ValueError("教材已经被使用，不能被删除")

        if textbook.file:
            oss = AliyunOSS()
            await oss.delete(f"textbook/{textbook.file}")

        await db.delete(textbook)
        await db.commit()

    async def get_by_id(db: AsyncSession, textbook_id: int):
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")
        return TextbookSchema.model_validate(textbook)

    async def search(db: AsyncSession, params: TextbookSearchSchema):
        logger.info(params)
        stmt = select(Textbook)
        if params.stage:
            stmt = stmt.where(Textbook.stage == params.stage)
        if params.version:
            stmt = stmt.where(Textbook.version == params.version)
        if params.subject:
            stmt = stmt.where(Textbook.subject == params.subject)
        if params.grade:
            stmt = stmt.where(Textbook.grade == params.grade)

        # --- 总数 ---
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt)

        # --- 排序 ---
        sort_column = getattr(Textbook, params.sort, Textbook.id)
        stmt = stmt.order_by(
            desc(sort_column) if params.order == "desc" else asc(sort_column),
        )

        # --- 分页 ---
        offset = (params.current_page - 1) * params.page_size
        stmt = stmt.offset(offset).limit(params.page_size)

        results = await db.scalars(stmt)

        return {
            "total": total,
            "data": [manager.to_dict({"password"}) for manager in results.unique().all()],
        }

    async def update_status(db: AsyncSession, id: int, status: int):
        logger.info(f"id: {id}, status: {status}")
        textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
        if not textbook:
            raise ValueError("教材不存在")

        textbook.status = status
        await db.commit()
