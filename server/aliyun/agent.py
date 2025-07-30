import json
from http import HTTPStatus
from dashscope import Application

from core import settings
from core.logger import get_logger


class AliyunAgent:
    logger = get_logger("AliyunAgent")

    @classmethod
    def call(cls, query: str, app_id: str, file_id: str) -> dict:
        response = Application.call(
            api_key=settings.ALIYUN_AI_KEY,
            app_id=app_id,
            prompt=query,
            rag_options={"file_ids": [file_id]},
        )
        if response.status_code != HTTPStatus.OK:
            raise ValueError(response.message)

        raw_text = response.output.text
        if not raw_text:
            raise ValueError("提取数据失败")

        try:
            json_data = json.loads(raw_text)
            return json_data
        except json.JSONDecodeError:
            raise ValueError("提取的 JSON 格式错误")
