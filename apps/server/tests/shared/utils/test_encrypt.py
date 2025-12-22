import pytest
from shared.utils import encrypt

def test_password_hashing():
    """测试密码哈希和验证"""
    password = "SafePassword123!"
    hashed = encrypt.hash(password)
    
    assert hashed != password
    assert encrypt.verify_password(password, hashed) is True
    assert encrypt.verify_password("wrong_password", hashed) is False

def test_jwt_encode_decode():
    """测试 JWT 编码和解码"""
    data = {"user_id": "test_user", "role": "admin"}
    token = encrypt.encode(data, expires_hours=1)
    
    assert isinstance(token, str)
    
    decoded = encrypt.decode(token)
    assert decoded["user_id"] == data["user_id"]
    assert decoded["role"] == data["role"]
    assert "exp" in decoded

def test_jwt_decode_invalid():
    """测试无效的 JWT 解码"""
    assert encrypt.decode("invalid.token.here") is None

def test_generate_password():
    """测试随机密码生成"""
    password = encrypt.generate_password()
    assert len(password) >= 8  # 默认长度
    
    # 验证是否包含各类字符
    import string
    assert any(c in string.ascii_lowercase for c in password)
    assert any(c in string.ascii_uppercase for c in password)
    assert any(c in string.digits for c in password)
    assert any(c in "!@#$%^&*" for c in password)

def test_hash_legacy():
    """测试旧版哈希（SHA256）"""
    data = "test_data"
    hashed = encrypt.hash_legacy(data)
    
    import hashlib
    expected = hashlib.sha256(data.encode("utf-8")).hexdigest()
    assert hashed == expected
