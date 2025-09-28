import jwt, json, hashlib, string, secrets
from common.settings import envs


def encode(data: dict) -> str:
    return jwt.encode(data, envs.APP_SECRET_KEY, algorithm="HS256")


def decode(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, envs.APP_SECRET_KEY, algorithms=["HS256"])
    except jwt.exceptions.InvalidTokenError:
        return None
    return payload


def hash(data: str | dict) -> str:
    if isinstance(data, dict):
        data = json.dumps(data)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_password() -> str:
    """
    生成强密码（保证每个被启用的类别至少出现一次）。
    """
    length = 16
    pools = [
        string.ascii_lowercase,
        string.ascii_uppercase,
        string.digits,
        "!@#$%^&*()-_=+[]{}|;:,.<>?/~`",
    ]
    password_chars = [secrets.choice(p) for p in pools]
    full_pool = "".join(pools)
    remaining = length - len(password_chars)
    password_chars += [secrets.choice(full_pool) for _ in range(remaining)]

    secrets.SystemRandom().shuffle(password_chars)

    return "".join(password_chars)
