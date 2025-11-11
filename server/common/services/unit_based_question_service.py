"""基于单元掌握度的题目生成服务（优化版，无需RAG）"""
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Question, Unit, StudentUnitMastery
from common.services.unit_mastery_service import UnitMasteryService
from common.services.improved_question_selector import ImprovedQuestionSelector
from utils.time import now


class UnitBasedQuestionService:
    """基于单元掌握度的题目生成服务（优化版，无需RAG）"""
    
    @staticmethod
    async def generate_daily_practice_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        count: int = 10
    ) -> List[int]:
        """生成今日练习题目（基于单元掌握度）"""
        # 1. 获取学生单元掌握度
        mastery_map = await UnitMasteryService.get_student_unit_mastery_map(
            db, student_id, textbook_id
        )
        
        # 2. 获取薄弱单元
        weak_unit_ids = await UnitMasteryService.get_weak_units(
            db, student_id, textbook_id, threshold=0.6, limit=5
        )
        
        # 3. 获取需要复习的单元（基于遗忘曲线）
        need_review_units = await db.execute(
            select(StudentUnitMastery.unit_id).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id,
                    StudentUnitMastery.next_review_time <= now(),
                    StudentUnitMastery.is_mastered == 1
                )
            )
        )
        review_unit_ids = [row[0] for row in need_review_units.all()]
        
        # 4. 获取新单元（从未练习过的）
        all_units_result = await db.execute(
            select(Unit.id).where(
                and_(Unit.textbook_id == textbook_id, Unit.status == 1)
            )
        )
        all_unit_ids = {row[0] for row in all_units_result.all()}
        practiced_unit_ids = set(mastery_map.keys())
        new_unit_ids = list(all_unit_ids - practiced_unit_ids)
        
        # 5. 分配题目数量
        question_ids = []
        
        # 30% 薄弱单元
        weak_count = int(count * 0.3)
        if weak_unit_ids:
            weak_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, weak_unit_ids[:3], weak_count
            )
            question_ids.extend(weak_questions)
        
        # 20% 需要复习的单元
        review_count = int(count * 0.2)
        if review_unit_ids:
            review_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, review_unit_ids[:2], review_count
            )
            question_ids.extend(review_questions)
        
        # 30% 巩固练习（已掌握但需要巩固）
        consolidate_unit_ids = [
            uid for uid, mastery in mastery_map.items()
            if mastery["is_mastered"] == 1 and uid not in review_unit_ids
        ]
        consolidate_count = int(count * 0.3)
        if consolidate_unit_ids:
            consolidate_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, consolidate_unit_ids[:3], consolidate_count
            )
            question_ids.extend(consolidate_questions)
        
        # 20% 新单元
        new_count = count - len(question_ids)
        if new_unit_ids:
            new_questions = await ImprovedQuestionSelector.select_questions_with_mastery(
                db, student_id, textbook_id, new_unit_ids[:2], new_count
            )
            question_ids.extend(new_questions)
        
        # 如果不够，随机补充
        if len(question_ids) < count:
            remaining = count - len(question_ids)
            extra_questions = await UnitBasedQuestionService._get_random_questions(
                db, textbook_id, remaining, exclude_ids=question_ids
            )
            question_ids.extend(extra_questions)
        
        return question_ids[:count]
    
    @staticmethod
    async def generate_unit_practice_questions(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        count: int = 15
    ) -> List[int]:
        """生成单元练习题目（基于单元掌握度）"""
        # 获取单元信息
        unit = await db.get(Unit, unit_id)
        if not unit:
            return []
        
        # 使用优化的题目选择服务
        question_ids = await ImprovedQuestionSelector.select_questions_with_mastery(
            db, student_id, unit.textbook_id, [unit_id], count
        )
        
        return question_ids
    
    @staticmethod
    async def generate_assessment_questions(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        unit_ids: Optional[List[int]] = None,
        difficulty_range: Optional[Tuple[str, str]] = None,
        count: int = 20
    ) -> List[int]:
        """生成能力评测题目（基于单元掌握度）"""
        # 如果指定了单元，使用这些单元
        if not unit_ids:
            # 获取教材的所有单元
            units_result = await db.execute(
                select(Unit.id).where(
                    and_(
                        Unit.textbook_id == textbook_id,
                        Unit.status == 1
                    )
                )
            )
            unit_ids = [row[0] for row in units_result.all()]
        
        # 使用优化的题目选择服务
        question_ids = await ImprovedQuestionSelector.select_questions_with_mastery(
            db, student_id, textbook_id, unit_ids, count
        )
        
        return question_ids
    
    @staticmethod
    async def _get_random_questions(
        db: AsyncSession,
        textbook_id: int,
        count: int,
        exclude_ids: List[int]
    ) -> List[int]:
        """获取随机题目"""
        conditions = [
            Question.textbook_id == textbook_id,
            Question.status == 1
        ]
        
        if exclude_ids:
            conditions.append(Question.id.not_in(exclude_ids))
        
        result = await db.execute(
            select(Question.id)
            .where(and_(*conditions))
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]

