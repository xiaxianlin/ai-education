"""
练习生成模块测试

测试 shared/practice/generate.py 中的函数。
"""

import pytest
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shared.practice.generate import _compose_parameters


class TestComposeParameters:
    """参数组装测试"""

    def test_basic_parameters(self, mock_practice, mock_textbook):
        """基础参数组装"""
        student_id = "student_001"
        result = _compose_parameters(mock_practice, mock_textbook, student_id)

        assert result["student_id"] == student_id
        assert result["textbook_id"] == mock_textbook.id
        assert result["unit_id"] is None
        assert result["grade"] == mock_textbook.grade
        assert result["subject"] == mock_textbook.subject

    def test_parameters_with_unit(self, mock_practice, mock_textbook):
        """带单元 ID 的参数组装"""
        student_id = "student_001"
        unit_id = 5
        result = _compose_parameters(mock_practice, mock_textbook, student_id, unit_id)

        assert result["unit_id"] == unit_id

    def test_generate_count_from_practice_config(self, mock_textbook):
        """从练习配置获取生成数量"""
        from tests.conftest import MockPractice

        practice = MockPractice(
            parameters=[
                {"key": "generate_count", "value": {1: 8, 2: 10, 3: 15, 4: 18}},
            ]
        )
        mock_textbook.grade = 3  # 三年级

        result = _compose_parameters(practice, mock_textbook, "student_001")

        # 三年级对应 generate_count = 15
        assert result["generate_count"] == 15

    def test_recall_count_from_practice_config(self, mock_textbook):
        """从练习配置获取召回数量"""
        from tests.conftest import MockPractice

        practice = MockPractice(
            parameters=[
                {"key": "recall_count", "value": {1: 2, 2: 3, 3: 5, 4: 8}},
            ]
        )
        mock_textbook.grade = 3  # 三年级

        result = _compose_parameters(practice, mock_textbook, "student_001")

        # 三年级对应 recall_count = 5
        assert result["recall_count"] == 5

    def test_default_values_when_no_config(self, mock_textbook):
        """无配置时使用默认值"""
        from tests.conftest import MockPractice

        practice = MockPractice(parameters=[])

        result = _compose_parameters(practice, mock_textbook, "student_001")

        # 默认值
        assert result["generate_count"] == 15
        assert result["recall_count"] == 0

    def test_default_values_when_grade_not_in_config(self, mock_textbook):
        """年级不在配置中时使用默认值"""
        from tests.conftest import MockPractice

        practice = MockPractice(
            parameters=[
                {"key": "generate_count", "value": {1: 8, 2: 10}},  # 没有 grade=3
            ]
        )
        mock_textbook.grade = 3  # 三年级

        result = _compose_parameters(practice, mock_textbook, "student_001")

        # 三年级不在配置中，使用默认值 15
        assert result["generate_count"] == 15
