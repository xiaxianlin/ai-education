"""单元掌握度追踪服务（以单元为维度）"""
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import json

from common.database import StudentUnitMastery, Unit
from utils.time import now


class UnitMasteryService:
    """单元掌握度追踪服务（以单元为维度）"""
    
    @staticmethod
    async def update_mastery(
        db: AsyncSession,
        student_id: str,
        unit_id: int,
        score: float,
        total_questions: int,
        correct_count: int,
        knowledge_breakdown: Optional[Dict[str, Any]] = None
    ):
        """更新单元掌握度（EMA + 时间衰减）"""
        # 获取或创建掌握度记录
        mastery = await db.scalar(
            select(StudentUnitMastery).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.unit_id == unit_id
                )
            )
        )
        
        if not mastery:
            # 获取单元信息
            unit = await db.get(Unit, unit_id)
            if not unit:
                return
            
            mastery = StudentUnitMastery(
                student_id=student_id,
                unit_id=unit_id,
                textbook_id=unit.textbook_id
            )
            db.add(mastery)
        
        # 更新统计信息
        mastery.total_practiced += 1
        mastery.total_questions += total_questions
        mastery.correct_count += correct_count
        mastery.wrong_count += (total_questions - correct_count)
        
        mastery.last_practice_time = now()
        mastery.last_score = score
        
        # ✅ 改进：统一使用指数移动平均(EMA)，避免跳变
        current_accuracy = correct_count / total_questions if total_questions > 0 else 0
        
        # 根据练习次数动态调整学习率
        # 前期学习快(大学习率), 后期稳定(小学习率)
        if mastery.total_practiced <= 5:
            alpha = 0.5  # 前5次快速学习
        elif mastery.total_practiced <= 20:
            alpha = 0.3  # 6-20次适度学习
        else:
            alpha = 0.2  # 20次后稳定
        
        # EMA公式: new = old * (1-alpha) + current * alpha
        mastery.mastery_level = (
            mastery.mastery_level * (1 - alpha) +
            current_accuracy * alpha
        )
        
        # ✅ 改进：考虑时间衰减(遗忘曲线)
        if mastery.last_practice_time and mastery.last_practice_time > 0:
            days_since_last = (now() - mastery.last_practice_time) / 86400
            if days_since_last > 7:
                # 超过7天未练习，掌握度衰减
                decay_factor = 0.95 ** (days_since_last / 7)
                mastery.mastery_level *= decay_factor
        
        mastery.mastery_score = mastery.mastery_level * 100
        
        # 判断是否掌握
        mastery.is_mastered = 1 if mastery.mastery_level >= mastery.mastery_threshold else 0
        
        # 更新知识点分解情况
        if knowledge_breakdown:
            existing_breakdown = json.loads(mastery.knowledge_breakdown) if mastery.knowledge_breakdown else {}
            for k, v in knowledge_breakdown.items():
                if k not in existing_breakdown:
                    existing_breakdown[k] = {"total": 0, "correct": 0}
                existing_breakdown[k]["total"] += v.get("total", 0)
                existing_breakdown[k]["correct"] += v.get("correct", 0)
            mastery.knowledge_breakdown = json.dumps(existing_breakdown, ensure_ascii=False)
        
        # 更新复习时间（基于遗忘曲线）
        if mastery.is_mastered:
            days = [1, 3, 7, 14, 30, 60]  # 复习间隔（天）
            review_index = min(mastery.review_count, len(days) - 1)
            mastery.next_review_time = now() + days[review_index] * 86400
            mastery.review_count += 1
        else:
            mastery.next_review_time = now() + 86400  # 1天后
        
        mastery.update_time = now()
        await db.commit()
    
    @staticmethod
    async def get_student_unit_mastery_map(
        db: AsyncSession,
        student_id: str,
        textbook_id: int
    ) -> Dict[int, Dict[str, Any]]:
        """获取学生的单元掌握度映射"""
        result = await db.execute(
            select(StudentUnitMastery).where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id
                )
            )
        )
        
        masteries = result.scalars().all()
        return {
            m.unit_id: {
                "mastery_level": m.mastery_level,
                "mastery_score": m.mastery_score,
                "is_mastered": m.is_mastered,
                "total_practiced": m.total_practiced,
                "correct_count": m.correct_count,
                "wrong_count": m.wrong_count,
                "total_questions": m.total_questions,
                "next_review_time": m.next_review_time,
                "knowledge_breakdown": json.loads(m.knowledge_breakdown) if m.knowledge_breakdown else {}
            }
            for m in masteries
        }
    
    @staticmethod
    async def get_weak_units(
        db: AsyncSession,
        student_id: str,
        textbook_id: int,
        threshold: float = 0.6,
        limit: int = 10
    ) -> List[int]:
        """获取薄弱单元"""
        result = await db.execute(
            select(StudentUnitMastery.unit_id)
            .where(
                and_(
                    StudentUnitMastery.student_id == student_id,
                    StudentUnitMastery.textbook_id == textbook_id,
                    StudentUnitMastery.mastery_level < threshold,
                    StudentUnitMastery.total_practiced > 0
                )
            )
            .order_by(StudentUnitMastery.mastery_level.asc())
            .limit(limit)
        )
        
        return [row[0] for row in result.all()]

