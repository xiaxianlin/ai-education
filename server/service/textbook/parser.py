from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from store.database.models import Textbook, CourseUnit, Knowledge
from core import get_logger
from aliyun import AliyunAgent

logger = get_logger("UnitExtractionService")


class TextbookParserService:
    """单元提取服务"""

    @classmethod
    async def save_unit(cls, db: AsyncSession, textbook_id: int, unit: dict):
        """保存提取的单元到数据库"""
        course_unit = CourseUnit(
            textbook_id=textbook_id,
            name=unit.get("unit_name"),
            content=unit.get("unit_content"),
        )
        db.add(course_unit)
        await db.commit()
        await db.refresh(course_unit)

        knowledges = unit.get("topics")
        if not knowledges:
            return

        knowledges = [
            Knowledge(
                course_unit_id=course_unit.id,
                textbook_id=textbook_id,
                name=item.get("topic_name"),
                content=item.get("topic_content"),
            )
            for item in knowledges
        ]
        db.add_all(knowledges)
        await db.commit()

    @classmethod
    async def start(cls, db: AsyncSession, textbook_id: int):
        """启动PDF单元提取任务"""
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")
        if not textbook.name:
            raise ValueError("教材文件不存在")
        if not textbook.index_file_id:
            raise ValueError("教材文件还未被解析")

        data = AliyunAgent.call(
            query=f"解析教材{textbook.name}",
            app_id="e18385d4dd3e4801938b6f68024466b3",
            file_id=textbook.index_file_id,
        )

        units = data.get("units")
        if not units:
            raise ValueError("教材解析格式错误")

        for unit in units:
            await cls.save_unit(db, textbook_id, unit)

        return units
