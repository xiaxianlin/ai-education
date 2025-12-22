import jwt, json, hashlib, string, secrets
import bcrypt
from loguru import logger
from shared.core.settings import envs
from shared.core.constants import TOKEN_EXPIRES_HOURS, PASSWORD_LENGTH
from datetime import datetime, timedelta, timezone


def encode(data: dict, expires_hours: int = TOKEN_EXPIRES_HOURS) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, envs.APP_SECRET_KEY, algorithm="HS256")


def decode(token: str) -> dict | None:
    """
    解码 JWT Token
    
    Args:
        token: JWT Token 字符串
        
    Returns:
        Token payload 字典，如果 Token 无效或过期则返回 None
    """
    try:
        payload = jwt.decode(token, envs.APP_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.exceptions.ExpiredSignatureError:
        logger.warning("Token 已过期")
        return None
    except jwt.exceptions.InvalidTokenError as e:
        logger.warning(f"Token 无效: {e}")
        return None


def hash(data: str | dict) -> str:
    """
    使用bcrypt对密码进行安全哈希
    
    Args:
        data: 密码字符串或字典（字典会转为JSON字符串）
        
    Returns:
        bcrypt哈希后的密码字符串
    """
    if isinstance(data, dict):
        data = json.dumps(data)
    # 使用bcrypt进行密码哈希
    salt = bcrypt.gensalt(rounds=12)  # 12轮，平衡安全性和性能
    hashed = bcrypt.hashpw(data.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否匹配
    
    Args:
        plain_password: 明文密码
        hashed_password: 哈希后的密码
        
    Returns:
        是否匹配
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def hash_legacy(data: str | dict) -> str:
    """
    旧的SHA256哈希方法（用于兼容旧数据或非密码场景）
    
    Args:
        data: 要哈希的数据
        
    Returns:
        SHA256哈希值
    """
    if isinstance(data, dict):
        data = json.dumps(data)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_password() -> str:
    """
    生成强密码（保证每个被启用的类别至少出现一次）。
    """
    length = PASSWORD_LENGTH
    pools = [
        string.ascii_lowercase,
        string.ascii_uppercase,
        string.digits,
        "!@#$%^&*",
    ]
    password_chars = [secrets.choice(p) for p in pools]
    full_pool = "".join(pools)
    remaining = length - len(password_chars)
    password_chars += [secrets.choice(full_pool) for _ in range(remaining)]

    secrets.SystemRandom().shuffle(password_chars)

    return "".join(password_chars)
