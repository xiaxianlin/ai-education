"""语音生成服务"""

import json
import dashscope
from loguru import logger
from openai import OpenAI

from core.settings import envs
from schemas.audio import AudioAnalysisResponse


def get_audio_understanding_system_prompt(question):
    return f"""你是一个英语口语评估助手，需要对学生的录音进行理解和分析。

你必须完成以下任务（所有任务都必须执行，不得省略）：
1. 先"准确转写"音频中用户说的内容，尽量还原原句（recognized_text）
2. 判断学生说的内容与题目要求（question）是否匹配（match 字段，true/false）
3. 生成一段完整的分析文本（analysis），其中需要同时包含：
   - 原因说明：为什么匹配 / 不匹配，具体问题出在哪（内容、语法、发音、语调等）
   - 改进建议：学生可以如何改进（给出 1-3 条可操作性强的建议）

题目要求（question）：{question}

重要要求：
- 输出内容的对象是学生，请使用温和鼓励的语气
- 必须先完整解析和转写用户说的内容，而不是只判断对错
- 必须始终返回 JSON 格式，且字段必须为：
  - recognized_text: string
  - match: boolean
  - analysis: string（同时包含原因说明和改进建议）
- 不要在 JSON 之外输出任何多余文字（如解释、前后缀等）"""


def generate_audio(text: str, voice: str = "Cherry", language: str = "English") -> str:
    """
    生成语音

    Args:
        text: 要转换为语音的文本
        voice: 语音角色（默认 Cherry）
        language: 语言（默认 Chinese）

    Returns:
        str: 音频 URL
    """
    logger.info(
        f"开始文本转语音，文本长度: {len(text)}, 语音: {voice}, 语言: {language}"
    )
    logger.debug(f"文本内容: {text[:200]}...")

    response = dashscope.MultiModalConversation.call(
        api_key=envs.AI_PLATFORM_KEY,
        model="qwen3-tts-flash",
        text=text,
        voice=voice,
        language_type=language,
        stream=False,
    )

    logger.debug(f"语音生成响应: {response}")

    if response.status_code != 200:
        logger.error(
            f"文本转语音失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
        )
        raise ValueError(
            f"任务 ID：{response.request_id} \n 错误信息：{response.message}"
        )

    audio_url = response.output.audio.url
    logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")
    return audio_url


@staticmethod
def audio_analysis(
    audio_url: str, audio_type: str, question: str
) -> AudioAnalysisResponse:
    """
    音频理解函数

    Args:
        audio_url: OSS 音频访问地址
        audio_type: 音频格式（如 webm/mp3）
        question: 问题模型/题目要求

    Returns:
        AudioUnderstandingResult: 音频理解结果模型
    """
    logger.info(f"开始音频理解，音频地址: {audio_url}, 问题: {question[:100]}...")

    # 系统提示：无论是否符合题目要求，都必须先完整解析用户的发音内容，
    # 然后再给出是否匹配以及不匹配原因，并给出改进建议，最终严格按 JSON 返回
    client = OpenAI(
        api_key=envs.AI_PLATFORM_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    try:
        completion = client.chat.completions.create(
            model="qwen3-omni-flash",
            messages=[
                {
                    "role": "system",
                    "content": get_audio_understanding_system_prompt(question),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_audio",
                            "input_audio": {"data": audio_url, "format": audio_type},
                        },
                        {"type": "text", "text": "请按照要求返回 JSON 结果。"},
                    ],
                },
            ],
            modalities=["text"],
        )

        result_text = completion.choices[0].message.content
        logger.info(f"音频理解成功，结果长度: {len(result_text)}")
        logger.debug(f"音频理解结果(JSON): {result_text[:200]}...")

        # 尝试解析 JSON，处理可能的 markdown 代码块包裹
        try:
            # 移除可能的 markdown 代码块标记
            cleaned_text = result_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            # 解析 JSON
            result_dict = json.loads(cleaned_text)
            # 转换为 Pydantic 模型
            result = AudioUnderstandingResult.model_validate(result_dict)
            logger.info(
                f"音频理解结果解析成功: match={result.match}, "
                f"recognized_text长度={len(result.analysis)}"
            )
            return result

        except json.JSONDecodeError as e:
            logger.error(f"JSON 解析失败: {e}, 原始结果: {result_text[:500]}")
            raise ValueError(f"音频理解返回的 JSON 格式错误: {str(e)}")
        except Exception as e:
            logger.error(f"结果模型验证失败: {e}, 原始结果: {result_text[:500]}")
            raise ValueError(f"音频理解结果验证失败: {str(e)}")

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"音频理解失败: {e}", exc_info=True)
        raise ValueError(f"音频理解失败: {str(e)}")
