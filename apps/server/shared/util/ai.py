import base64

import requests
from langchain_openai import ChatOpenAI
from loguru import logger
from openai import OpenAI
from shared.core.settings import envs


def get_openai_client():
    return OpenAI(api_key=envs.LLM_API_KEY, base_url=envs.LLM_API_BASE, model=envs.LLM_MODEL_NAME)


def get_langchain_client():
    return ChatOpenAI(
        api_key=envs.LLM_API_KEY, base_url=envs.LLM_API_BASE, model=envs.LLM_MODEL_NAME
    )


def llm(prompt: str):
    """LLM 调用"""
    try:
        client = get_langchain_client()
        response = client.invoke(prompt)
        logger.info(f"LLM 调用成功: {response.usage_metadata}")
        return response.content
    except Exception as e:
        logger.error(f"错误信息：{e}")
        raise ValueError(f"LLM 调用失败: {str(e)}")


def asr(audio_url: str) -> str:
    """
    ASR 调用

    Args:
        audio_url (str): 需要识别的音频 URL

    Returns:
        str: 识别后的文本
    """
    try:
        client = OpenAI(api_key=envs.ASR_API_KEY, base_url=envs.ASR_API_BASE)
        completion = client.chat.completions.create(
            model=envs.ASR_MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": [{"type": "input_audio", "input_audio": {"data": audio_url}}],
                },
            ],
            stream=False,
            extra_body={"asr_options": {"enable_itn": True}},
        )
        logger.info(f"ASR 调用成功: {completion.choices[0].message.content}")
        logger.info(f"ASR 调用成功: {completion.usage}")
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"错误信息：{e}")
        raise ValueError(f"ASR 调用失败: {str(e)}")


def tts(text: str) -> str:
    """
    TTS 调用

    Args:
        text (str): 需要转换的文本

    Returns:
        str: base64 编码的音频数据
    """
    try:
        url = envs.TTS_API_BASE
        headers = {
            "Authorization": f"Bearer {envs.TTS_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": envs.TTS_MODEL_NAME,
            "text": text,
            "stream": False,
            "voice_setting": {"voice_id": envs.TTS_API_VOICE},
        }
        response = requests.post(url, json=payload, headers=headers, timeout=600)
        response.raise_for_status()
        result = response.json()

        # 检查响应状态
        base_resp = result.get("base_resp", {})
        if base_resp.get("status_code") != 0:
            status_msg = base_resp.get("status_msg", "unknown error")
            raise ValueError(f"TTS API 返回错误: {status_msg}")

        # 提取 hex 编码的音频数据
        audio_hex = result.get("data", {}).get("audio", "")
        if not audio_hex:
            raise ValueError("TTS API 返回的音频数据为空")

        # 将 hex 编码转换为 base64 编码
        try:
            audio_bytes = bytes.fromhex(audio_hex)
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        except Exception as e:
            raise ValueError(f"音频数据格式转换失败: {str(e)}")

        logger.info(f"TTS 调用成功: text={text[:50]}..., audio_size={len(audio_bytes)} bytes")
        # 返回 base64 编码的音频数据
        return audio_base64
    except Exception as e:
        logger.error(f"TTS 调用失败: {e}")
        raise ValueError(f"TTS 调用失败: {str(e)}")


def image(prompt: str, aspect_ratio: str = "16:9") -> str:
    """
    图片生成调用

    Args:
        prompt (str): 图片生成提示词
        aspect_ratio (str, optional): 图片宽高比. Defaults to "16:9".

    Returns:
        str: 图片 base64 编码
    """
    try:
        url = envs.IMAGE_API_BASE
        headers = {
            "Authorization": f"Bearer {envs.IMAGE_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": envs.IMAGE_MODEL_NAME,
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "response_format": "base64",
            "n": 3,
        }
        response = requests.post(url, json=payload, headers=headers, timeout=600)
        response.raise_for_status()
        result = response.json()

        # 检查响应状态
        base_resp = result.get("base_resp", {})
        if base_resp.get("status_code") != 0:
            status_msg = base_resp.get("status_msg", "unknown error")
            raise ValueError(f"IMAGE API 返回错误: {status_msg}")

        # 提取图片 base64 列表
        image_raws = result.get("data", {}).get("image_base64", [])
        if not image_raws:
            raise ValueError("IMAGE API 返回的图片 base64 列表为空")

        # 记录元数据信息
        metadata = result.get("metadata", {})
        success_count = metadata.get("success_count", "0")
        failed_count = metadata.get("failed_count", "0")

        logger.info(
            f"IMAGE 调用成功: prompt={prompt[:50]}..., "
            f"success_count={success_count}, failed_count={failed_count}, "
            f"image_count={len(image_raws)}"
        )
        # 返回图片第一张图片的 base64
        return image_raws[0]
    except Exception as e:
        logger.error(f"IMAGE 调用失败: {e}")
        raise ValueError(f"IMAGE 调用失败: {str(e)}")
