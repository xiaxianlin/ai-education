import re

from shared.core.constants import SUBJECTS


def username(v):
    if not re.match(r"^[a-zA-Z0-9_]+$", v):  # 仅允许 ASCII 字母、数字和下划线
        raise ValueError("用户名只能包含字母、数字和下划线")
    return v


def password(v):
    # 至少8位，包含大小写字母、数字和特殊字符
    if len(v) < 8:
        raise ValueError("密码长度不能小于8位")
    if not re.search(r"[A-Z]", v):
        raise ValueError("密码必须包含大写字母")
    if not re.search(r"[a-z]", v):
        raise ValueError("密码必须包含小写字母")
    if not re.search(r"\d", v):
        raise ValueError("密码必须包含数字")
    if not re.search(r'[_!@#$%^&*(),.?":{}|<>\-]', v):
        raise ValueError("密码必须包含特殊字符")
    return v


def phone(v):
    if not re.fullmatch(r"^1[3-9]\d{9}$", v):
        raise ValueError("手机号格式不正确")
    return v


def grade(v):
    if v is not None and v not in range(1, 13):
        raise ValueError("年级只能为1-12年级")
    return v


def subject(v):
    if v and v not in SUBJECTS:
        raise ValueError(f"科目只能为{'、'.join(SUBJECTS)}")
    return v


def status(v, options: list[int] = [0, 1]):
    if v is not None and v not in options:
        raise ValueError(f"状态只能为{'、'.join(map(str, options))}")
    return v
