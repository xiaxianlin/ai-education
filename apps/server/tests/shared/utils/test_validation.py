import pytest
from shared.utils import validation

def test_validate_username():
    """测试用户名验证"""
    assert validation.username("user123") == "user123"
    assert validation.username("admin_user") == "admin_user"
    
    with pytest.raises(ValueError, match="用户名只能包含字母、数字和下划线"):
        validation.username("user-123")
    
    with pytest.raises(ValueError, match="用户名只能包含字母、数字和下划线"):
        validation.username("user 123")

def test_validate_password():
    """测试密码强度验证"""
    valid_pass = "Secure123!"
    assert validation.password(valid_pass) == valid_pass
    
    with pytest.raises(ValueError, match="密码长度不能小于8位"):
        validation.password("Short1!")
        
    with pytest.raises(ValueError, match="密码必须包含大写字母"):
        validation.password("lowercase123!")
        
    with pytest.raises(ValueError, match="密码必须包含小写字母"):
        validation.password("UPPERCASE123!")
        
    with pytest.raises(ValueError, match="密码必须包含数字"):
        validation.password("NoDigits!")
        
    with pytest.raises(ValueError, match="密码必须包含特殊字符"):
        validation.password("NoSpecial123")

def test_validate_phone():
    """测试手机号验证"""
    assert validation.phone("13812345678") == "13812345678"
    assert validation.phone("19988887777") == "19988887777"
    
    errors = [
        "12345678901",  # 不以13-19开头
        "1381234567",   # 少于11位
        "138123456789", # 多于11位
        "abc12345678",  # 包含非数字
    ]
    for p in errors:
        with pytest.raises(ValueError, match="手机号格式不正确"):
            validation.phone(p)
