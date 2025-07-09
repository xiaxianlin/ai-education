import requests
from core import get_logger, settings


class WechatService:
    app_id = settings.WECHAT_APP_ID
    app_secret = settings.WECHAT_APP_SECRET
    logger = get_logger("WechatService")

    @classmethod
    def _format_response(cls, response):
        if response.status_code == 200:
            data = response.json()
            cls.logger.info(data)
            if "errcode" in data and data["errcode"] != 0:
                raise ValueError(data["errmsg"])
            return data
        else:
            raise ValueError("请求异常")

    @classmethod
    def login(cls, code: str) -> dict:
        url = f"https://api.weixin.qq.com/sns/jscode2session?appid={cls.app_id}&secret={cls.app_secret}&js_code={code}&grant_type=authorization_code"
        res = requests.get(url)
        return cls._format_response(res)

    @classmethod
    def get_access_token(cls):
        url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={cls.app_id}&secret={cls.app_secret}"
        res = requests.get(url)
        data = cls._format_response(res)
        return data["access_token"]

    @classmethod
    def get_phone_number(cls, code: str):
        token = cls.get_access_token()
        url = f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={token}"
        res = requests.post(url, json={"code": code})
        data = cls._format_response(res)
        return data["phone_info"]["purePhoneNumber"]
