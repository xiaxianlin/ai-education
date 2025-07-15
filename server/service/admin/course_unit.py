from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from store.database.models import CourseUnit, Textbook
from util import time


class CourseUnitService:

    @staticmethod
    async def create(
        db: AsyncSession, textbook_id: int, name: str, content: str = ""
    ) -> CourseUnit:
        """创建课程单元"""
        # 验证教材是否存在
        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
        if not textbook:
            raise ValueError("教材不存在")

        course_unit = CourseUnit(
            textbook_id=textbook_id, name=name, content=content, status=1, create_time=time.now()
        )

        db.add(course_unit)
        await db.commit()
        await db.refresh(course_unit)
        return course_unit

    @staticmethod
    async def get_by_id(db: AsyncSession, unit_id: int) -> Optional[CourseUnit]:
        """根据ID获取课程单元"""
        return await db.scalar(select(CourseUnit).where(CourseUnit.id == unit_id))

    @staticmethod
    async def get_by_textbook(
        db: AsyncSession,
        textbook_id: int,
        page: int = 1,
        size: int = 10,
        status: Optional[int] = None,
    ) -> Tuple[List[CourseUnit], int]:
        """根据教材ID获取课程单元列表"""
        query = select(CourseUnit).where(CourseUnit.textbook_id == textbook_id)

        if status is not None:
            query = query.where(CourseUnit.status == status)

        # 获取总数
        count_query = select(func.count(CourseUnit.id)).where(CourseUnit.textbook_id == textbook_id)
        if status is not None:
            count_query = count_query.where(CourseUnit.status == status)

        total = await db.scalar(count_query) or 0

        # 分页查询
        offset = (page - 1) * size
        query = query.order_by(CourseUnit.id).offset(offset).limit(size)

        result = await db.execute(query)
        units = result.scalars().all()

        return list(units), total

    @staticmethod
    async def update(
        db: AsyncSession,
        unit_id: int,
        name: Optional[str] = None,
        content: Optional[str] = None,
        status: Optional[int] = None,
    ) -> Optional[CourseUnit]:
        """更新课程单元"""
        unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == unit_id))
        if not unit:
            return None

        if name is not None:
            unit.name = name
        if content is not None:
            unit.content = content
        if status is not None:
            unit.status = status

        unit.update_time = time.now()
        await db.commit()
        await db.refresh(unit)
        return unit

    @staticmethod
    async def delete(db: AsyncSession, unit_id: int) -> bool:
        """删除课程单元"""
        unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == unit_id))
        if not unit:
            return False

        await db.delete(unit)
        await db.commit()
        return True

    @staticmethod
    async def search(
        db: AsyncSession,
        keyword: Optional[str] = None,
        textbook_id: Optional[int] = None,
        page: int = 1,
        size: int = 10,
        status: Optional[int] = None,
    ) -> Tuple[List[CourseUnit], int]:
        """搜索课程单元"""
        query = select(CourseUnit)

        conditions = []
        if keyword:
            conditions.append(CourseUnit.name.contains(keyword))
        if textbook_id:
            conditions.append(CourseUnit.textbook_id == textbook_id)
        if status is not None:
            conditions.append(CourseUnit.status == status)

        if conditions:
            query = query.where(and_(*conditions))

        # 获取总数
        count_query = select(func.count(CourseUnit.id))
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total = await db.scalar(count_query) or 0

        # 分页查询
        offset = (page - 1) * size
        query = query.order_by(CourseUnit.id).offset(offset).limit(size)

        result = await db.execute(query)
        units = result.scalars().all()

        return list(units), total
