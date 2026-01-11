# -*- coding: utf-8 -*-
"""
掌握度计算服务单元测试
"""
import pytest
from shared.practice.mastery import (
    calculate_mastery_score,
    get_mastery_level,
    extract_ability_codes,
)


class TestCalculateMasteryScore:
    """掌握度计算公式测试"""

    def test_zero_count_returns_zero(self):
        """测试零次练习返回 0 分"""
        assert calculate_mastery_score(0, 0) == 0.0

    def test_all_correct(self):
        """测试全部正确"""
        # (10 + 2) / (10 + 0 + 4) * 100 = 12/14 * 100 ≈ 85.71
        score = calculate_mastery_score(10, 0)
        assert 85 < score < 86

    def test_all_wrong(self):
        """测试全部错误"""
        # (0 + 2) / (0 + 10 + 4) * 100 = 2/14 * 100 ≈ 14.29
        score = calculate_mastery_score(0, 10)
        assert 14 < score < 15

    def test_half_correct(self):
        """测试一半正确"""
        # (5 + 2) / (5 + 5 + 4) * 100 = 7/14 * 100 = 50.0
        assert calculate_mastery_score(5, 5) == 50.0

    def test_high_accuracy(self):
        """测试高正确率"""
        # (10 + 2) / (10 + 2 + 4) * 100 = 12/16 * 100 = 75.0
        assert calculate_mastery_score(10, 2) == 75.0

    def test_custom_alpha(self):
        """测试自定义平滑系数"""
        # alpha=1: (10 + 1) / (10 + 2 + 2) * 100 = 11/14 * 100 ≈ 78.57
        score = calculate_mastery_score(10, 2, alpha=1.0)
        assert 78 < score < 79


class TestGetMasteryLevel:
    """掌握等级映射测试"""

    def test_unlearned_level(self):
        """测试未掌握等级"""
        assert get_mastery_level(0) == "unlearned"
        assert get_mastery_level(20) == "unlearned"
        assert get_mastery_level(39) == "unlearned"
        assert get_mastery_level(39.99) == "unlearned"

    def test_beginner_level(self):
        """测试初步掌握等级"""
        assert get_mastery_level(40) == "beginner"
        assert get_mastery_level(50) == "beginner"
        assert get_mastery_level(59.99) == "beginner"

    def test_proficient_level(self):
        """测试基本掌握等级"""
        assert get_mastery_level(60) == "proficient"
        assert get_mastery_level(70) == "proficient"
        assert get_mastery_level(79.99) == "proficient"

    def test_mastered_level(self):
        """测试熟练掌握等级"""
        assert get_mastery_level(80) == "mastered"
        assert get_mastery_level(90) == "mastered"
        assert get_mastery_level(100) == "mastered"

    def test_negative_returns_unlearned(self):
        """测试负数返回未掌握"""
        assert get_mastery_level(-10) == "unlearned"


class TestExtractAbilityCodes:
    """能力代码提取测试"""

    def test_empty_question(self):
        """测试空题目"""
        from unittest.mock import MagicMock

        question = MagicMock()
        question.ability_tags = None
        question.question_type = None

        codes = extract_ability_codes(question)
        assert codes == []

    def test_extract_from_ability_tags(self):
        """测试从 ability_tags 提取"""
        from unittest.mock import MagicMock

        question = MagicMock()
        question.ability_tags = ["cn_g1_pinyin_read", "cn_g1_char_read"]
        question.question_type = None

        codes = extract_ability_codes(question)
        assert set(codes) == {"cn_g1_pinyin_read", "cn_g1_char_read"}

    def test_extract_from_question_type(self):
        """测试从 question_type 提取"""
        from unittest.mock import MagicMock

        question = MagicMock()
        question.ability_tags = None
        question.question_type = MagicMock()
        question.question_type.ability_atomic_codes = ["math_g1_count"]

        codes = extract_ability_codes(question)
        assert codes == ["math_g1_count"]

    def test_deduplicate_codes(self):
        """测试去重"""
        from unittest.mock import MagicMock

        question = MagicMock()
        question.ability_tags = ["cn_g1_pinyin_read"]
        question.question_type = MagicMock()
        question.question_type.ability_atomic_codes = ["cn_g1_pinyin_read"]

        codes = extract_ability_codes(question)
        assert codes == ["cn_g1_pinyin_read"]
