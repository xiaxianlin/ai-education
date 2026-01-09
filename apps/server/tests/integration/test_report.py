"""
报告生成服务集成测试

测试 shared/practice/report.py 中的报告生成逻辑。
使用 mock 模拟数据库调用。
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestGeneratePracticeReportValidation:
    """报告生成验证测试"""

    @pytest.mark.asyncio
    async def test_session_not_found(self):
        """练习会话不存在"""
        from shared.practice.report import generate_practice_report

        db = AsyncMock()
        db.scalar = AsyncMock(return_value=None)

        with pytest.raises(ValueError, match="练习会话不存在"):
            await generate_practice_report(db, "student_001", 999)

    @pytest.mark.asyncio
    async def test_unauthorized_student(self):
        """无权操作（学生ID不匹配）"""
        from shared.practice.report import generate_practice_report

        mock_session = MagicMock()
        mock_session.student_id = "other_student"

        db = AsyncMock()
        db.scalar = AsyncMock(return_value=mock_session)

        with pytest.raises(ValueError, match="无权操作此练习"):
            await generate_practice_report(db, "student_001", 1)

    @pytest.mark.asyncio
    async def test_report_already_exists(self):
        """报告已存在时返回现有报告ID"""
        from shared.practice.report import generate_practice_report

        mock_session = MagicMock()
        mock_session.student_id = "student_001"

        mock_existing_report = MagicMock()
        mock_existing_report.id = 42

        db = AsyncMock()
        # 第一次调用返回 session，第二次调用返回已存在的报告
        db.scalar = AsyncMock(side_effect=[mock_session, mock_existing_report])

        result = await generate_practice_report(db, "student_001", 1)
        assert result == 42


class TestAnalyzeKnowledgeScores:
    """知识点得分分析测试"""

    @pytest.mark.asyncio
    async def test_empty_answers(self):
        """空答题记录"""
        from shared.practice.report import analyze_knowledge_scores

        db = AsyncMock()
        result = await analyze_knowledge_scores(db, [])
        assert result == {}

    @pytest.mark.asyncio
    async def test_single_knowledge_point(self):
        """单个知识点统计"""
        from shared.practice.report import analyze_knowledge_scores

        # Mock 答题记录
        answer1 = MagicMock()
        answer1.question_id = "q1"
        answer1.status = 1  # 正确

        answer2 = MagicMock()
        answer2.question_id = "q2"
        answer2.status = 2  # 错误

        answers = [answer1, answer2]

        # Mock 题目（都属于同一知识点）
        question1 = MagicMock()
        question1.id = "q1"
        question1.knowledge_points = ["加法运算"]

        question2 = MagicMock()
        question2.id = "q2"
        question2.knowledge_points = ["加法运算"]

        # Mock scalars 返回
        mock_result = MagicMock()
        mock_result.all.return_value = [question1, question2]

        db = AsyncMock()
        db.scalars = AsyncMock(return_value=mock_result)

        result = await analyze_knowledge_scores(db, answers)

        assert "加法运算" in result
        assert result["加法运算"]["total"] == 2
        assert result["加法运算"]["correct"] == 1
        assert result["加法运算"]["accuracy"] == 50.0


class TestAnalyzeQuestionDistribution:
    """题目类型分布分析测试"""

    @pytest.mark.asyncio
    async def test_empty_answers(self):
        """空答题记录"""
        from shared.practice.report import analyze_question_distribution

        db = AsyncMock()
        result = await analyze_question_distribution(db, [])
        assert result == {}

    @pytest.mark.asyncio
    async def test_multiple_question_types(self):
        """多种题型统计"""
        from shared.practice.report import analyze_question_distribution

        # Mock 答题记录
        answer1 = MagicMock()
        answer1.question_id = "q1"
        answer1.status = 1

        answer2 = MagicMock()
        answer2.question_id = "q2"
        answer2.status = 1

        answer3 = MagicMock()
        answer3.question_id = "q3"
        answer3.status = 2

        answers = [answer1, answer2, answer3]

        # Mock 题目
        question1 = MagicMock()
        question1.id = "q1"
        question1.question_type_code = "single_choice"

        question2 = MagicMock()
        question2.id = "q2"
        question2.question_type_code = "single_choice"

        question3 = MagicMock()
        question3.id = "q3"
        question3.question_type_code = "fill_blank"

        mock_result = MagicMock()
        mock_result.all.return_value = [question1, question2, question3]

        db = AsyncMock()
        db.scalars = AsyncMock(return_value=mock_result)

        result = await analyze_question_distribution(db, answers)

        assert "single_choice" in result
        assert result["single_choice"]["total"] == 2
        assert result["single_choice"]["correct"] == 2
        assert result["single_choice"]["accuracy"] == 100.0

        assert "fill_blank" in result
        assert result["fill_blank"]["total"] == 1
        assert result["fill_blank"]["correct"] == 0
        assert result["fill_blank"]["accuracy"] == 0.0


class TestAnalyzeAbilityBreakdown:
    """能力分解（按难度）分析测试"""

    @pytest.mark.asyncio
    async def test_empty_answers(self):
        """空答题记录"""
        from shared.practice.report import analyze_ability_breakdown

        db = AsyncMock()
        result = await analyze_ability_breakdown(db, [])
        assert result == {}

    @pytest.mark.asyncio
    async def test_difficulty_distribution(self):
        """难度分布统计"""
        from shared.practice.report import analyze_ability_breakdown

        # Mock 答题记录
        answer1 = MagicMock()
        answer1.question_id = "q1"
        answer1.status = 1

        answer2 = MagicMock()
        answer2.question_id = "q2"
        answer2.status = 2

        answers = [answer1, answer2]

        # Mock 题目
        question1 = MagicMock()
        question1.id = "q1"
        question1.difficulty = "easy"

        question2 = MagicMock()
        question2.id = "q2"
        question2.difficulty = "hard"

        mock_result = MagicMock()
        mock_result.all.return_value = [question1, question2]

        db = AsyncMock()
        db.scalars = AsyncMock(return_value=mock_result)

        result = await analyze_ability_breakdown(db, answers)

        assert "easy" in result
        assert result["easy"]["accuracy"] == 100.0

        assert "hard" in result
        assert result["hard"]["accuracy"] == 0.0


class TestGenerateRecommendations:
    """学习建议生成测试"""

    @pytest.mark.asyncio
    async def test_excellent_score(self):
        """优秀分数的建议"""
        from shared.practice.report import generate_recommendations

        db = AsyncMock()
        answers = []
        knowledge_scores = {"加法运算": {"accuracy": 95}}
        overall_score = 95
        practice_type = "ability_practice"

        strengths, weaknesses, recommendations = await generate_recommendations(
            db, answers, knowledge_scores, overall_score, practice_type
        )

        assert len(strengths) > 0  # 有优势
        assert len(weaknesses) == 0  # 无薄弱点
        assert any("优秀" in r for r in recommendations)

    @pytest.mark.asyncio
    async def test_poor_score(self):
        """低分数的建议"""
        from shared.practice.report import generate_recommendations

        db = AsyncMock()
        answers = []
        knowledge_scores = {"加法运算": {"accuracy": 40}}
        overall_score = 40
        practice_type = "unit_practice"

        strengths, weaknesses, recommendations = await generate_recommendations(
            db, answers, knowledge_scores, overall_score, practice_type
        )

        assert len(strengths) == 0
        assert len(weaknesses) > 0
        assert any("系统性复习" in r for r in recommendations)
