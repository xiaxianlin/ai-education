"""统一练习服务

整合今日练习、单元练习和能力评测的所有功能
"""

import json
import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from loguru import logger

from core.database import (
    PracticeSession,
    PracticeAnswer,
    PracticeReport,
    Question,
    StudentWrongRecord,
    StudentProfile,
    StudentStats,
    Unit,
)
from admin.schema import (
    DailyPracticeSessionSchema,
    UnitPracticeSessionSchema,
    AssessmentTestSchema,
)
from shared.utils.time import now
from shared.question import QuestionGenerationService


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


class PracticeService:
    """统一练习服务"""

    @staticmethod
    async def create_daily_practice(
        db: AsyncSession, student_id: str, count: int = 30, practice_type: str = "daily"
    ) -> DailyPracticeSessionSchema:
        """
        创建今日练习会话

        步骤：
        1. 获取学生学习档案
        2. 使用统一的题目生成服务（30道题目：15召回+15生成）
        3. 创建统一练习会话
        """
        logger.info(f"为学生 {student_id} 创建今日练习，题目数：{count}")

        # 获取当前日期（YYYYMMDD格式）
        today = int(datetime.now().strftime("%Y%m%d"))

        # 检查今天是否已有未完成的练习
        existing_result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                    PracticeSession.target_id == today,  # target_id存储日期
                    PracticeSession.status == "in_progress",
                )
            )
        )
        existing_session = existing_result.scalar_one_or_none()

        if existing_session:
            logger.info(f"今天已存在未完成的练习会话: {existing_session.id}")
            return DailyPracticeSessionSchema.model_validate(existing_session)

        # 获取学生教材信息
        profile_result = await db.execute(select(StudentProfile).where(StudentProfile.student_id == student_id))
        profile = profile_result.scalar_one_or_none()

        if not profile or not profile.current_textbook_id:
            raise ValueError("请先在设置中选择当前学习教材")

        textbook_id = profile.current_textbook_id

        # 创建会话记录（先生成会话ID）
        session = PracticeSession(
            student_id=student_id,
            session_type="daily",
            target_id=today,  # target_id存储日期
            textbook_id=textbook_id,
            total_questions=30,  # 固定30题
            status="in_progress",
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        # 使用统一的题目生成服务：固定30道题目（15召回+15生成），并预生成答题记录
        question_ids = await QuestionGenerationService.generate_daily_questions(
            db=db,
            student_id=student_id,
            textbook_id=textbook_id,
            create_answer_records=True,
            session_id=session.id,
        )

        if not question_ids or len(question_ids) < 30:
            logger.warning(
                f"题目生成数量不足: 期望30道，实际{len(question_ids) if question_ids else 0}道"
            )
            if not question_ids:
                raise ValueError("AI 生成题目失败，请稍后重试")

        # 统计题目分布（兼容旧逻辑）
        distribution = await PracticeService._calculate_distribution(db, student_id, question_ids)

        # 更新会话信息
        session.question_ids = json.dumps(question_ids)
        session.question_distribution = json.dumps(distribution)
        session.total_questions = len(question_ids)
        await db.commit()

        logger.info(f"今日练习会话创建成功，会话ID：{session.id}，题目分布：{distribution}")
        return DailyPracticeSessionSchema.model_validate(session)

    @staticmethod
    async def create_unit_practice_session(
        db: AsyncSession, student_id: str, unit_id: int, difficulty: str = "adaptive", count: int = 30
    ) -> UnitPracticeSessionSchema:
        """
        创建单元练习会话

        步骤：
        1. 检查是否有未完成的练习会话
        2. 如果有，直接返回未完成的会话
        3. 如果没有，验证单元是否存在
        4. 使用统一的题目生成服务生成30道题目
        5. 创建统一练习会话
        """
        logger.info(f"为学生 {student_id} 创建单元 {unit_id} 练习会话，难度：{difficulty}，题目数：{count}")

        # 检查是否有未完成的练习会话
        existing_result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "unit",
                    PracticeSession.target_id == unit_id,
                    PracticeSession.status == "in_progress",
                )
            ).order_by(PracticeSession.create_time.desc())
        )
        existing_session = existing_result.scalar_one_or_none()

        if existing_session:
            logger.info(f"发现未完成的单元练习会话: {existing_session.id}，直接返回")
            return UnitPracticeSessionSchema.model_validate(existing_session)

        # 验证单元是否存在
        unit_result = await db.execute(select(Unit).where(Unit.id == unit_id))
        unit = unit_result.scalar_one_or_none()
        if not unit:
            raise ValueError(f"单元 {unit_id} 不存在")

        # 创建会话记录（先生成会话ID）
        session = PracticeSession(
            student_id=student_id,
            session_type="unit",
            target_id=unit_id,  # target_id存储单元ID
            textbook_id=unit.textbook_id,
            difficulty=difficulty,
            total_questions=30,  # 固定30题
            status="in_progress",
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        # 使用统一的题目生成服务：固定30道题目（15召回+15生成），并预生成答题记录
        question_ids = await QuestionGenerationService.generate_unit_questions(
            db=db,
            student_id=student_id,
            unit_id=unit_id,
            create_answer_records=True,
            session_id=session.id,
        )

        if not question_ids:
            raise ValueError(f"单元 {unit_id} 暂无可用题目")

        # 更新会话信息
        session.question_ids = json.dumps(question_ids)
        session.total_questions = len(question_ids)
        await db.commit()

        logger.info(f"练习会话创建成功，会话ID：{session.id}，题目数：{len(question_ids)}")
        return UnitPracticeSessionSchema.model_validate(session)

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
            select(PracticeSession).where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "assessment",
                    PracticeSession.status == "in_progress",
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

        textbook_id = profile.current_textbook_id

        # 创建会话记录（先生成会话ID）
        session = PracticeSession(
            student_id=student_id,
            session_type="assessment",
            target_id=target_id,
            textbook_id=textbook_id,
            total_questions=30,  # 固定30题
            max_questions=max_questions,
            min_questions=min_questions,
            current_ability=0.0,  # 从中等能力开始
            confidence=0.0,
            status="in_progress",
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        # 使用统一的题目生成服务：固定30道题目（15召回+15生成），并预生成答题记录
        question_ids = await QuestionGenerationService.generate_assessment_questions(
            db=db,
            student_id=student_id,
            textbook_id=textbook_id,
            create_answer_records=True,
            session_id=session.id,
        )

        if not question_ids:
            raise ValueError("AI 生成评测题目失败，请稍后重试")

        # 更新会话信息
        session.question_ids = json.dumps(question_ids)
        session.total_questions = len(question_ids)
        await db.commit()

        logger.info(f"能力评测创建成功，会话ID：{session.id}")
        return AssessmentTestSchema.model_validate(session)

    @staticmethod
    async def get_practice_session(db: AsyncSession, session_id: int, student_id: str) -> Optional[Dict[str, Any]]:
        """获取练习会话详情（通用）"""
        result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.id == session_id,
                    PracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            return None

        # 获取题目列表
        question_ids = json.loads(session.question_ids)
        questions_result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
        questions = questions_result.scalars().all()

        # 按question_ids的顺序排序题目
        questions_dict = {q.id: q for q in questions}
        ordered_questions = [questions_dict[qid] for qid in question_ids if qid in questions_dict]

        # 获取答题记录
        answers_result = await db.execute(
            select(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
        )
        answers = {ans.question_id: ans for ans in answers_result.scalars().all()}

        # 根据会话类型返回不同的数据结构
        if session.session_type == "daily":
            return {
                "session": DailyPracticeSessionSchema.model_validate(session),
                "questions": [
                    {
                        "id": q.id,
                        "type": q.type,
                        "subtype": q.subtype,
                        "content": q.content,
                        "options": q.options,
                        "difficulty": q.difficulty,
                        "knowledge": q.knowledge,
                        "resource": q.resource,
                        "resource_type": q.resource_type,
                        "resource_content": q.resource_content,
                        "answer": answers.get(q.id).user_answer if q.id in answers else None,
                        "is_correct": answers.get(q.id).is_correct if q.id in answers else 0,
                    }
                    for q in ordered_questions
                ],
            }
        elif session.session_type == "unit":
            # 获取单元信息
            unit_result = await db.execute(
                select(Unit).options(joinedload(Unit.textbook)).where(Unit.id == session.target_id)
            )
            unit = unit_result.scalar_one_or_none()

            return {
                "session": UnitPracticeSessionSchema.model_validate(session),
                "questions": [
                    {
                        "id": q.id,
                        "type": q.type,
                        "subtype": q.subtype,
                        "content": q.content,
                        "options": q.options,
                        "difficulty": q.difficulty,
                        "knowledge": q.knowledge,
                        "resource": q.resource,
                        "resource_type": q.resource_type,
                        "resource_content": q.resource_content,
                        "answer": answers.get(q.id).user_answer if q.id in answers else None,
                        "is_correct": answers.get(q.id).is_correct if q.id in answers else 0,
                    }
                    for q in ordered_questions
                ],
                "unit": {
                    "id": unit.id if unit else None,
                    "name": unit.name if unit else "",
                    "content": unit.content if unit else "",
                },
            }
        else:
            # 评测类型
            return {
                "session": AssessmentTestSchema.model_validate(session),
                "questions": ordered_questions,
                "answers": answers,
            }

    @staticmethod
    async def submit_answer(
        db: AsyncSession,
        student_id: str,
        session_id: int,
        question_id: int,
        answer: str,
        time_spent: int = 0,
        audio_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        提交答案（通用方法）

        如果是口语题且有 audio_url，则通过 ASR 解析录音后再对比答案
        """
        # 获取会话
        result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.id == session_id,
                    PracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("练习会话不存在")

        if session.status == "completed":
            raise ValueError("练习已完成，无法继续答题")

        # 获取题目
        question_result = await db.execute(select(Question).where(Question.id == question_id))
        question = question_result.scalar_one_or_none()

        if not question:
            raise ValueError("题目不存在")

        # 如果是口语题且有录音文件，通过 ASR 解析
        actual_answer = answer
        if question.type == "口语题" and audio_url:
            try:
                from server.shared.services.aliyun import AliyunAIService
                # 通过 ASR 解析录音
                asr_text = AliyunAIService.asr(audio_url, language="zh")
                actual_answer = asr_text.strip()
                logger.info(f"口语题 ASR 解析结果: {actual_answer}")
            except Exception as e:
                logger.error(f"ASR 解析失败: {e}")
                raise ValueError(f"语音识别失败: {str(e)}")

        # 批改答案
        is_correct = PracticeService._check_answer(question, actual_answer)

        # 如果答案错误，记录到错题记录表
        if not is_correct:
            try:
                # 创建错题记录
                wrong_record = StudentWrongRecord(
                    student_id=student_id,
                    question_id=question_id,
                    session_id=session_id,
                    unit_id=question.unit_id,
                    knowledge=question.knowledge,
                    textbook_id=question.textbook_id,
                    user_answer=actual_answer,
                    correct_answer=question.answer,
                    time_spent=time_spent,
                )
                db.add(wrong_record)
            except Exception as e:
                logger.error(f"记录错题失败: {e}")

        # 更新答题记录
        answer_record = await db.execute(
            select(PracticeAnswer).where(
                and_(
                    PracticeAnswer.session_id == session_id,
                    PracticeAnswer.question_id == question_id,
                )
            )
        )
        answer_record = answer_record.scalar_one_or_none()

        if not answer_record:
            raise ValueError("答题记录不存在")

        # 更新答题记录
        answer_record.user_answer = actual_answer
        answer_record.is_correct = 1 if is_correct else 2  # 1正确 2错误
        answer_record.time_spent = time_spent
        answer_record.submit_time = now()
        if audio_url:
            answer_record.audio_url = audio_url

        # 对于评测类型，更新能力值
        if session.session_type == "assessment":
            difficulty_value = AdaptiveAlgorithm.DIFFICULTY_MAP.get(
                question.difficulty, 0.0
            )
            new_ability, new_confidence = AdaptiveAlgorithm.calculate_ability(
                session.current_ability, difficulty_value, is_correct, session.confidence
            )

            session.current_ability = new_ability
            session.confidence = new_confidence
            session.correct_questions = (session.correct_questions or 0) + (1 if is_correct else 0)
            session.total_time = (session.total_time or 0) + time_spent
            session.update_time = now()

        await db.commit()

        # 重新计算统计信息（以便后台管理系统能实时看到进度）
        # 查询该会话的所有答题记录
        all_answers = await db.execute(
            select(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
        )
        answers = all_answers.scalars().all()

        correct_count = sum(1 for ans in answers if ans.is_correct == 1)
        total_time = sum(ans.time_spent for ans in answers if ans.time_spent)
        score = (correct_count / session.total_questions * 100) if session.total_questions > 0 else 0

        # 更新统计字段
        session.correct_questions = correct_count
        session.total_time = total_time
        session.score = score
        session.update_time = now()

        await db.commit()

        logger.info(f"学生 {student_id} 提交答案，会话 {session_id}，题目 {question_id}，正确：{is_correct}")

        # 根据会话类型返回不同的结果
        if session.session_type == "assessment":
            # 计算已答题目数量
            answered_answers = await db.execute(
                select(PracticeAnswer).where(
                    and_(
                        PracticeAnswer.session_id == session_id,
                        PracticeAnswer.is_correct != 0,  # 0表示未答
                    )
                )
            )
            answered_count = len(answered_answers.scalars().all())

            return {
                "is_correct": is_correct,
                "correct_answer": question.answer,
                "current_ability": session.current_ability,
                "confidence": session.confidence,
                "answered_count": answered_count,
            }
        else:
            return {
                "is_correct": is_correct,
                "correct_answer": question.answer,
                "explanation": "",
            }

    @staticmethod
    async def complete_practice(db: AsyncSession, student_id: str, session_id: int) -> Dict[str, Any]:
        """完成练习并生成报告（通用方法）"""
        # 获取会话
        result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.id == session_id,
                    PracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("练习会话不存在")

        if session.status == "completed":
            return await PracticeService._generate_report(db, session)

        # 获取答题记录
        answers_result = await db.execute(
            select(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
        )
        answers = answers_result.scalars().all()

        # 计算统计信息
        correct_count = sum(1 for ans in answers if ans.is_correct == 1)
        total_time = sum(ans.time_spent for ans in answers if ans.time_spent)
        score = (correct_count / session.total_questions * 100) if session.total_questions > 0 else 0

        # 更新会话
        session.correct_questions = correct_count
        session.total_time = total_time
        session.score = score
        session.status = "completed"
        session.end_time = now()
        session.update_time = now()

        # 对于评测类型，计算能力等级
        if session.session_type == "assessment":
            overall_score = AdaptiveAlgorithm.ability_to_score(session.current_ability)
            ability_level = AdaptiveAlgorithm.get_ability_level(session.current_ability)

            session.score = overall_score
            session.ability_level = ability_level

        # 生成练习报告
        await PracticeService._create_practice_report(db, session, answers)

        await db.commit()

        await db.refresh(session)

        logger.info(
            f"学生 {student_id} 完成练习，会话 {session_id}，"
            f"正确率：{correct_count}/{session.total_questions}，得分：{score:.1f}"
        )

        return await PracticeService._generate_report(db, session)

    # ===== 私有方法 =====

    @staticmethod
    async def _calculate_distribution(db: AsyncSession, student_id: str, question_ids: List[int]) -> Dict[str, int]:
        """计算题目来源分布"""
        # 获取错题列表（从 StudentWrongRecord 获取）
        wrong_result = await db.execute(
            select(StudentWrongRecord.question_id).where(
                and_(
                    StudentWrongRecord.student_id == student_id,
                    StudentWrongRecord.question_id.in_(question_ids),
                    StudentWrongRecord.is_corrected == 0,  # 未订正的错题
                )
            )
        )
        wrong_ids = {row[0] for row in wrong_result.all()}

        # 获取已练习题目列表（从 PracticeAnswer 获取）
        practiced_result = await db.execute(
            select(PracticeAnswer.question_id)
            .where(
                and_(
                    PracticeAnswer.session_id.in_(
                        select(PracticeSession.id).where(
                            and_(
                                PracticeSession.student_id == student_id,
                                PracticeSession.session_type.in_(['daily', 'unit']),
                                PracticeSession.status == 'completed'
                            )
                        )
                    ),
                    PracticeAnswer.question_id.in_(question_ids),
                )
            )
            .distinct()
        )
        practiced_ids = {row[0] for row in practiced_result.all()}

        # 获取困难题列表
        challenge_result = await db.execute(
            select(Question.id).where(
                and_(
                    Question.id.in_(question_ids),
                    Question.difficulty == "困难",
                )
            )
        )
        challenge_ids = {row[0] for row in challenge_result.all()}

        # 统计分布
        wrong_count = len(wrong_ids)
        consolidate_count = len(practiced_ids - wrong_ids)
        challenge_count = len(challenge_ids - practiced_ids)
        new_count = len(question_ids) - len(practiced_ids)

        return {
            "wrong": wrong_count,
            "consolidate": consolidate_count,
            "challenge": challenge_count,
            "new": new_count,
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
    async def _create_practice_report(
        db: AsyncSession, session: PracticeSession, answers: List[PracticeAnswer]
    ) -> None:
        """创建练习报告"""
        # 计算统计信息
        correct_count = sum(1 for ans in answers if ans.is_correct == 1)
        total_time = sum(ans.time_spent for ans in answers if ans.time_spent)
        score = (correct_count / session.total_questions * 100) if session.total_questions > 0 else 0

        # 获取题目详情用于统计
        question_ids = json.loads(session.question_ids)
        questions_result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
        questions = {q.id: q for q in questions_result.scalars().all()}

        # 统计知识点掌握情况
        knowledge_stats = {}
        difficulty_stats = {"简单": 0, "普通": 0, "困难": 0}
        difficulty_correct = {"简单": 0, "普通": 0, "困难": 0}

        answers_dict = {ans.question_id: ans for ans in answers}

        for qid in question_ids:
            answer_record = answers_dict.get(qid)
            if not answer_record or answer_record.is_correct == 0:
                continue

            question = questions.get(qid)
            if not question:
                continue

            # 知识点统计
            knowledge = question.knowledge or "未分类"
            if knowledge not in knowledge_stats:
                knowledge_stats[knowledge] = {"total": 0, "correct": 0}
            knowledge_stats[knowledge]["total"] += 1
            if answer_record.is_correct == 1:
                knowledge_stats[knowledge]["correct"] += 1

            # 难度统计
            difficulty = question.difficulty or "普通"
            if difficulty in difficulty_stats:
                difficulty_stats[difficulty] += 1
                if answer_record.is_correct == 1:
                    difficulty_correct[difficulty] += 1

        # 计算知识点掌握情况
        knowledge_scores = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in knowledge_stats.items()
        }

        # 计算难度分解
        ability_breakdown = {
            diff: {
                "count": difficulty_stats[diff],
                "correct": difficulty_correct[diff],
                "rate": difficulty_correct[diff] / difficulty_stats[diff] if difficulty_stats[diff] > 0 else 0,
            }
            for diff in difficulty_stats.keys()
        }

        # 计算学习速度（平均答题时间）
        avg_time = total_time / len([ans for ans in answers if ans.time_spent]) if answers else 0
        learning_speed = max(0, min(1, 1 - (avg_time - 30) / 60))  # 标准化到0-1

        # 计算稳定性（正确率变化）
        answered_answers = [ans for ans in answers if ans.is_correct != 0]
        consistency = 0.5
        if len(answered_answers) >= 5:
            window_size = 5
            rates = []
            for i in range(len(answered_answers) - window_size + 1):
                window = answered_answers[i:i+window_size]
                rate = sum(1 for ans in window if ans.is_correct == 1) / window_size
                rates.append(rate)

            if rates:
                avg_rate = sum(rates) / len(rates)
                variance = sum((r - avg_rate) ** 2 for r in rates) / len(rates)
                consistency = 1 - min(1, variance * 4)

        # 优势和薄弱点
        strengths = []
        weaknesses = []
        for knowledge, stats in knowledge_scores.items():
            if stats["rate"] >= 0.8 and stats["total"] >= 2:
                strengths.append(knowledge)
            elif stats["rate"] <= 0.5 and stats["total"] >= 2:
                weaknesses.append(knowledge)

        # 题目分布（兼容旧逻辑）
        distribution = json.loads(session.question_distribution) if hasattr(session, 'question_distribution') and session.question_distribution else {}

        # 创建练习报告
        report = PracticeReport(
            session_id=session.id,
            student_id=session.student_id,
            total_questions=len(question_ids),
            correct_questions=correct_count,
            total_time=total_time,
            overall_score=score,
            knowledge_scores=json.dumps(knowledge_scores),
            question_distribution=json.dumps(distribution),
            ability_breakdown=json.dumps(ability_breakdown),
            learning_speed=learning_speed,
            consistency=consistency,
            strengths=json.dumps(strengths),
            weaknesses=json.dumps(weaknesses),
            recommendations=json.dumps([]),  # 暂时为空
        )

        db.add(report)

    @staticmethod
    async def _generate_report(db: AsyncSession, session: PracticeSession) -> Dict[str, Any]:
        """生成练习报告"""
        # 获取练习报告
        report_result = await db.execute(
            select(PracticeReport).where(PracticeReport.session_id == session.id)
        )
        report = report_result.scalar_one_or_none()

        if not report:
            # 如果没有报告，创建默认报告
            return {
                "session_id": session.id,
                "total_questions": session.total_questions or 0,
                "correct_questions": 0,
                "score": 0.0,
                "total_time": 0,
                "knowledge_coverage": {},
                "question_distribution": {},
                "status": session.status,
            }

        return {
            "session_id": session.id,
            "total_questions": report.total_questions,
            "correct_questions": report.correct_questions,
            "score": report.overall_score,
            "total_time": report.total_time,
            "knowledge_coverage": json.loads(report.knowledge_scores) if report.knowledge_scores else {},
            "question_distribution": json.loads(report.question_distribution) if report.question_distribution else {},
            "status": session.status,
        }

    # ===== 评测专用方法 =====

    @staticmethod
    async def check_or_create_today_practice(db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        检查或创建今日练习会话（30道题）

        逻辑：
        1. 检查当天是否已经生成会话，如果已经生成则返回
        2. 检查是否存在历史未完成会话，如果存在则更新为今天练习，并重置进度
        3. 如果没有则生成固定30道题，题目生成逻辑：
           - 根据当前学生学习的教材尝试去题目表里召回15道题
           - 如果无法召回或者召回不足，余下的数量都由AI生成
        """
        today = int(datetime.now().strftime("%Y%m%d"))

        # 步骤1：检查当天是否已经生成会话
        today_result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                    PracticeSession.target_id == today,
                )
            )
            .order_by(PracticeSession.create_time.desc())
        )
        today_session = today_result.scalars().first()

        if today_session:
            logger.info(f"当天已存在练习会话: {today_session.id}, 状态: {today_session.status}")
            return {
                "session": DailyPracticeSessionSchema.model_validate(today_session),
                "task_id": None,
                "status": "ready",
                "progress": 100,
            }

        # 步骤2：检查是否存在历史未完成会话
        old_result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                    PracticeSession.target_id != today,
                    PracticeSession.status == "in_progress",
                )
            )
            .order_by(PracticeSession.target_id.desc())
        )
        old_session = old_result.scalars().first()

        if old_session:
            # 更新为今日练习，重置进度
            logger.info(f"发现历史未完成会话: {old_session.id}，更新为今日练习并重置进度")
            old_session.target_id = today
            old_session.status = "in_progress"
            old_session.correct_questions = 0
            old_session.total_time = 0
            old_session.score = 0.0
            old_session.answers = "{}"
            old_session.update_time = now()
            await db.commit()
            await db.refresh(old_session)

            return {
                "session": DailyPracticeSessionSchema.model_validate(old_session),
                "task_id": None,
                "status": "ready",
                "progress": 100,
            }

        # 步骤3：生成固定30道题
        logger.info(f"开始生成今日练习: student_id={student_id}, date={today}, count=30")

        # 获取学生教材信息
        profile_result = await db.execute(select(StudentProfile).where(StudentProfile.student_id == student_id))
        profile = profile_result.scalar_one_or_none()

        if not profile or not profile.current_textbook_id:
            raise ValueError("请先在设置中选择当前学习教材")

        textbook_id = profile.current_textbook_id

        # 使用统一的题目生成服务：召回15道题，不足的由AI生成
        question_ids = await QuestionGenerationService.generate_daily_questions(
            db=db,
            student_id=student_id,
            textbook_id=textbook_id,
        )

        if not question_ids or len(question_ids) < 30:
            logger.warning(
                f"题目生成数量不足: 期望30道，实际{len(question_ids) if question_ids else 0}道"
            )
            if not question_ids:
                # 检查是否有单元
                from core.database import Unit
                unit_result = await db.execute(
                    select(Unit.id).where(Unit.textbook_id == textbook_id)
                )
                unit_count = len(unit_result.all())

                if unit_count == 0:
                    raise ValueError(f"教材 {textbook_id} 没有可用单元，无法生成题目")
                else:
                    raise ValueError(f"AI 生成题目失败（已尝试 {unit_count} 个单元），请稍后重试或联系管理员")

        # 统计题目分布
        distribution = await PracticeService._calculate_distribution(db, student_id, question_ids)

        # 创建会话
        session = PracticeSession(
            student_id=student_id,
            session_type="daily",
            target_id=today,  # target_id存储日期
            textbook_id=textbook_id,
            total_questions=len(question_ids),
            question_ids=json.dumps(question_ids),
            question_distribution=json.dumps(distribution),
            status="in_progress",
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        logger.info(f"今日练习生成成功，会话ID：{session.id}，题目数：{len(question_ids)}")

        return {
            "session": DailyPracticeSessionSchema.model_validate(session),
            "task_id": None,
            "status": "ready",
            "progress": 100,
        }

    @staticmethod
    async def get_practice_history(db: AsyncSession, student_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """获取练习历史"""
        result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                )
            )
            .order_by(PracticeSession.target_id.desc())  # target_id是日期
            .limit(limit)
        )
        sessions = result.scalars().all()

        return [
            {
                "id": s.id,
                "date": s.target_id,  # target_id存储日期
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "score": s.score,
                "total_time": s.total_time,
                "practice_type": "daily",
                "status": s.status,
            }
            for s in sessions
        ]

    @staticmethod
    async def get_today_stats(db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        获取今日练习统计数据

        返回：
        - today_progress: 今日进度（百分比）
        - daily_questions: 今日题目总数
        - completed_questions: 已完成题目数
        - consecutive_days: 连续天数
        - total_practice: 累计练习次数
        """
        today = int(datetime.now().strftime("%Y%m%d"))

        # 获取今日练习会话
        today_result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "daily",
                    PracticeSession.target_id == today,
                )
            )
            .order_by(PracticeSession.create_time.desc())
        )
        today_session = today_result.scalar_one_or_none()

        # 计算今日进度
        daily_questions = 0
        completed_questions = 0
        today_progress = 0

        if today_session:
            daily_questions = today_session.total_questions or 0
            # 从 answers 中计算已完成题目数
            if today_session.answers:
                try:
                    answers = json.loads(today_session.answers)
                    completed_questions = len(answers)
                except:
                    completed_questions = 0

            # 如果已完成，已完成数等于总题目数
            if today_session.status == "completed":
                completed_questions = daily_questions

            # 计算进度百分比
            if daily_questions > 0:
                today_progress = round((completed_questions / daily_questions) * 100)

        # 获取学生统计信息
        stats_result = await db.execute(
            select(StudentStats).where(StudentStats.student_id == student_id)
        )
        stats = stats_result.scalar_one_or_none()

        consecutive_days = stats.current_streak if stats else 0
        total_practice = stats.total_practice if stats else 0

        return {
            "today_progress": today_progress,
            "daily_questions": daily_questions,
            "completed_questions": completed_questions,
            "consecutive_days": consecutive_days,
            "total_practice": total_practice,
        }

    @staticmethod
    async def get_unit_progress(
        db: AsyncSession, student_id: str, unit_id: int
    ) -> Dict[str, Any]:
        """
        获取单元学习进度

        返回：
        - 总体完成度
        - 各知识点掌握情况
        - 练习历史
        """
        # 获取该单元的所有练习会话
        result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "unit",
                    PracticeSession.target_id == unit_id,
                    PracticeSession.status == "completed",
                )
            )
            .order_by(PracticeSession.start_time.desc())
        )
        sessions = result.scalars().all()

        if not sessions:
            return {
                "unit_id": unit_id,
                "total_sessions": 0,
                "average_score": 0,
                "best_score": 0,
                "total_questions": 0,
                "correct_questions": 0,
                "knowledge_progress": {},
                "recent_sessions": [],
            }

        # 统计总体情况
        total_sessions = len(sessions)
        total_questions = sum(s.total_questions for s in sessions)
        correct_questions = sum(s.correct_questions for s in sessions)
        average_score = sum(s.score for s in sessions) / total_sessions
        best_score = max(s.score for s in sessions)

        # 合并知识点掌握情况
        all_knowledge = {}
        for session in sessions:
            knowledge_scores = json.loads(session.knowledge_scores)
            for knowledge, stats in knowledge_scores.items():
                if knowledge not in all_knowledge:
                    all_knowledge[knowledge] = {"total": 0, "correct": 0}
                all_knowledge[knowledge]["total"] += stats["total"]
                all_knowledge[knowledge]["correct"] += stats["correct"]

        knowledge_progress = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in all_knowledge.items()
        }

        # 最近的练习记录
        recent_sessions = [
            {
                "id": s.id,
                "practice_date": s.start_time,
                "score": s.score,
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "difficulty": s.difficulty,
            }
            for s in sessions[:10]  # 最近10次
        ]

        return {
            "unit_id": unit_id,
            "total_sessions": total_sessions,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "total_questions": total_questions,
            "correct_questions": correct_questions,
            "knowledge_progress": knowledge_progress,
            "recent_sessions": recent_sessions,
        }

    @staticmethod
    async def get_unit_practice_history(
        db: AsyncSession, student_id: str, limit: int = 20
    ) -> List[Dict[str, Any]]:
        """获取学生的单元练习历史"""
        result = await db.execute(
            select(PracticeSession)
            .options(joinedload(PracticeSession.unit))
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "unit",
                )
            )
            .order_by(PracticeSession.start_time.desc())
            .limit(limit)
        )
        sessions = result.scalars().all()

        return [
            {
                "id": s.id,
                "unit_id": s.target_id,  # target_id是单元ID
                "unit_name": s.unit.name if s.unit else "",
                "practice_date": s.start_time,
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "score": s.score,
                "total_time": s.total_time,
                "difficulty": s.difficulty,
                "status": s.status,
            }
            for s in sessions
        ]

    @staticmethod
    async def get_assessment_history(
        db: AsyncSession, student_id: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """获取评测历史"""
        result = await db.execute(
            select(PracticeSession)
            .where(
                and_(
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "assessment",
                )
            )
            .order_by(PracticeSession.start_time.desc())
            .limit(limit)
        )
        sessions = result.scalars().all()

        return [
            {
                "id": s.id,
                "assessment_type": "comprehensive",  # 默认为综合评测
                "target_id": s.target_id,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "answered_count": s.correct_questions or 0,  # 使用correct_questions作为已答数
                "overall_score": s.score,
                "ability_level": s.ability_level,
                "status": s.status,
            }
            for s in sessions
        ]

    @staticmethod
    async def get_next_question(
        db: AsyncSession, assessment_id: int, student_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        获取下一道题（从预生成的题目列表中按顺序获取）

        由于现在统一生成30道题目，这里按顺序返回题目
        """
        # 获取评测会话
        result = await db.execute(
            select(PracticeSession).where(
                and_(
                    PracticeSession.id == assessment_id,
                    PracticeSession.student_id == student_id,
                    PracticeSession.session_type == "assessment",
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("评测不存在")

        if session.status == "completed":
            return None

        # 获取已答题目数量（使用答题记录表）
        answered_answers = await db.execute(
            select(PracticeAnswer).where(
                and_(
                    PracticeAnswer.session_id == assessment_id,
                    PracticeAnswer.is_correct != 0,  # 0表示未答
                )
            )
        )
        answered_count = len(answered_answers.scalars().all())

        # 获取题目列表
        question_ids = json.loads(session.question_ids)

        # 如果已答完所有题目，返回None
        if answered_count >= len(question_ids):
            logger.info(f"评测 {assessment_id} 已答完所有题目")
            return None

        # 获取下一道题
        next_question_id = question_ids[answered_count]
        question_result = await db.execute(
            select(Question).where(Question.id == next_question_id)
        )
        question = question_result.scalar_one_or_none()

        if not question:
            logger.error(f"题目 {next_question_id} 不存在")
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
                "current": answered_count + 1,
                "max": session.total_questions,
                "min": session.min_questions,
            },
            "current_ability": session.current_ability,
            "confidence": session.confidence,
        }
