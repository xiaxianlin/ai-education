"""
验证函数单元测试

测试 shared/utils/validation.py 中的所有验证函数。
"""

import pytest
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shared.utils.validation import username, password, phone, grade, subject, status


class TestUsernameValidation:
    """用户名验证测试"""

    def test_valid_username_alphanumeric(self):
        """有效用户名：字母和数字"""
        assert username("admin123") == "admin123"

    def test_valid_username_with_underscore(self):
        """有效用户名：包含下划线"""
        assert username("admin_user") == "admin_user"

    def test_valid_username_only_letters(self):
        """有效用户名：仅字母"""
        assert username("testuser") == "testuser"

    def test_invalid_username_with_special_char(self):
        """无效用户名：包含特殊字符"""
        with pytest.raises(ValueError, match="用户名只能包含字母、数字和下划线"):
            username("user@123")

    def test_invalid_username_with_space(self):
        """无效用户名：包含空格"""
        with pytest.raises(ValueError, match="用户名只能包含字母、数字和下划线"):
            username("user name")

    def test_invalid_username_with_chinese(self):
        """无效用户名：包含中文"""
        with pytest.raises(ValueError, match="用户名只能包含字母、数字和下划线"):
            username("用户名")


class TestPasswordValidation:
    """密码验证测试"""

    def test_valid_password(self):
        """有效密码：满足所有要求"""
        assert password("Test@1234") == "Test@1234"

    def test_password_too_short(self):
        """无效密码：长度不足8位"""
        with pytest.raises(ValueError, match="密码长度不能小于8位"):
            password("Ab@1234")

    def test_password_no_uppercase(self):
        """无效密码：缺少大写字母"""
        with pytest.raises(ValueError, match="密码必须包含大写字母"):
            password("test@1234")

    def test_password_no_lowercase(self):
        """无效密码：缺少小写字母"""
        with pytest.raises(ValueError, match="密码必须包含小写字母"):
            password("TEST@1234")

    def test_password_no_digit(self):
        """无效密码：缺少数字"""
        with pytest.raises(ValueError, match="密码必须包含数字"):
            password("Test@abcd")

    def test_password_no_special_char(self):
        """无效密码：缺少特殊字符"""
        with pytest.raises(ValueError, match="密码必须包含特殊字符"):
            password("Test12345")


class TestPhoneValidation:
    """手机号验证测试"""

    def test_valid_phone(self):
        """有效手机号"""
        assert phone("13812345678") == "13812345678"

    def test_valid_phone_different_prefix(self):
        """有效手机号：不同运营商前缀"""
        assert phone("15912345678") == "15912345678"
        assert phone("18812345678") == "18812345678"

    def test_invalid_phone_wrong_length(self):
        """无效手机号：长度错误"""
        with pytest.raises(ValueError, match="手机号格式不正确"):
            phone("1381234567")  # 10位

    def test_invalid_phone_wrong_prefix(self):
        """无效手机号：前缀错误"""
        with pytest.raises(ValueError, match="手机号格式不正确"):
            phone("12345678901")  # 1开头但第二位不是3-9

    def test_invalid_phone_with_letters(self):
        """无效手机号：包含字母"""
        with pytest.raises(ValueError, match="手机号格式不正确"):
            phone("138abcd5678")


class TestGradeValidation:
    """年级验证测试"""

    def test_valid_grade_boundary_low(self):
        """有效年级：下边界"""
        assert grade(1) == 1

    def test_valid_grade_boundary_high(self):
        """有效年级：上边界"""
        assert grade(12) == 12

    def test_valid_grade_middle(self):
        """有效年级：中间值"""
        assert grade(6) == 6

    def test_invalid_grade_zero(self):
        """无效年级：0"""
        with pytest.raises(ValueError, match="年级只能为1-12年级"):
            grade(0)

    def test_invalid_grade_too_high(self):
        """无效年级：超出范围"""
        with pytest.raises(ValueError, match="年级只能为1-12年级"):
            grade(13)

    def test_grade_none_returns_none(self):
        """年级为 None 时返回 None"""
        assert grade(None) is None


class TestSubjectValidation:
    """科目验证测试"""

    def test_valid_subject_chinese(self):
        """有效科目：语文"""
        assert subject("语文") == "语文"

    def test_valid_subject_math(self):
        """有效科目：数学"""
        assert subject("数学") == "数学"

    def test_valid_subject_english(self):
        """有效科目：英语"""
        assert subject("英语") == "英语"

    def test_invalid_subject(self):
        """无效科目"""
        with pytest.raises(ValueError, match="科目只能为"):
            subject("物理")

    def test_subject_none_returns_none(self):
        """科目为 None 时返回 None"""
        assert subject(None) is None


class TestStatusValidation:
    """状态验证测试"""

    def test_valid_status_0(self):
        """有效状态：0

        注意：这个测试验证了一个已知 bug - 当 v=0 时，
        原代码的 `if v` 条件为 False，导致验证被跳过。
        预期行为应该是 0 被视为有效值并返回。
        """
        # 当前实现会因为 `if v` 判断跳过验证，返回 0
        assert status(0) == 0

    def test_valid_status_1(self):
        """有效状态：1"""
        assert status(1) == 1

    def test_invalid_status(self):
        """无效状态"""
        with pytest.raises(ValueError, match="状态只能为"):
            status(3)

    def test_status_with_custom_options(self):
        """自定义选项的状态验证"""
        assert status(2, [0, 1, 2]) == 2

    def test_status_none_returns_none(self):
        """状态为 None 时应该返回 None（通过验证）"""
        assert status(None) is None

    def test_status_zero_bug_fixed(self):
        """验证 status(0) bug 已修复

        修复后，当 options=[1, 2] 时，0 不在选项中，会正确抛出 ValueError。
        """
        with pytest.raises(ValueError, match="状态只能为"):
            status(0, [1, 2])
