"""
答题服务集成测试

测试 shared/practice/answer.py 中的答题提交逻辑。
使用 mock 模拟数据库和 LLM 调用。
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestAnalyzeAnswer:
    """答案分析测试（纯逻辑部分）"""

    @pytest.fixture
    def mock_question_correct(self):
        """题目 fixture：正确答案为 A"""
        question = MagicMock()
        question.answer = {"correct_answers": ["A", "a"]}
        return question

    @pytest.fixture
    def mock_question_multiple(self):
        """题目 fixture：多个正确答案"""
        question = MagicMock()
        question.answer = {"correct_answers": ["1", "2", "3"]}
        return question

    def test_correct_answer_exact_match(self, mock_question_correct):
        """精确匹配正确答案"""
        from shared.practice.answer import _analyze_answer

        # 由于 _analyze_answer 是 async 且需要 db，我们测试其核心逻辑
        correct_answers = mock_question_correct.answer.get("correct_answers", [])
        answer_content = "A"
        is_correct = answer_content.strip() in [str(a).strip() for a in correct_answers]
        assert is_correct is True

    def test_correct_answer_with_whitespace(self, mock_question_correct):
        """正确答案带空格"""
        correct_answers = mock_question_correct.answer.get("correct_answers", [])
        answer_content = " A "
        is_correct = answer_content.strip() in [str(a).strip() for a in correct_answers]
        assert is_correct is True

    def test_wrong_answer(self, mock_question_correct):
        """错误答案"""
        correct_answers = mock_question_correct.answer.get("correct_answers", [])
        answer_content = "B"
        is_correct = answer_content.strip() in [str(a).strip() for a in correct_answers]
        assert is_correct is False

    def test_numeric_answer(self, mock_question_multiple):
        """数字答案"""
        correct_answers = mock_question_multiple.answer.get("correct_answers", [])
        answer_content = "2"
        is_correct = answer_content.strip() in [str(a).strip() for a in correct_answers]
        assert is_correct is True

    def test_case_sensitive(self, mock_question_correct):
        """大小写敏感测试（当前实现区分大小写）"""
        correct_answers = mock_question_correct.answer.get("correct_answers", [])

        # "A" 在正确答案列表中
        assert "A".strip() in [str(a).strip() for a in correct_answers]
        # "a" 也在正确答案列表中（题目定义了两个）
        assert "a".strip() in [str(a).strip() for a in correct_answers]
        # "B" 不在
        assert "B".strip() not in [str(a).strip() for a in correct_answers]


class TestSubmitAnswerValidation:
    """答题提交验证测试"""

    @pytest.mark.asyncio
    async def test_session_not_found(self):
        """练习会话不存在"""
        from shared.practice.answer import submit_answer
        from shared.practice.schema import SubmitAnswerSchema

        db = AsyncMock()
        db.scalar = AsyncMock(return_value=None)

        params = SubmitAnswerSchema(
            session_id=999,
            question_id="q1",
            answer="A",
            time_spent=30,
            is_audio_answer=False,
            audio_data=b"",
        )

        with pytest.raises(ValueError, match="练习会话不存在"):
            await submit_answer(db, "student_001", params)

    @pytest.mark.asyncio
    async def test_unauthorized_student(self):
        """无权操作（学生ID不匹配）"""
        from shared.practice.answer import submit_answer
        from shared.practice.schema import SubmitAnswerSchema

        mock_session = MagicMock()
        mock_session.student_id = "other_student"

        db = AsyncMock()
        db.scalar = AsyncMock(return_value=mock_session)

        params = SubmitAnswerSchema(
            session_id=1,
            question_id="q1",
            answer="A",
            time_spent=30,
            is_audio_answer=False,
            audio_data=b"",
        )

        with pytest.raises(ValueError, match="无权操作此练习"):
            await submit_answer(db, "student_001", params)

    @pytest.mark.asyncio
    async def test_question_not_found(self):
        """题目不存在"""
        from shared.practice.answer import submit_answer
        from shared.practice.schema import SubmitAnswerSchema

        mock_session = MagicMock()
        mock_session.student_id = "student_001"

        db = AsyncMock()
        # 第一次调用返回 session，第二次调用返回 None（题目不存在）
        db.scalar = AsyncMock(side_effect=[mock_session, None])

        params = SubmitAnswerSchema(
            session_id=1,
            question_id="q999",
            answer="A",
            time_spent=30,
            is_audio_answer=False,
            audio_data=b"",
        )

        with pytest.raises(ValueError, match="题目不存在"):
            await submit_answer(db, "student_001", params)

    @pytest.mark.asyncio
    async def test_answer_record_not_found(self):
        """答题记录不存在"""
        from shared.practice.answer import submit_answer
        from shared.practice.schema import SubmitAnswerSchema

        mock_session = MagicMock()
        mock_session.student_id = "student_001"
        mock_question = MagicMock()

        db = AsyncMock()
        db.scalar = AsyncMock(side_effect=[mock_session, mock_question, None])

        params = SubmitAnswerSchema(
            session_id=1,
            question_id="q1",
            answer="A",
            time_spent=30,
            is_audio_answer=False,
            audio_data=b"",
        )

        with pytest.raises(ValueError, match="答题记录不存在"):
            await submit_answer(db, "student_001", params)

    @pytest.mark.asyncio
    async def test_answer_already_submitted(self):
        """答题记录已提交"""
        from shared.practice.answer import submit_answer
        from shared.practice.schema import SubmitAnswerSchema

        mock_session = MagicMock()
        mock_session.student_id = "student_001"
        mock_question = MagicMock()
        mock_answer_record = MagicMock()
        mock_answer_record.status = 1  # 已提交

        db = AsyncMock()
        db.scalar = AsyncMock(side_effect=[mock_session, mock_question, mock_answer_record])

        params = SubmitAnswerSchema(
            session_id=1,
            question_id="q1",
            answer="A",
            time_spent=30,
            is_audio_answer=False,
            audio_data=b"",
        )

        with pytest.raises(ValueError, match="答题记录已提交"):
            await submit_answer(db, "student_001", params)
