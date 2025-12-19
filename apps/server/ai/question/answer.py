import json
from typing import Optional

from loguru import logger
from langchain_core.output_parsers import JsonOutputParser
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Question
from shared.core.schema import AnswerAnalysisSchema
from shared.provider import get_provider
from shared.services.prompt import PromptService


async def analyze_text_answer(
    question: Question, text_answer: str, db: Optional[AsyncSession] = None
) -> AnswerAnalysisSchema:
    """分析题目文本答案是否正确

    Args:
        question: 题目对象
        text_answer: 学生答案
        db: 数据库会话，用于动态加载提示词
    """
    logger.info(f"开始分析答题情况: content_length={len(question.content)}, text_answer={text_answer}")

    # 创建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=AnswerAnalysisSchema)

    # 使用 PromptService 获取 prompt
    prompt = await PromptService.get_answer_analyze_prompt(db=db, format_instructions=parser.get_format_instructions())

    # 使用 provider 调用
    provider = get_provider()
    result = provider.invoke_chain(
        prompt=prompt,
        parser=parser,
        prompt_input={
            "content": question.content,
            "options": question.options if question.options else "无",
            "knowledge": question.knowledge if question.knowledge else "无",
            "question_answer": question.answer,
            "student_answer": text_answer,
        },
    )

    # 验证结果
    if not isinstance(result, dict):
        raise ValueError(f"LLM 返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 解析结果
    return AnswerAnalysisSchema.model_validate(result)


async def analyze_audio_answer(
    question: Question, audio_url: str, db: Optional[AsyncSession] = None
) -> AnswerAnalysisSchema:
    """分析题目音频答案是否正确

    Args:
        question: 题目对象
        audio_url: 音频 URL
        db: 数据库会话，用于动态加载提示词
    """
    logger.info(f"开始语音答案分析，音频地址: {audio_url}, 问题: {question.content[:100]}...")

    # 使用 provider 获取 MultiModalConversation 客户端
    provider = get_provider()
    MultiModalConversation = provider.get_provider_client()

    # 构建系统提示词（暂时使用硬编码，后续可以改为从 PromptService 加载）
    system_prompt = f"""你是一个英语口语评估助手，需要对学生的录音进行理解和分析。

你必须完成以下任务（所有任务都必须执行，不得省略）：
1. 先"准确转写"音频中用户说的内容，尽量还原原句（text）
2. 判断学生说的内容与题目要求（question）是否匹配（match 字段，true/false）
3. 生成一段完整的分析文本（analysis），其中需要同时包含：
   - 原因说明：为什么匹配 / 不匹配，具体问题出在哪（内容、语法、发音、语调等）
   - 改进建议：学生可以如何改进（给出 1-3 条可操作性强的建议）

题目要求：
{question.content}

重要要求：
- 输出内容的对象是学生，请使用温和鼓励的语气
- 必须先完整解析和转写用户说的内容，而不是只判断对错
- 必须始终返回 JSON 格式，且字段必须为：
  - text: string（语音识别的文本）
  - match: boolean（是否匹配题目要求）
  - analysis: string（同时包含原因说明和改进建议）
- 不要在 JSON 之外输出任何多余文字（如解释、前后缀等）"""

    messages = [
        {"role": "system", "content": [{"text": system_prompt}]},
        {
            "role": "user",
            "content": [
                {"audio": audio_url},
                {"text": "请按照要求返回 JSON 结果。"},
            ],
        },
    ]

    try:
        response = MultiModalConversation.call(
            api_key=provider.api_key,
            model="qwen3-omni-flash",
            messages=messages,
            result_format="message",
        )

        if response.status_code != 200:
            logger.error(f"音频理解失败，任务 ID: {response.request_id}, 错误信息: {response.message}")
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        # 提取响应文本
        content = response.output.choices[0].message.content
        if isinstance(content, list) and len(content) > 0:
            result_text = content[0].get("text", "")
        elif isinstance(content, str):
            result_text = content
        else:
            result_text = str(content)

        logger.info(f"音频理解成功，结果长度: {len(result_text)}")
        logger.debug(f"音频理解结果(JSON): {result_text[:200]}...")

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
        result_dict["audio_url"] = audio_url  # 添加音频 URL 以便追踪

        # 转换为 Pydantic 模型
        result = AnswerAnalysisSchema.model_validate(result_dict)
        logger.info(f"音频理解结果解析成功: match={result.match}, " f"recognized_text长度={len(result.analysis)}")
        return result

    except json.JSONDecodeError as e:
        result_text_str = result_text[:500] if "result_text" in locals() else "N/A"
        logger.error(f"JSON 解析失败: {e}, 原始结果: {result_text_str}")
        raise ValueError(f"音频理解返回的 JSON 格式错误: {str(e)}")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"音频理解失败: {e}", exc_info=True)
        raise ValueError(f"音频理解失败: {str(e)}")
