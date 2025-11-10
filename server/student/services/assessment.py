"""能力评测服务"""
import json
import math
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from common.database import (
    AssessmentTest,
    AssessmentQuestion,
    AssessmentReport,
    Question,
    StudentProfile,
    StudyRecord,
)
from admin.schema import (
    AssessmentTestSchema,
    CreateAssessmentSchema,
    SubmitAssessmentAnswerSchema,
    AssessmentReportSchema,
)
from utils.time import now


class AdaptiveAlgorithm:
    """自适应评测算法（基于简化的IRT模型）"""

    # 难度映射：将中文难度映射到数值（-3到+3）
    DIFFICULTY_MAP = {
        "简单": -1.5,
        "普通": 0.0,
        "困难": 1.5,
    }

    # 能力等级映射
    ABILITY_LEVEL_MAP = [
        (-3, -1, "beginner"),      # 初学者
        (-1, 1, "intermediate"),   # 熟练
        (1, 3, "advanced"),        # 精通
    ]

    @staticmethod
    def calculate_ability(
        current_ability: float, difficulty: float, is_correct: bool, confidence: float
    ) -> tuple[float, float]:
        """
        基于简化的IRT（项目反应理论）计算能力值
        
        使用贝叶斯更新方法来估计学生能力
        
        参数：
        - current_ability: 当前能力估计值 (-3 到 +3)
        - difficulty: 题目难度 (-3 到 +3)
        - is_correct: 是否正确
        - confidence: 当前置信度 (0 到 1)
        
        返回：
        - (更新后的能力值, 更新后的置信度)
        """
        # 计算预期正确概率（Logistic函数）
        expected_prob = 1 / (1 + math.exp(-(current_ability - difficulty)))
        
        # 实际结果
        actual = 1.0 if is_correct else 0.0
        
        # 误差
        error = actual - expected_prob
        
        # 学习率：随着置信度增加而减小
        learning_rate = 0.5 * (1 - confidence)
        
        # 更新能力值
        new_ability = current_ability + learning_rate * error * 2
        
        # 限制在[-3, 3]范围内
        new_ability = max(-3, min(3, new_ability))
        
        # 更新置信度：每答一题增加置信度
        # 如果答题结果符合预期，置信度增加更多
        confidence_increment = 0.1 if abs(error) < 0.3 else 0.05
        new_confidence = min(1.0, confidence + confidence_increment)
        
        logger.info(
            f"能力更新: {current_ability:.2f} -> {new_ability:.2f}, "
            f"置信度: {confidence:.2f} -> {new_confidence:.2f}, "
            f"题目难度: {difficulty:.2f}, 正确: {is_correct}"
        )
        
        return new_ability, new_confidence

    @staticmethod
    def select_next_difficulty(ability: float, confidence: float, answered_count: int) -> str:
        """
        根据当前能力选择下一题难度
        
        策略：
        - 前3题：从中等难度开始探测
        - 置信度低：选择接近当前能力的题目
        - 置信度高：选择略高难度的题目进行确认
        """
        if answered_count < 3:
            # 前3题用中等难度探测
            return "普通"
        
        # 根据能力值和置信度选择难度
        if confidence < 0.5:
            # 置信度低，选择接近能力的题目
            if ability < -0.5:
                return "简单"
            elif ability < 0.5:
                return "普通"
            else:
                return "困难"
        else:
            # 置信度较高，选择略高难度确认
            if ability < -1.0:
                return "简单"
            elif ability < 0:
                return "普通"
            elif ability < 1.5:
                return "困难"
            else:
                return "困难"

    @staticmethod
    def should_stop(
        answered_count: int, 
        confidence: float,
        min_questions: int,
        max_questions: int,
        recent_results: List[bool]
    ) -> bool:
        """
        判断是否应该结束评测
        
        终止条件：
        1. 达到最大题目数
        2. 达到最小题目数且置信度足够高(>0.85)
        3. 达到最小题目数且最近5题稳定（全对或全错）
        """
        if answered_count >= max_questions:
            return True
        
        if answered_count < min_questions:
            return False
        
        # 置信度足够高
        if confidence >= 0.85:
            logger.info(f"置信度达标({confidence:.2f})，结束评测")
            return True
        
        # 最近5题的稳定性检查
        if len(recent_results) >= 5:
            if all(recent_results[-5:]) or not any(recent_results[-5:]):
                logger.info("最近5题结果稳定，结束评测")
                return True
        
        return False

    @staticmethod
    def get_ability_level(ability: float) -> str:
        """根据能力值获取能力等级"""
        for min_val, max_val, level in AdaptiveAlgorithm.ABILITY_LEVEL_MAP:
            if min_val <= ability < max_val:
                return level
        return "advanced" if ability >= 1 else "beginner"

    @staticmethod
    def ability_to_score(ability: float) -> float:
        """将能力值(-3到+3)转换为分数(0-100)"""
        # 使用Logistic函数将能力值映射到0-100分
        normalized = 1 / (1 + math.exp(-ability))
        return normalized * 100


class AssessmentService:
    """能力评测服务"""

    @staticmethod
    async def create_assessment(
        db: AsyncSession,
        student_id: str,
        assessment_type: str = "comprehensive",
        target_id: Optional[int] = None,
        max_questions: int = 20,
        min_questions: int = 10,
    ) -> AssessmentTestSchema:
        """
        创建能力评测
        
        步骤：
        1. 检查是否有正在进行的评测
        2. 获取学生信息
        3. 创建评测会话
        4. 从中等难度开始
        """
        logger.info(
            f"为学生 {student_id} 创建能力评测，类型：{assessment_type}，"
            f"目标：{target_id}，题目范围：{min_questions}-{max_questions}"
        )
        
        # 检查是否有正在进行的评测
        existing_result = await db.execute(
            select(AssessmentTest).where(
                and_(
                    AssessmentTest.student_id == student_id,
                    AssessmentTest.status == "in_progress",
                )
            )
        )
        existing_test = existing_result.scalar_one_or_none()
        
        if existing_test:
            logger.info(f"存在未完成的评测: {existing_test.id}")
            return AssessmentTestSchema.model_validate(existing_test)
        
        # 获取学生教材信息
        profile_result = await db.execute(
            select(StudentProfile).where(StudentProfile.student_id == student_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile or not profile.current_textbook_id:
            raise ValueError("请先在设置中选择当前学习教材")
        
        # 创建评测会话
        test = AssessmentTest(
            student_id=student_id,
            assessment_type=assessment_type,
            target_id=target_id,
            max_questions=max_questions,
            min_questions=min_questions,
            current_ability=0.0,  # 从中等能力开始
            confidence=0.0,
            status="in_progress",
        )
        
        db.add(test)
        await db.commit()
        await db.refresh(test)
        
        logger.info(f"能力评测创建成功，评测ID：{test.id}")
        return AssessmentTestSchema.model_validate(test)

    @staticmethod
    async def get_next_question(
        db: AsyncSession, assessment_id: int, student_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        获取下一道题（自适应算法）
        
        基于当前能力和置信度动态选择题目难度
        """
        # 获取评测会话
        result = await db.execute(
            select(AssessmentTest).where(
                and_(
                    AssessmentTest.id == assessment_id,
                    AssessmentTest.student_id == student_id,
                )
            )
        )
        test = result.scalar_one_or_none()
        
        if not test:
            raise ValueError("评测不存在")
        
        if test.status == "completed":
            return None
        
        # 获取学生教材
        profile_result = await db.execute(
            select(StudentProfile).where(StudentProfile.student_id == student_id)
        )
        profile = profile_result.scalar_one_or_none()
        if not profile or not profile.current_textbook_id:
            raise ValueError("请先设置当前教材")
        
        textbook_id = profile.current_textbook_id
        
        # 判断是否应该结束
        answered_questions = await db.execute(
            select(AssessmentQuestion).where(
                AssessmentQuestion.assessment_id == assessment_id
            ).order_by(AssessmentQuestion.question_order)
        )
        answered_list = answered_questions.scalars().all()
        recent_results = [bool(q.is_correct) for q in answered_list]
        
        if AdaptiveAlgorithm.should_stop(
            test.answered_count,
            test.confidence,
            test.min_questions,
            test.max_questions,
            recent_results,
        ):
            logger.info(f"评测 {assessment_id} 达到终止条件")
            return None
        
        # 获取已答题目ID
        answered_ids = [q.question_id for q in answered_list]
        
        # 选择下一题难度
        target_difficulty = AdaptiveAlgorithm.select_next_difficulty(
            test.current_ability, test.confidence, test.answered_count
        )
        
        logger.info(
            f"选择下一题：能力={test.current_ability:.2f}, "
            f"置信度={test.confidence:.2f}, 目标难度={target_difficulty}"
        )
        
        # 根据评测类型选择题目
        base_query = select(Question).where(
            and_(
                Question.textbook_id == textbook_id,
                Question.difficulty == target_difficulty,
                Question.status == 1,
                Question.id.not_in(answered_ids) if answered_ids else True,
            )
        )
        
        if test.assessment_type == "unit" and test.target_id:
            base_query = base_query.where(Question.unit_id == test.target_id)
        
        # 随机选择一题
        question_result = await db.execute(
            base_query.order_by(func.random()).limit(1)
        )
        question = question_result.scalar_one_or_none()
        
        if not question:
            logger.warning(f"未找到难度为 {target_difficulty} 的题目，尝试其他难度")
            # 如果没找到，尝试其他难度
            for alt_diff in ["普通", "简单", "困难"]:
                if alt_diff == target_difficulty:
                    continue
                alt_result = await db.execute(
                    select(Question).where(
                        and_(
                            Question.textbook_id == textbook_id,
                            Question.difficulty == alt_diff,
                            Question.status == 1,
                            Question.id.not_in(answered_ids) if answered_ids else True,
                        )
                    ).order_by(func.random()).limit(1)
                )
                question = alt_result.scalar_one_or_none()
                if question:
                    break
        
        if not question:
            logger.error("没有可用题目，结束评测")
            return None
        
        return {
            "question": {
                "id": question.id,
                "type": question.type,
                "subtype": question.subtype,
                "content": question.content,
                "options": question.options,
                "difficulty": question.difficulty,
                "knowledge": question.knowledge,
                "resource": question.resource,
                "resource_type": question.resource_type,
                "resource_content": question.resource_content,
            },
            "progress": {
                "current": test.answered_count + 1,
                "max": test.max_questions,
                "min": test.min_questions,
            },
            "current_ability": test.current_ability,
            "confidence": test.confidence,
        }

    @staticmethod
    async def submit_answer(
        db: AsyncSession,
        student_id: str,
        assessment_id: int,
        question_id: int,
        answer: str,
        time_spent: int = 0,
    ) -> Dict[str, Any]:
        """
        提交答案并更新评测状态
        
        步骤：
        1. 批改答案
        2. 记录答题信息
        3. 更新能力评估
        4. 判断是否继续
        """
        # 获取评测
        result = await db.execute(
            select(AssessmentTest).where(
                and_(
                    AssessmentTest.id == assessment_id,
                    AssessmentTest.student_id == student_id,
                )
            )
        )
        test = result.scalar_one_or_none()
        
        if not test:
            raise ValueError("评测不存在")
        
        if test.status == "completed":
            raise ValueError("评测已完成")
        
        # 获取题目
        question_result = await db.execute(
            select(Question).where(Question.id == question_id)
        )
        question = question_result.scalar_one_or_none()
        
        if not question:
            raise ValueError("题目不存在")
        
        # 批改答案
        is_correct = AssessmentService._check_answer(question, answer)
        
        # 记录答题
        assessment_question = AssessmentQuestion(
            assessment_id=assessment_id,
            question_id=question_id,
            question_order=test.answered_count,
            difficulty=question.difficulty,
            is_correct=1 if is_correct else 0,
            time_spent=time_spent,
            knowledge_tag=question.knowledge or "",
        )
        db.add(assessment_question)
        
        # 更新能力评估
        difficulty_value = AdaptiveAlgorithm.DIFFICULTY_MAP.get(
            question.difficulty, 0.0
        )
        new_ability, new_confidence = AdaptiveAlgorithm.calculate_ability(
            test.current_ability, difficulty_value, is_correct, test.confidence
        )
        
        test.current_ability = new_ability
        test.confidence = new_confidence
        test.answered_count += 1
        test.update_time = now()
        
        await db.commit()
        
        logger.info(
            f"学生 {student_id} 提交答案，评测 {assessment_id}，题目 {question_id}，"
            f"正确：{is_correct}，能力值：{new_ability:.2f}"
        )
        
        return {
            "is_correct": is_correct,
            "correct_answer": question.answer,
            "current_ability": new_ability,
            "confidence": new_confidence,
            "answered_count": test.answered_count,
        }

    @staticmethod
    def _check_answer(question: Question, user_answer: str) -> bool:
        """检查答案是否正确"""
        if not user_answer:
            return False
        
        correct_answer = question.answer.strip().lower()
        user_answer = user_answer.strip().lower()
        
        if question.type in ["选择题", "判断题"]:
            return user_answer == correct_answer
        
        if question.type == "填空题":
            possible_answers = [ans.strip().lower() for ans in correct_answer.split("|")]
            return user_answer in possible_answers
        
        return user_answer == correct_answer

    @staticmethod
    async def complete_assessment(
        db: AsyncSession, student_id: str, assessment_id: int
    ) -> Dict[str, Any]:
        """
        完成评测并生成报告
        
        步骤：
        1. 计算总体得分
        2. 分析能力水平
        3. 生成详细报告
        4. 记录学习记录
        """
        # 获取评测
        result = await db.execute(
            select(AssessmentTest).where(
                and_(
                    AssessmentTest.id == assessment_id,
                    AssessmentTest.student_id == student_id,
                )
            )
        )
        test = result.scalar_one_or_none()
        
        if not test:
            raise ValueError("评测不存在")
        
        if test.status == "completed":
            # 已完成，返回已有报告
            return await AssessmentService._get_existing_report(db, assessment_id)
        
        # 获取所有答题记录
        questions_result = await db.execute(
            select(AssessmentQuestion).where(
                AssessmentQuestion.assessment_id == assessment_id
            ).order_by(AssessmentQuestion.question_order)
        )
        questions = questions_result.scalars().all()
        
        # 计算总分和能力等级
        overall_score = AdaptiveAlgorithm.ability_to_score(test.current_ability)
        ability_level = AdaptiveAlgorithm.get_ability_level(test.current_ability)
        
        # 更新评测状态
        test.overall_score = overall_score
        test.ability_level = ability_level
        test.status = "completed"
        test.end_time = now()
        test.total_time = sum(q.time_spent for q in questions)
        test.update_time = now()
        
        # 生成报告
        report_data = await AssessmentService._generate_report(db, test, questions)
        
        # 创建报告记录
        report = AssessmentReport(
            assessment_id=assessment_id,
            student_id=student_id,
            overall_score=overall_score,
            ability_level=ability_level,
            percentile=int(overall_score),  # 简化：直接用分数作为百分位
            knowledge_mastery=json.dumps(report_data["knowledge_mastery"]),
            ability_breakdown=json.dumps(report_data["ability_breakdown"]),
            learning_speed=report_data["learning_speed"],
            consistency=report_data["consistency"],
            strengths=json.dumps(report_data["strengths"]),
            weaknesses=json.dumps(report_data["weaknesses"]),
            recommendations=json.dumps(report_data["recommendations"]),
        )
        db.add(report)
        
        # 记录学习记录
        profile_result = await db.execute(
            select(StudentProfile).where(StudentProfile.student_id == student_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if profile and profile.current_textbook_id:
            for q in questions:
                question_result = await db.execute(
                    select(Question).where(Question.id == q.question_id)
                )
                question = question_result.scalar_one_or_none()
                
                if question:
                    study_record = StudyRecord(
                        student_id=student_id,
                        textbook_id=question.textbook_id,
                        unit_id=question.unit_id,
                        knowledge=question.knowledge,
                        question_id=q.question_id,
                        is_correct=q.is_correct,
                        score=1.0 if q.is_correct else 0.0,
                        time_spent=q.time_spent,
                        study_date=now(),
                    )
                    db.add(study_record)
        
        await db.commit()
        
        logger.info(
            f"学生 {student_id} 完成能力评测 {assessment_id}，"
            f"得分：{overall_score:.1f}，等级：{ability_level}"
        )
        
        return {
            "assessment_id": assessment_id,
            "overall_score": overall_score,
            "ability_level": ability_level,
            "answered_count": test.answered_count,
            "total_time": test.total_time,
            "report": report_data,
        }

    @staticmethod
    async def _generate_report(
        db: AsyncSession, test: AssessmentTest, questions: List[AssessmentQuestion]
    ) -> Dict[str, Any]:
        """生成详细报告"""
        # 统计知识点掌握情况
        knowledge_stats = {}
        for q in questions:
            knowledge = q.knowledge_tag or "未分类"
            if knowledge not in knowledge_stats:
                knowledge_stats[knowledge] = {"total": 0, "correct": 0}
            knowledge_stats[knowledge]["total"] += 1
            if q.is_correct:
                knowledge_stats[knowledge]["correct"] += 1
        
        knowledge_mastery = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in knowledge_stats.items()
        }
        
        # 能力分解（按难度）
        difficulty_stats = {"简单": 0, "普通": 0, "困难": 0}
        difficulty_correct = {"简单": 0, "普通": 0, "困难": 0}
        
        for q in questions:
            if q.difficulty in difficulty_stats:
                difficulty_stats[q.difficulty] += 1
                if q.is_correct:
                    difficulty_correct[q.difficulty] += 1
        
        ability_breakdown = {
            diff: {
                "count": difficulty_stats[diff],
                "correct": difficulty_correct[diff],
                "rate": difficulty_correct[diff] / difficulty_stats[diff] if difficulty_stats[diff] > 0 else 0,
            }
            for diff in difficulty_stats.keys()
        }
        
        # 学习速度（平均答题时间）
        avg_time = sum(q.time_spent for q in questions) / len(questions) if questions else 0
        learning_speed = max(0, min(1, 1 - (avg_time - 30) / 60))  # 标准化到0-1
        
        # 稳定性（正确率的标准差）
        if len(questions) >= 5:
            # 计算滑动窗口的正确率变化
            window_size = 5
            rates = []
            for i in range(len(questions) - window_size + 1):
                window = questions[i:i+window_size]
                rate = sum(1 for q in window if q.is_correct) / window_size
                rates.append(rate)
            
            if rates:
                avg_rate = sum(rates) / len(rates)
                variance = sum((r - avg_rate) ** 2 for r in rates) / len(rates)
                consistency = 1 - min(1, variance * 4)  # 标准化到0-1
            else:
                consistency = 0.5
        else:
            consistency = 0.5
        
        # 优势和薄弱点
        strengths = []
        weaknesses = []
        
        for knowledge, stats in knowledge_mastery.items():
            if stats["rate"] >= 0.8 and stats["total"] >= 2:
                strengths.append(knowledge)
            elif stats["rate"] <= 0.5 and stats["total"] >= 2:
                weaknesses.append(knowledge)
        
        # 生成建议
        recommendations = []
        
        if test.ability_level == "beginner":
            recommendations.append("建议从基础知识开始，多做简单题巩固基础")
        elif test.ability_level == "intermediate":
            recommendations.append("基础掌握良好，可以尝试更多中等难度题目")
        else:
            recommendations.append("能力优秀，建议挑战高难度题目和综合题")
        
        if weaknesses:
            recommendations.append(f"重点关注：{', '.join(weaknesses[:3])}")
        
        if consistency < 0.6:
            recommendations.append("答题稳定性有待提高，建议加强练习")
        
        return {
            "knowledge_mastery": knowledge_mastery,
            "ability_breakdown": ability_breakdown,
            "learning_speed": round(learning_speed, 2),
            "consistency": round(consistency, 2),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
        }

    @staticmethod
    async def _get_existing_report(
        db: AsyncSession, assessment_id: int
    ) -> Dict[str, Any]:
        """获取已有报告"""
        report_result = await db.execute(
            select(AssessmentReport).where(
                AssessmentReport.assessment_id == assessment_id
            )
        )
        report = report_result.scalar_one_or_none()
        
        if not report:
            raise ValueError("报告不存在")
        
        test_result = await db.execute(
            select(AssessmentTest).where(AssessmentTest.id == assessment_id)
        )
        test = test_result.scalar_one_or_none()
        
        return {
            "assessment_id": assessment_id,
            "overall_score": report.overall_score,
            "ability_level": report.ability_level,
            "answered_count": test.answered_count if test else 0,
            "total_time": test.total_time if test else 0,
            "report": {
                "knowledge_mastery": json.loads(report.knowledge_mastery),
                "ability_breakdown": json.loads(report.ability_breakdown),
                "learning_speed": report.learning_speed,
                "consistency": report.consistency,
                "strengths": json.loads(report.strengths),
                "weaknesses": json.loads(report.weaknesses),
                "recommendations": json.loads(report.recommendations),
            },
        }

    @staticmethod
    async def get_assessment_history(
        db: AsyncSession, student_id: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """获取评测历史"""
        result = await db.execute(
            select(AssessmentTest)
            .where(AssessmentTest.student_id == student_id)
            .order_by(AssessmentTest.start_time.desc())
            .limit(limit)
        )
        tests = result.scalars().all()
        
        return [
            {
                "id": t.id,
                "assessment_type": t.assessment_type,
                "target_id": t.target_id,
                "start_time": t.start_time,
                "end_time": t.end_time,
                "answered_count": t.answered_count,
                "overall_score": t.overall_score,
                "ability_level": t.ability_level,
                "status": t.status,
            }
            for t in tests
        ]

