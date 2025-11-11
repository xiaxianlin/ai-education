"""知识点管理服务"""
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from functools import lru_cache

from common.database import Knowledge, Unit
from utils.time import now


class KnowledgeService:
    """知识点管理服务"""
    
    @staticmethod
    async def create_knowledge(
        db: AsyncSession,
        textbook_id: int,
        unit_id: int,
        name: str,
        content: str,
        difficulty: Optional[str] = None,
        importance: int = 5,
        order: int = 0
    ) -> int:
        """创建知识点（简化版，两级结构）"""
        # 验证单元是否存在
        unit = await db.get(Unit, unit_id)
        if not unit:
            raise ValueError("单元不存在")
        
        # 创建知识点
        knowledge = Knowledge(
            textbook_id=textbook_id,
            unit_id=unit_id,
            name=name,
            content=content,
            difficulty=difficulty,
            importance=importance,
            order=order
        )
        
        db.add(knowledge)
        await db.commit()
        await db.refresh(knowledge)
        
        return knowledge.id
    
    @staticmethod
    async def get_knowledge_by_unit(
        db: AsyncSession,
        textbook_id: int,
        unit_id: Optional[int] = None
    ) -> Dict[int, List[Dict[str, Any]]]:
        """获取知识点列表（按单元分组，两级结构）"""
        query = select(Knowledge).where(
            and_(
                Knowledge.textbook_id == textbook_id,
                Knowledge.status == 1
            )
        )
        if unit_id:
            query = query.where(Knowledge.unit_id == unit_id)
        
        query = query.order_by(Knowledge.unit_id, Knowledge.order)
        
        result = await db.execute(query)
        knowledge_list = result.scalars().all()
        
        # 按单元分组
        knowledge_by_unit = {}
        for k in knowledge_list:
            if k.unit_id not in knowledge_by_unit:
                knowledge_by_unit[k.unit_id] = []
            
            # 获取题目数量（通过缓存）
            question_count = await KnowledgeService.get_question_count(db, k.id)
            
            knowledge_by_unit[k.unit_id].append({
                "id": k.id,
                "name": k.name,
                "content": k.content,
                "difficulty": k.difficulty,
                "importance": k.importance,
                "order": k.order,
                "question_count": question_count
            })
        
        return knowledge_by_unit
    
    @staticmethod
    async def get_question_count(
        db: AsyncSession,
        knowledge_id: int
    ) -> int:
        """获取知识点关联的题目数量（使用缓存避免实时计算）"""
        from common.database import QuestionKnowledge
        
        result = await db.execute(
            select(func.count(QuestionKnowledge.id)).where(
                QuestionKnowledge.knowledge_id == knowledge_id
            )
        )
        return result.scalar() or 0

