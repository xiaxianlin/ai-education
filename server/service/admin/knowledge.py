from sqlalchemy import or_, select, and_, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from store.database.models import Knowledge, CourseUnit
from util import time
from schema import (
    SearchSchema,
    SearchResultSchema,
    KnowledgeCreateSchema,
    KnowledgeSchema,
    KnowledgeUpdateSchema,
)


class KnowledgeService:

    @staticmethod
    async def create(db: AsyncSession, create: KnowledgeCreateSchema):
        """创建知识点"""
        # 验证课程单元是否存在
        course_unit = await db.scalar(
            select(CourseUnit).where(CourseUnit.id == create.course_unit_id)
        )
        if not course_unit:
            raise ValueError("课程单元不存在")

        knowledge = Knowledge(
            course_unit_id=create.course_unit_id,
            name=create.name,
            content=create.content,
        )

        db.add(knowledge)
        await db.commit()
        await db.refresh(knowledge)
        return knowledge.id

    @staticmethod
    async def get_by_id(db: AsyncSession, knowledge_id: str):
        """根据ID获取知识点"""
        result = await db.execute(
            select(Knowledge)
            .options(joinedload(Knowledge.course_unit).joinedload(CourseUnit.textbook))
            .where(Knowledge.id == knowledge_id)
        )
        knowledge = result.scalar_one_or_none()
        if knowledge is None:
            raise ValueError("知识点不存在")
        return KnowledgeSchema.model_validate(knowledge)

    @staticmethod
    async def get_by_course_unit(
        db: AsyncSession,
        course_unit_id: int,
        status: int = 1,
    ):
        """根据课程单元ID获取知识点列表"""
        query = select(Knowledge).where(
            Knowledge.course_unit_id == course_unit_id, Knowledge.status == status
        )
        knowledges = await db.scalars(query)

        return [KnowledgeSchema.model_validate(knowledge) for knowledge in knowledges.all()]

    @staticmethod
    async def update(db: AsyncSession, knowledge_id: int, update: KnowledgeUpdateSchema):
        """更新知识点"""
        knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == knowledge_id))
        if not knowledge:
            raise ValueError("知识点不存在")

        if update.name is not None:
            knowledge.content = update.content
        if update.content is not None:
            knowledge.content = update.content
        if update.analysis_text is not None:
            knowledge.analysis_text = update.analysis_text
        if update.analysis_audio is not None:
            knowledge.analysis_audio = update.analysis_audio
        if update.analysis_video is not None:
            knowledge.analysis_video = update.analysis_video
        if update.status is not None:
            knowledge.status = update.status

        knowledge.update_time = time.now()
        await db.commit()

    @staticmethod
    async def delete(db: AsyncSession, knowledge_id: str) -> bool:
        """删除知识点"""
        knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == knowledge_id))
        if not knowledge:
            raise ValueError("知识点不存在")

        await db.delete(knowledge)
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
            data=[KnowledgeSchema.model_validate(unit) for unit in units.all()],
        )
