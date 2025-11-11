"""
问题库知识库系统 - 核心实现示例（优化版）

这个文件展示了知识库系统的核心实现代码，可以作为实际开发的参考。

主要特性：
- 学习情况以单元为维度追踪
- 使用优化的SQL查询实现智能题目推荐（无需RAG）
- 简化的两级知识点结构（单元 -> 知识点）
- 改进的掌握度计算算法（EMA + 时间衰减）
"""

from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import select, func, and_, delete, UniqueConstraint, update, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from datetime import datetime
import json
from loguru import logger
from functools import lru_cache

from common.database import BaseModel, now
from common.database import Knowledge, Question, Unit, StudentUnitMastery, StudentWrongQuestion


# ==================== 数据模型 ====================

class QuestionKnowledge(BaseModel):
    """问题-知识点关联表（多对多）"""
    __tablename__ = "ah_question_knowledge"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(nullable=False, index=True)
    knowledge_id: Mapped[int] = mapped_column(nullable=False, index=True)
    
    # 关联属性
    is_primary: Mapped[int] = mapped_column(default=1)  # 是否主要知识点（1-主要，0-次要）
    weight: Mapped[float] = mapped_column(default=1.0)  # 权重（0-1，用于计算掌握度）
    
    create_time: Mapped[int] = mapped_column(default=now)
    
    # 关联关系
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="knowledge_points"
    )
    knowledge: Mapped["Knowledge"] = relationship(
        "Knowledge",
        back_populates="questions"
    )
    
    # 唯一约束：同一问题不能重复关联同一知识点
    __table_args__ = (
        UniqueConstraint('question_id', 'knowledge_id', name='uq_question_knowledge'),
    )


# ==================== 知识点管理服务 ====================

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
    @lru_cache(maxsize=1000)
    async def get_question_count(
        db: AsyncSession,
        knowledge_id: int
    ) -> int:
        """获取知识点关联的题目数量（使用缓存避免实时计算）"""
        result = await db.execute(
            select(func.count(QuestionKnowledge.id)).where(
                QuestionKnowledge.knowledge_id == knowledge_id
            )
        )
        return result.scalar() or 0


# ==================== 问题-知识点关联服务 ====================

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
    ) -> List[Question]:
        """根据知识点获取题目"""
        query = (
            select(Question)
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
        return list(result.scalars().all())


# ==================== 单元掌握度追踪服务（以单元为维度）====================

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
        """更新单元掌握度"""
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
            mastery.knowledge_breakdown = json.dumps(existing_breakdown)
        
        # 更新复习时间（基于遗忘曲线）
        if mastery.is_mastered:
            days = [1, 3, 7, 14, 30, 60]  # 复习间隔（天）
            review_index = min(mastery.review_count, len(days) - 1)
            mastery.next_review_time = now() + days[review_index] * 86400
            mastery.review_count += 1
        else:
            mastery.next_review_time = now() + 86400  # 1天后
        
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


# ==================== 优化的题目选择服务（无需RAG）====================

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
        result = await db.execute(
            select(StudentWrongQuestion.question_id)
            .join(Question, Question.id == StudentWrongQuestion.question_id)
            .where(
                and_(
                    StudentWrongQuestion.student_id == student_id,
                    StudentWrongQuestion.is_mastered == 0,
                    Question.unit_id == unit_id,
                    Question.status == 1,
                    Question.id.not_in(exclude) if exclude else True
                )
            )
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
        query = (
            select(Question.id)
            .where(
                and_(
                    Question.unit_id == unit_id,
                    Question.difficulty == difficulty,
                    Question.status == 1,
                    Question.id.not_in(exclude) if exclude else True
                )
            )
            .order_by(func.random())
            .limit(limit)
        )
        result = await db.execute(query)
        return [row[0] for row in result.all()]


# ==================== 基于单元掌握度的题目生成服务 ====================

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
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]


# ==================== 教材解析集成示例 ====================

async def parse_textbook_example(db: AsyncSession, textbook_id: int):
    """教材解析示例（结合知识库设计）"""
    from provider.aliyun import AliyunApp
    from common.database import Textbook, Unit, Knowledge
    
    # 1. 获取教材信息
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook or not textbook.index_file_id:
        raise ValueError("教材不存在或未上传文件")
    
    # 2. 调用AI解析教材
    data = AliyunApp.invoke(
        query=f"解析教材{textbook.file}",
        app_id="e18385d4dd3e4801938b6f68024466b3",
        file_id=textbook.index_file_id,
    )
    
    units = data.get("units")
    if not units:
        raise ValueError("教材解析格式错误")
    
    # 3. 创建单元和知识点（带排序）
    for unit_index, item in enumerate(units):
        # 创建单元
        unit = Unit(
            textbook_id=textbook_id,
            name=item.get("unit_name"),
            content=item.get("unit_content")
        )
        db.add(unit)
        await db.commit()
        await db.refresh(unit)
        
        # 创建知识点（带排序和默认属性）
        knowledges = item.get("topics")
        if not knowledges:
            continue
        
        knowledge_objects = []
        for knowledge_index, topic in enumerate(knowledges):
            knowledge = Knowledge(
                unit_id=unit.id,
                textbook_id=textbook_id,
                name=topic.get("topic_name"),
                content=topic.get("topic_content"),
                order=knowledge_index,  # ✅ 按解析顺序设置排序
                difficulty=None,  # 可后续手动设置或通过AI分析
                importance=5  # 默认重要性
            )
            knowledge_objects.append(knowledge)
        
        db.add_all(knowledge_objects)
        await db.commit()
    
    # 4. 标记教材已解析
    textbook.is_parsed = 1
    await db.commit()
    
    return units


async def auto_link_questions_example(db: AsyncSession, textbook_id: int):
    """自动关联题目到知识点示例"""
    # 获取教材的所有知识点
    knowledges = await db.execute(
        select(Knowledge).where(
            and_(Knowledge.textbook_id == textbook_id, Knowledge.status == 1)
        )
    )
    knowledge_list = knowledges.scalars().all()
    
    # 获取教材的所有题目
    questions = await db.execute(
        select(Question).where(
            and_(Question.textbook_id == textbook_id, Question.status == 1)
        )
    )
    question_list = questions.scalars().all()
    
    # 简单的关键词匹配（可以优化为更智能的匹配算法）
    linked_count = 0
    for question in question_list:
        matched_knowledge_ids = []
        for knowledge in knowledge_list:
            # 如果题目内容或知识点字段包含知识点名称
            if (knowledge.name in question.content or 
                (question.knowledge and knowledge.name in question.knowledge)):
                matched_knowledge_ids.append(knowledge.id)
        
        if matched_knowledge_ids:
            await QuestionKnowledgeService.link_question_to_knowledge(
                db, question.id, matched_knowledge_ids,
                primary_knowledge_id=matched_knowledge_ids[0] if matched_knowledge_ids else None
            )
            linked_count += 1
    
    return linked_count


# ==================== 使用示例 ====================

async def example_usage(db: AsyncSession):
    """使用示例"""
    
    # 示例1：教材解析（自动创建单元和知识点）
    # units = await parse_textbook_example(db, textbook_id=1)
    
    # 示例2：手动创建知识点（补充解析遗漏的知识点）
    knowledge_id = await KnowledgeService.create_knowledge(
        db,
        textbook_id=1,
        unit_id=1,
        name="加法运算",
        content="掌握基本的加法运算方法",
        difficulty="简单",
        importance=8,
        order=0
    )
    
    # 示例3：关联问题到知识点
    await QuestionKnowledgeService.link_question_to_knowledge(
        db,
        question_id=1,
        knowledge_ids=[knowledge_id],
        primary_knowledge_id=knowledge_id
    )
    
    # 示例4：自动关联题目到知识点（基于内容匹配）
    # linked_count = await auto_link_questions_example(db, textbook_id=1)
    
    # 示例5：更新单元掌握度（在完成练习时调用）
    await UnitMasteryService.update_mastery(
        db,
        student_id="student_001",
        unit_id=1,
        score=85.0,
        total_questions=10,
        correct_count=8,
        knowledge_breakdown={"加法运算": {"total": 5, "correct": 4}}
    )
    
    # 示例6：生成今日练习题目（基于单元掌握度，优化SQL查询）
    question_ids = await UnitBasedQuestionService.generate_daily_practice_questions(
        db,
        student_id="student_001",
        textbook_id=1,
        count=10
    )
    
    print(f"生成的题目ID: {question_ids}")

