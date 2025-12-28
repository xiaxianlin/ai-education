"""
共享 Pytest Fixtures

提供测试中常用的 mock 对象和测试数据。
"""

import pytest
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, MagicMock


# ==================== Mock 数据类 ====================


@dataclass
class MockPracticeSessionAnswer:
    """Mock 答题记录"""

    id: int = 1
    session_id: int = 1
    question_id: str = "q1"
    student_id: str = "student_001"
    status: int = 0  # 0=未答, 1=正确, 2=错误
    time_spent: int = 30
    question_order: int = 1
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None
    textbook_id: Optional[int] = None


@dataclass
class MockQuestion:
    """Mock 题目"""

    id: str = "q1"
    question_type_code: str = "single_choice"
    difficulty: str = "easy"
    knowledge_points: List[str] = field(default_factory=lambda: ["加法运算"])
    answer: Dict[str, Any] = field(default_factory=lambda: {"correct_answers": ["A"]})
    unit_id: Optional[int] = 1
    textbook_id: Optional[int] = 1


@dataclass
class MockPractice:
    """Mock 练习"""

    id: int = 1
    slug: str = "daily_practice"
    name: str = "日常练习"
    parameters: List[Dict] = field(default_factory=list)


@dataclass
class MockTextbook:
    """Mock 教材"""

    id: int = 1
    subject: str = "数学"
    grade: int = 3
    version: str = "人教版"
    semester: str = "上学期"


@dataclass
class MockPracticeSession:
    """Mock 练习会话"""

    id: int = 1
    student_id: str = "student_001"
    practice_id: int = 1
    practice_slug: str = "daily_practice"
    textbook_id: int = 1
    unit_id: Optional[int] = None
    status: int = 0
    generate_status: int = 1
    question_count: int = 10
    answer_count: int = 0
    correct_count: int = 0
    parameters: Dict[str, Any] = field(default_factory=dict)
    session_type: str = "daily_practice"


# ==================== Fixtures ====================


@pytest.fixture
def mock_answer_records() -> List[MockPracticeSessionAnswer]:
    """生成 mock 答题记录列表"""
    return [
        MockPracticeSessionAnswer(id=1, status=1, time_spent=25, question_id="q1"),
        MockPracticeSessionAnswer(id=2, status=1, time_spent=30, question_id="q2"),
        MockPracticeSessionAnswer(id=3, status=2, time_spent=45, question_id="q3"),
        MockPracticeSessionAnswer(id=4, status=1, time_spent=20, question_id="q4"),
        MockPracticeSessionAnswer(id=5, status=2, time_spent=60, question_id="q5"),
        MockPracticeSessionAnswer(id=6, status=1, time_spent=35, question_id="q6"),
        MockPracticeSessionAnswer(id=7, status=1, time_spent=28, question_id="q7"),
        MockPracticeSessionAnswer(id=8, status=2, time_spent=50, question_id="q8"),
        MockPracticeSessionAnswer(id=9, status=1, time_spent=22, question_id="q9"),
        MockPracticeSessionAnswer(id=10, status=1, time_spent=33, question_id="q10"),
    ]


@pytest.fixture
def mock_practice() -> MockPractice:
    """生成 mock 练习"""
    return MockPractice(
        parameters=[
            {"key": "generate_count", "value": {1: 10, 2: 10, 3: 12}},
            {"key": "recall_count", "value": {1: 2, 2: 3, 3: 5}},
        ]
    )


@pytest.fixture
def mock_textbook() -> MockTextbook:
    """生成 mock 教材"""
    return MockTextbook()


@pytest.fixture
def mock_session() -> MockPracticeSession:
    """生成 mock 练习会话"""
    return MockPracticeSession()


@pytest.fixture
def mock_db_session():
    """生成 mock 数据库会话"""
    session = AsyncMock()
    session.scalar = AsyncMock()
    session.scalars = AsyncMock()
    session.execute = AsyncMock()
    session.add = MagicMock()
    session.add_all = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    session.flush = AsyncMock()
    return session
