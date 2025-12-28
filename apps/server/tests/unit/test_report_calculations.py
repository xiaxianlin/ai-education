"""
报告计算函数单元测试

测试 shared/practice/report.py 中的纯计算函数。
这些函数不依赖数据库，可以直接测试。
"""

import pytest
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shared.practice.report import (
    calculate_learning_speed,
    calculate_consistency,
    calculate_ability_assessment,
)


class TestCalculateLearningSpeed:
    """学习速度计算测试"""

    def test_normal_answers(self, mock_answer_records):
        """正常答题记录：计算平均耗时"""
        result = calculate_learning_speed(mock_answer_records)
        # 总时间: 25+30+45+20+60+35+28+50+22+33 = 348
        # 题目数: 10
        # 平均: 34.8
        assert result == 34.8

    def test_empty_answers(self):
        """空答题记录：返回0"""
        result = calculate_learning_speed([])
        assert result == 0.0

    def test_answers_with_no_time(self):
        """所有答题时间为0：返回0"""
        from tests.conftest import MockPracticeSessionAnswer

        answers = [
            MockPracticeSessionAnswer(time_spent=0),
            MockPracticeSessionAnswer(time_spent=0),
        ]
        result = calculate_learning_speed(answers)
        assert result == 0.0

    def test_mixed_time_answers(self):
        """部分有时间记录"""
        from tests.conftest import MockPracticeSessionAnswer

        answers = [
            MockPracticeSessionAnswer(id=1, time_spent=30),
            MockPracticeSessionAnswer(id=2, time_spent=0),  # 无时间
            MockPracticeSessionAnswer(id=3, time_spent=60),
        ]
        result = calculate_learning_speed(answers)
        # 总时间: 30+60=90, 有效题目数: 2
        # 平均: 45.0
        assert result == 45.0


class TestCalculateConsistency:
    """稳定性计算测试"""

    def test_less_than_5_answers(self):
        """少于5题：返回0"""
        from tests.conftest import MockPracticeSessionAnswer

        answers = [MockPracticeSessionAnswer() for _ in range(4)]
        result = calculate_consistency(answers)
        assert result == 0.0

    def test_exactly_5_answers_all_correct(self):
        """恰好5题全对：只有一组，返回100"""
        from tests.conftest import MockPracticeSessionAnswer

        answers = [MockPracticeSessionAnswer(status=1) for _ in range(5)]
        result = calculate_consistency(answers)
        assert result == 100.0

    def test_10_answers_consistent(self):
        """10题稳定表现：两组正确率相同"""
        from tests.conftest import MockPracticeSessionAnswer

        # 第一组5题：4对1错 (80%)
        # 第二组5题：4对1错 (80%)
        answers = [
            MockPracticeSessionAnswer(id=1, status=1),
            MockPracticeSessionAnswer(id=2, status=1),
            MockPracticeSessionAnswer(id=3, status=1),
            MockPracticeSessionAnswer(id=4, status=1),
            MockPracticeSessionAnswer(id=5, status=2),  # 错
            MockPracticeSessionAnswer(id=6, status=1),
            MockPracticeSessionAnswer(id=7, status=1),
            MockPracticeSessionAnswer(id=8, status=1),
            MockPracticeSessionAnswer(id=9, status=1),
            MockPracticeSessionAnswer(id=10, status=2),  # 错
        ]
        result = calculate_consistency(answers)
        # 两组正确率都是80%，标准差为0，稳定性为100
        assert result == 100.0

    def test_10_answers_inconsistent(self):
        """10题不稳定表现：两组正确率差异大"""
        from tests.conftest import MockPracticeSessionAnswer

        # 第一组5题：5对0错 (100%)
        # 第二组5题：0对5错 (0%)
        answers = [
            MockPracticeSessionAnswer(id=1, status=1),
            MockPracticeSessionAnswer(id=2, status=1),
            MockPracticeSessionAnswer(id=3, status=1),
            MockPracticeSessionAnswer(id=4, status=1),
            MockPracticeSessionAnswer(id=5, status=1),
            MockPracticeSessionAnswer(id=6, status=2),  # 错
            MockPracticeSessionAnswer(id=7, status=2),
            MockPracticeSessionAnswer(id=8, status=2),
            MockPracticeSessionAnswer(id=9, status=2),
            MockPracticeSessionAnswer(id=10, status=2),
        ]
        result = calculate_consistency(answers)
        # 正确率分别为 100% 和 0%，标准差为 50%
        # 稳定性 = 100 - 50 = 50
        assert result == 50.0


class TestCalculateAbilityAssessment:
    """能力评估计算测试"""

    def test_excellent_score(self):
        """优秀分数：90+"""
        ability, confidence, level, percentile = calculate_ability_assessment(95, 90)
        assert ability >= 2.5
        assert level == "优秀"
        assert percentile >= 90

    def test_good_score(self):
        """良好分数：70-90"""
        ability, confidence, level, percentile = calculate_ability_assessment(80, 85)
        assert 1.0 <= ability < 2.5
        assert level == "良好"

    def test_medium_score(self):
        """中等分数：50-70"""
        ability, confidence, level, percentile = calculate_ability_assessment(60, 80)
        assert 0 <= ability < 1.0
        assert level == "中等"

    def test_passing_score(self):
        """及格分数：40-50"""
        ability, confidence, level, percentile = calculate_ability_assessment(45, 75)
        assert -1.0 <= ability < 0
        assert level == "及格"

    def test_low_score(self):
        """低分：< 40"""
        ability, confidence, level, percentile = calculate_ability_assessment(30, 70)
        assert ability < -1.0
        assert level == "需提高"

    def test_confidence_from_consistency(self):
        """置信度基于稳定性"""
        _, confidence1, _, _ = calculate_ability_assessment(70, 100)
        _, confidence2, _, _ = calculate_ability_assessment(70, 50)
        assert confidence1 == 1.0
        assert confidence2 == 0.5

    def test_percentile_range(self):
        """百分位范围：0-99"""
        _, _, _, percentile1 = calculate_ability_assessment(100, 100)
        _, _, _, percentile2 = calculate_ability_assessment(0, 50)
        assert 0 <= percentile1 <= 99
        assert 0 <= percentile2 <= 99

    def test_boundary_90(self):
        """边界值：恰好90分"""
        ability, _, level, _ = calculate_ability_assessment(90, 80)
        assert ability >= 2.5
        assert level == "优秀"

    def test_boundary_70(self):
        """边界值：恰好70分"""
        ability, _, level, _ = calculate_ability_assessment(70, 80)
        assert ability >= 1.0
        assert level == "良好"

    def test_boundary_50(self):
        """边界值：恰好50分"""
        ability, _, level, _ = calculate_ability_assessment(50, 80)
        # 50分在边界上，根据公式 ability = -0.5 + 0 = -0.5
        assert ability == -0.5
        assert level == "及格"
