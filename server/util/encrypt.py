import jwt, json, hashlib, datetime
from fastapi import Depends, Header
from core import settings
from util import time


def encode(data: dict) -> str:
    data["exp"] = datetime.datetime.now() + datetime.timedelta(days=360)
    return jwt.encode(data, settings.APP_SECRET_KEY, algorithm="HS256")


def decode(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.APP_SECRET_KEY, algorithms=["HS256"])
    except jwt.exceptions.InvalidTokenError:
        return None
    return payload


def hash(data: str | dict) -> str:
    if isinstance(data, dict):
        data = json.dumps(data)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def encode_user(user: dict):
    return encode({"user": user, "time": time.now()})


def decode_user(x_access_token: str = Header()):
    payload = decode(x_access_token)
    return payload["user"]


def encode_manager(manager: dict):
    return encode({"manager": manager, "time": time.now()})


def decode_manager(x_access_token: str = Header()):
    payload = decode(x_access_token)
    return payload["manager"]


GetUser = Depends(decode_user)
GetManager = Depends(decode_manager)
