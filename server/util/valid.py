import re


def username(v):
    if not re.match(r"^\w+$", v):  # 等价于 [a-zA-Z0-9_]
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
