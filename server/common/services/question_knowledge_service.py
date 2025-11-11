"""问题-知识点关联服务"""
from typing import List, Dict, Optional, Any
from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import QuestionKnowledge
from utils.time import now


class QuestionKnowledgeService:
    """问题-知识点关联服务"""
    
    @staticmethod
    async def link_question_to_knowledge(
        db: AsyncSession,
        question_id: int,
        knowledge_ids: List[int],
        primary_knowledge_id: Optional[int] = None,
        weights: Optional[Dict[int, float]] = None
    ):
        """关联问题到知识点"""
        # 删除旧关联
        await db.execute(
            delete(QuestionKnowledge).where(
                QuestionKnowledge.question_id == question_id
            )
        )
        
        # 创建新关联
        for kid in knowledge_ids:
            is_primary = 1 if kid == primary_knowledge_id else 0
            weight = weights.get(kid, 1.0) if weights else 1.0
            
            qk = QuestionKnowledge(
                question_id=question_id,
                knowledge_id=kid,
                is_primary=is_primary,
                weight=weight
            )
            db.add(qk)
        
        # ❌ 不再更新Knowledge.question_count（改为缓存计算）
        # 题目数量通过 KnowledgeService.get_question_count() 方法获取
        
        await db.commit()
    
    @staticmethod
    async def get_questions_by_knowledge(
        db: AsyncSession,
        knowledge_id: int,
        difficulty: Optional[str] = None,
        limit: int = 100
    ) -> List[int]:
        """根据知识点获取题目ID列表"""
        from common.database import Question
        
        query = (
            select(Question.id)
            .join(QuestionKnowledge, Question.id == QuestionKnowledge.question_id)
            .where(
                and_(
                    QuestionKnowledge.knowledge_id == knowledge_id,
                    Question.status == 1
                )
            )
        )
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        query = query.limit(limit)
        
        result = await db.execute(query)
        return [row[0] for row in result.all()]
    
    @staticmethod
    async def get_knowledges_by_question(
        db: AsyncSession,
        question_id: int
    ) -> List[Dict[str, Any]]:
        """获取题目关联的知识点列表"""
        result = await db.execute(
            select(QuestionKnowledge).where(
                QuestionKnowledge.question_id == question_id
            )
        )
        
        qk_list = result.scalars().all()
        return [
            {
                "knowledge_id": qk.knowledge_id,
                "is_primary": qk.is_primary,
                "weight": qk.weight
            }
            for qk in qk_list
        ]

