import json
import dashscope
from loguru import logger
from openai import OpenAI
from pydantic import BaseModel, Field
from core.settings import envs
from shared.services.prompt import PromptService


class AudioUnderstandingResult(BaseModel):
    """音频理解结果模型"""

    recognized_text: str = Field(description="用户说的内容（转写文本）")
    match: bool = Field(description="是否匹配题目要求")
    analysis: str = Field(
        description="综合分析文本（同时包含原因说明和改进建议）"
    )

    model_config = {"extra": "forbid"}


class AliyunAIService:

    client = OpenAI(
        api_key=envs.AI_PLATFORM_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    @staticmethod
    def audio_understanding(
        audio_url: str, audio_type: str, question: str
    ) -> AudioUnderstandingResult:
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
        system_prompt = f"""你是一个英语口语评估助手，需要对学生的录音进行理解和分析。

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

        try:
            completion = AliyunAIService.client.chat.completions.create(
                model="qwen3-omni-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_audio",
                                "input_audio": {
                                    "data": audio_url,
                                    "format": audio_type,
                                },
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

    @staticmethod
    def asr(file_path: str, language: str = "en"):
        logger.info(f"开始语音识别，文件地址: {file_path}, 语言: {language}")
        audio_file_path = f"file://{file_path}"
        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-asr-flash",
            messages=[{"role": "user", "content": [{"audio": audio_file_path}]}],
            result_format="message",
            asr_options={"language": language, "enable_itn": True},
        )

        if response.status_code != 200:
            logger.error(
                f"语音识别失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
            )
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        # 处理不同的响应格式
        try:
            content = response.output.choices[0].message.content[0].get("text")
            logger.info(
                f"语音识别成功，任务 ID: {response.request_id}, 识别结果: {content[:100]}..."
            )
            return content
        except Exception as e:
            logger.error(f"解析 ASR 响应失败: {e}, 响应内容: {response.output}")
            raise ValueError(f"语音识别响应格式错误: {str(e)}")

    @staticmethod
    def tts(text: str, voice: str = "Elias", language: str = "English"):
        logger.info(f"开始文本转语音，文本长度: {len(text)}, 语音: {voice}, 语言: {language}")
        logger.debug(f"文本内容: {text[:200]}...")

        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-tts-flash",
            text=text,
            voice=voice,
            language_type=language,
            stream=False,
        )

        logger.info(response)

        if response.status_code != 200:
            logger.error(
                f"文本转语音失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
            )
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        audio_url = response.output.audio.url
        logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")
        return audio_url

    @staticmethod
    def generate_image(
        text: str, width: int = None, height: int = None, optimize_prompt: bool = True
    ):
        """
        生成图片

        Args:
            text: 问题内容或图片生成提示词
            width: 图片宽度
            height: 图片高度
            optimize_prompt: 是否使用 LLM 优化提示词（默认 True）

        Returns:
            图片 URL
        """
        # 如果启用提示词优化，使用提示词优化服务
        if optimize_prompt:
            logger.info(f"开始优化图片生成提示词，原始文本长度: {len(text)}")
            image_prompt = PromptService.optimize_image_prompt(text)
            logger.info(f"提示词优化完成，优化后长度: {len(image_prompt)}")
            logger.debug(f"优化后的提示词: {image_prompt[:200]}...")
        else:
            # 直接使用传入的文本作为提示词
            image_prompt = text
            logger.info(f"使用原始提示词，长度: {len(image_prompt)}")

        size_str = f"{width}*{height}" if width and height else "默认"
        logger.info(f"开始生成图片，尺寸: {size_str}, 提示词长度: {len(image_prompt)}")

        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen-image-plus",
            messages=[{"role": "user", "content": [{"text": image_prompt}]}],
            result_format="message",
            prompt_extend=True,
            negative_prompt="",
            stream=False,
            size=f"{width}*{height}" if width and height else None,
        )

        logger.info(response)
        if response.status_code != 200:
            logger.error(
                f"图片生成失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
            )
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")
        image_url = response.output.choices[0].message.content[0].get("image")
        logger.info(f"图片生成成功，任务 ID: {response.request_id}, 图片URL: {image_url}")
        return image_url
