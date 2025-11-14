"""优化的题目选择服务（无需RAG，使用高效SQL查询）"""
from typing import List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question, StudentWrongQuestion
from shared.services.unit_mastery_service import UnitMasteryService


class ImprovedQuestionSelector:
    """优化的题目选择服务（无需RAG，使用高效SQL查询）"""
    
    @staticmethod
    async def select_questions_with_mastery(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        unit_ids: List[int],
        count: int,
        strategy: str = "adaptive"
    ) -> List[int]:
        """基于单元掌握度的智能题目选择"""
        
        # 1. 获取单元掌握度
        mastery_map = await UnitMasteryService.get_student_unit_mastery_map(
            db, student_id, textbook_id
        )
        
        question_pool = []
        
        # 2. 按单元分配题目
        for unit_id in unit_ids:
            if len(question_pool) >= count:
                break
            
            mastery_level = mastery_map.get(unit_id, {}).get("mastery_level", 0)
            
            # 3. 优先选择错题（30%）
            wrong_count = int(count * 0.3)
            wrong_questions = await ImprovedQuestionSelector._get_unit_wrong_questions(
                db, student_id, unit_id, limit=wrong_count, exclude=question_pool
            )
            question_pool.extend(wrong_questions)
            
            # 4. 根据掌握度动态调整难度分配
            remaining_count = count - len(question_pool)
            if remaining_count > 0:
                if mastery_level < 0.6:
                    # 薄弱单元: 60%简单 + 30%普通 + 10%困难
                    difficulties = [
                        ("简单", int(remaining_count * 0.6)),
                        ("普通", int(remaining_count * 0.3)),
                        ("困难", int(remaining_count * 0.1))
                    ]
                elif mastery_level < 0.8:
                    # 一般掌握: 30%简单 + 50%普通 + 20%困难
                    difficulties = [
                        ("简单", int(remaining_count * 0.3)),
                        ("普通", int(remaining_count * 0.5)),
                        ("困难", int(remaining_count * 0.2))
                    ]
                else:
                    # 已掌握: 20%简单 + 40%普通 + 40%困难
                    difficulties = [
                        ("简单", int(remaining_count * 0.2)),
                        ("普通", int(remaining_count * 0.4)),
                        ("困难", int(remaining_count * 0.4))
                    ]
                
                # 5. 按难度分配题目
                for difficulty, num in difficulties:
                    if len(question_pool) >= count:
                        break
                    questions = await ImprovedQuestionSelector._get_questions_by_difficulty(
                        db, unit_id, difficulty, num, exclude=question_pool
                    )
                    question_pool.extend(questions)
        
        # 6. 如果题目不足，补充随机题目（不限制难度）
        if len(question_pool) < count:
            remaining = count - len(question_pool)
            logger.info(
                f"题目数量不足：期望 {count} 道，当前 {len(question_pool)} 道，需要补充 {remaining} 道"
            )
            # 获取单元的所有可用题目（不限制难度）
            all_questions = await ImprovedQuestionSelector._get_all_unit_questions(
                db, unit_ids, exclude=question_pool
            )
            logger.info(f"单元 {unit_ids} 可用题目总数：{len(all_questions)} 道")
            # 随机选择补充题目
            import random
            if len(all_questions) > 0:
                # 如果可用题目足够，随机选择；否则全部使用
                if len(all_questions) >= remaining:
                    additional = random.sample(all_questions, remaining)
                else:
                    additional = all_questions
                    logger.warning(
                        f"单元 {unit_ids} 可用题目不足：期望 {remaining} 道，实际 {len(all_questions)} 道"
                    )
                question_pool.extend(additional)
            else:
                logger.warning(f"单元 {unit_ids} 没有更多可用题目")
        
        final_count = len(question_pool)
        if final_count < count:
            logger.warning(
                f"最终题目数量不足：期望 {count} 道，实际 {final_count} 道（单元 {unit_ids}）"
            )
        
        return question_pool[:count]
    
    @staticmethod
    async def _get_unit_wrong_questions(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        limit: int,
        exclude: List[int] = []
    ) -> List[int]:
        """获取单元的错题"""
        conditions = [
            StudentWrongQuestion.student_id == student_id,
            StudentWrongQuestion.is_mastered == 0,
            Question.unit_id == unit_id,
            Question.status == 1
        ]
        
        if exclude:
            conditions.append(Question.id.not_in(exclude))
        
        result = await db.execute(
            select(StudentWrongQuestion.question_id)
            .join(Question, Question.id == StudentWrongQuestion.question_id)
            .where(and_(*conditions))
            .order_by(StudentWrongQuestion.last_wrong_time.desc())
            .limit(limit)
        )
        return [row[0] for row in result.all()]
    
    @staticmethod
    async def _get_questions_by_difficulty(
        db: AsyncSession,
        unit_id: int,
        difficulty: str,
        limit: int,
        exclude: List[int] = []
    ) -> List[int]:
        """高效的SQL查询（无需向量检索）"""
        conditions = [
            Question.unit_id == unit_id,
            Question.difficulty == difficulty,
            Question.status == 1
        ]
        
        if exclude:
            conditions.append(Question.id.not_in(exclude))
        
        query = (
            select(Question.id)
            .where(and_(*conditions))
            .order_by(func.random())
            .limit(limit)
        )
        result = await db.execute(query)
        return [row[0] for row in result.all()]
    
    @staticmethod
    async def _get_all_unit_questions(
        db: AsyncSession,
        unit_ids: List[int],
        exclude: List[int] = []
    ) -> List[int]:
        """获取单元的所有可用题目（用于补充）"""
        conditions = [
            Question.unit_id.in_(unit_ids),
            Question.status == 1
        ]
        
        if exclude:
            conditions.append(Question.id.not_in(exclude))
        
        query = (
            select(Question.id)
            .where(and_(*conditions))
            .order_by(func.random())
        )
        result = await db.execute(query)
        return [row[0] for row in result.all()]

