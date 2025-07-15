from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from store.database.models import Knowledge, CourseUnit
from util import time
import uuid


class KnowledgeService:
    
    @staticmethod
    async def create(
        db: AsyncSession,
        course_unit_id: int, 
        content: str,
        analysis_text: Optional[str] = None,
        analysis_audio: Optional[str] = None,
        analysis_video: Optional[str] = None
    ) -> Knowledge:
        """创建知识点"""
        # 验证课程单元是否存在
        course_unit = await db.scalar(select(CourseUnit).where(CourseUnit.id == course_unit_id))
        if not course_unit:
            raise ValueError("课程单元不存在")
        
        knowledge = Knowledge(
            id=str(uuid.uuid4()),
            course_unit_id=course_unit_id,
            content=content,
            analysis_text=analysis_text,
            analysis_audio=analysis_audio,
            analysis_video=analysis_video,
            status=1,
            create_time=time.now()
        )
        
        db.add(knowledge)
        await db.commit()
        await db.refresh(knowledge)
        return knowledge
    
    @staticmethod
    async def get_by_id(db: AsyncSession, knowledge_id: str) -> Optional[Knowledge]:
        """根据ID获取知识点"""
        return await db.scalar(
            select(Knowledge).where(Knowledge.id == knowledge_id)
        )
    
    @staticmethod
    async def get_by_course_unit(
        db: AsyncSession,
        course_unit_id: int,
        page: int = 1,
        size: int = 10,
        status: Optional[int] = None
    ) -> Tuple[List[Knowledge], int]:
        """根据课程单元ID获取知识点列表"""
        query = select(Knowledge).where(Knowledge.course_unit_id == course_unit_id)
        
        if status is not None:
            query = query.where(Knowledge.status == status)
        
        # 获取总数
        count_query = select(func.count(Knowledge.id)).where(Knowledge.course_unit_id == course_unit_id)
        if status is not None:
            count_query = count_query.where(Knowledge.status == status)
        
        total = await db.scalar(count_query) or 0
        
        # 分页查询
        offset = (page - 1) * size
        query = query.order_by(Knowledge.id).offset(offset).limit(size)
        
        result = await db.execute(query)
        knowledges = result.scalars().all()
        
        return list(knowledges), total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        knowledge_id: str,
        content: Optional[str] = None,
        analysis_text: Optional[str] = None,
        analysis_audio: Optional[str] = None,
        analysis_video: Optional[str] = None,
        status: Optional[int] = None
    ) -> Optional[Knowledge]:
        """更新知识点"""
        knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == knowledge_id))
        if not knowledge:
            return None
        
        if content is not None:
            knowledge.content = content
        if analysis_text is not None:
            knowledge.analysis_text = analysis_text
        if analysis_audio is not None:
            knowledge.analysis_audio = analysis_audio
        if analysis_video is not None:
            knowledge.analysis_video = analysis_video
        if status is not None:
            knowledge.status = status
        
        knowledge.update_time = time.now()
        await db.commit()
        await db.refresh(knowledge)
        return knowledge
    
    @staticmethod
    async def delete(db: AsyncSession, knowledge_id: str) -> bool:
        """删除知识点"""
        knowledge = await db.scalar(select(Knowledge).where(Knowledge.id == knowledge_id))
        if not knowledge:
            return False
        
        await db.delete(knowledge)
        await db.commit()
        return True
    
    @staticmethod
    async def search(
        db: AsyncSession,
        keyword: Optional[str] = None,
        course_unit_id: Optional[int] = None,
        page: int = 1,
        size: int = 10,
        status: Optional[int] = None
    ) -> Tuple[List[Knowledge], int]:
        """搜索知识点"""
        query = select(Knowledge)
        
        conditions = []
        if keyword:
            conditions.append(Knowledge.content.contains(keyword))
        if course_unit_id:
            conditions.append(Knowledge.course_unit_id == course_unit_id)
        if status is not None:
            conditions.append(Knowledge.status == status)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # 获取总数
        count_query = select(func.count(Knowledge.id))
        if conditions:
            count_query = count_query.where(and_(*conditions))
        
        total = await db.scalar(count_query) or 0
        
        # 分页查询
        offset = (page - 1) * size
        query = query.order_by(Knowledge.create_time.desc()).offset(offset).limit(size)
        
        result = await db.execute(query)
        knowledges = result.scalars().all()
        
        return list(knowledges), total