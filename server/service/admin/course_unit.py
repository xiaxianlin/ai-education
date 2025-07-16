from sqlalchemy import or_, select, and_, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from schema.common import SearchResultSchema, SearchSchema
from store.database.models import CourseUnit, Textbook
from util import time
from schema import CourseUnitCreateSchema, CourseUnitSchema, CourseUnitUpdateSchema


class CourseUnitService:

    @staticmethod
    async def create(db: AsyncSession, create: CourseUnitCreateSchema) -> CourseUnit:
        """创建课程单元"""
        # 验证教材是否存在
        textbook = await db.scalar(select(Textbook).where(Textbook.id == create.textbook_id))
        if not textbook:
            raise ValueError("教材不存在")

        course_unit = CourseUnit(
            textbook_id=create.textbook_id,
            name=create.name,
            content=create.content,
        )

        db.add(course_unit)
        await db.commit()
        await db.refresh(course_unit)
        return course_unit.id

    @staticmethod
    async def get_by_id(db: AsyncSession, unit_id: int) -> Optional[CourseUnit]:
        """根据ID获取课程单元"""
        unit = await db.scalar(
            select(CourseUnit, Textbook)
            .options(joinedload(CourseUnit.textbook))
            .where(CourseUnit.id == unit_id)
        )
        if not unit:
            raise ValueError("课程单元不存在")
        return unit

    @staticmethod
    async def get_by_textbook(db: AsyncSession, textbook_id: int, status: int = 1):
        """根据教材ID获取课程单元列表"""
        query = select(CourseUnit).where(
            CourseUnit.textbook_id == textbook_id,
            CourseUnit.status == status,
        )
        results = await db.scalars(query)
        return [CourseUnitSchema.model_validate(unit) for unit in results.all()]

    @staticmethod
    async def update(db: AsyncSession, unit_id: int, update: CourseUnitUpdateSchema):
        """更新课程单元"""
        unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == unit_id))
        if not unit:
            raise ValueError("课程单元不存在")

        if update.name is not None:
            unit.name = update.name
        if update.content is not None:
            unit.content = update.content
        if update.analysis_text is not None:
            unit.analysis_text = update.analysis_text
        if update.analysis_audio is not None:
            unit.analysis_audio = update.analysis_audio
        if update.analysis_video is not None:
            unit.analysis_video = update.analysis_video
        if update.status is not None:
            unit.status = update.status

        unit.update_time = time.now()
        await db.commit()

    @staticmethod
    async def delete(db: AsyncSession, unit_id: int) -> bool:
        """删除课程单元"""
        unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == unit_id))
        if not unit:
            raise ValueError("课程单元不存在")

        await db.delete(unit)
        await db.commit()

    @staticmethod
    async def search(db: AsyncSession, params: SearchSchema) -> Tuple[List[CourseUnit], int]:
        """搜索课程单元"""
        query = select(CourseUnit)

        conditions = []
        if params.keywords:
            query.where(
                or_(
                    CourseUnit.name.contains(params.keywords),
                    CourseUnit.content.contains(params.keywords),
                )
            )

        # 获取总数
        count_query = select(func.count(CourseUnit.id)).where(and_(*conditions))
        total = await db.scalar(count_query) or 0

        # 分页查询
        offset = (params.page - 1) * params.size
        query = query.order_by(CourseUnit.id).offset(offset).limit(params.size)
        units = await db.scalars(query)

        return SearchResultSchema(
            total=total,
            data=[CourseUnitSchema.model_validate(unit) for unit in units.all()],
        )
