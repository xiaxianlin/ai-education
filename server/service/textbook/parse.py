from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from store.database.models import Question, Textbook, CourseUnit, Knowledge
from core import get_logger
from aliyun import AliyunAgent

logger = get_logger("UnitExtractionService")


class TextbookParseService:
    """单元提取服务"""

    @classmethod
    async def save_units(cls, db: AsyncSession, textbook_id: int, unit: dict):
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
    async def delete_units(cls, db: AsyncSession, textbook_id: int):
        """删除当前已有的单元和知识点"""

        # 删除单元
        stmt = delete(CourseUnit).where(CourseUnit.textbook_id == textbook_id)
        await db.execute(stmt)
        # 删除知识点
        stmt = delete(Knowledge).where(Knowledge.textbook_id == textbook_id)
        await db.execute(stmt)
        # 更新所有问题关联
        stmt = (
            update(Question)
            .where(Question.textbook_id == textbook_id)
            .values({"textbook_id": None, "course_unit_id": None, "knowledge_id": None})
        )
        await db.execute(stmt)

        await db.commit()

    @classmethod
    async def run(cls, db: AsyncSession, textbook_id: int):
        """启动PDF单元提取任务"""
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")
        if not textbook.file:
            raise ValueError("教材文件不存在")
        if not textbook.index_file_id:
            raise ValueError("教材文件还未被解析")

        await cls.delete_units(db, textbook_id)

        data = AliyunAgent.call(
            query=f"解析教材{textbook.file}",
            app_id="e18385d4dd3e4801938b6f68024466b3",
            file_id=textbook.index_file_id,
        )

        units = data.get("units")
        if not units:
            raise ValueError("教材解析格式错误")

        for unit in units:
            await cls.save_units(db, textbook_id, unit)

        textbook.is_parsed = 1
        await db.commit()
        return units
