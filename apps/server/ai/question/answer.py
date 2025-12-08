import json

from loguru import logger
from openai import OpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from shared.core.settings import envs
from shared.core.database import Question
from ai.utils.llm import get_chat_client
from ai.schema import TextAnswerAnalysisResponse, AudioAnswerAnalysisResponse

TEXT_ANALYSIS_PROMPT = """
请分析以下学生答题情况：

题目：{content}
选项：{options}
知识点：{knowledge}
参考答案：{question_answer}
学生答案：{student_answer}

请按照以下步骤进行分析：

第一步：判断答案正确性
请仔细判断学生的答案是否正确。判断标准：
- 如果答案在语义、逻辑、数值上与参考答案一致，即使表达方式不同，也应判定为正确
- 考虑答案的格式差异（如：小数、分数、百分数的不同表示方式）
- 对于选择题，如果学生选择了与参考答案等价的选项，应判定为正确
- 对于填空题或计算题，如果数值正确但单位或格式略有不同，需要根据题目要求判断

第二步：给出分析结果
根据判断结果，提供相应的分析：

【如果答案正确】
1. 肯定学生的答案，给予鼓励
2. 简要说明答案的正确性
3. 可以适当补充相关知识点或解题思路的进一步说明
4. 字数控制在100-150字

【如果答案错误】
1. 明确指出答案错误
2. 分析学生为什么会答错（可能的原因，如：概念理解错误、计算失误、审题不清等）
3. 解释相关知识点，帮助学生理解正确思路
4. 提供如何避免类似错误的建议
5. 字数控制在200字以内

要求：
- 语言简洁明了，适合学生阅读
- 语气温和鼓励，避免打击学生积极性
- 重点突出知识点和解题思路
- 如果答案正确，要给予肯定和鼓励
- 如果答案错误，要明确指出问题并提供改进建议

请严格按照以下JSON格式返回结果：
{format_instructions}
"""


async def analyze_text_answer(question: Question, text_answer: str) -> TextAnswerAnalysisResponse:
    """分析题目文本答案是否正确"""

    logger.info(
        f"开始分析答题情况: content_length={len(question.content)}, text_answer={text_answer}"
    )

    # 创建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=TextAnswerAnalysisResponse)

    # 格式化提示词
    analysis_prompt = TEXT_ANALYSIS_PROMPT.format(
        content=question.content,
        options=question.options if question.options else "无",
        knowledge=question.knowledge if question.knowledge else "无",
        question_answer=question.answer,
        student_answer=text_answer,
        format_instructions=parser.get_format_instructions(),
    )

    prompt = ChatPromptTemplate.from_messages([("user", analysis_prompt)])
    client = get_chat_client()
    chain = prompt | client | parser
    result = await chain.ainvoke({})

    # 验证结果
    if not isinstance(result, dict):
        raise ValueError(f"LLM 返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 解析结果
    analysis_result = TextAnswerAnalysisResponse.model_validate(result)

    return analysis_result


AUDIO_ANALYSIS_PROMPT = """你是一个英语口语评估助手，需要对学生的录音进行理解和分析。

你必须完成以下任务（所有任务都必须执行，不得省略）：
1. 先"准确转写"音频中用户说的内容，尽量还原原句（text）
2. 判断学生说的内容与题目要求（question）是否匹配（match 字段，true/false）
3. 生成一段完整的分析文本（analysis），其中需要同时包含：
   - 原因说明：为什么匹配 / 不匹配，具体问题出在哪（内容、语法、发音、语调等）
   - 改进建议：学生可以如何改进（给出 1-3 条可操作性强的建议）

题目要求：
{content}

重要要求：
- 输出内容的对象是学生，请使用温和鼓励的语气
- 必须先完整解析和转写用户说的内容，而不是只判断对错
- 必须始终返回 JSON 格式，且字段必须为：
  - text: string（语音识别的文本）
  - match: boolean（是否匹配题目要求）
  - analysis: string（同时包含原因说明和改进建议）
- 不要在 JSON 之外输出任何多余文字（如解释、前后缀等）"""


async def analyze_audio_answer(
    question: Question, audio_url: str, audio_type: str
) -> AudioAnswerAnalysisResponse:
    """分析题目音频答案是否正确"""
    logger.info(f"开始语音答案分析，音频地址: {audio_url}, 问题: {question[:100]}...")

    client = OpenAI(
        api_key=envs.AI_PLATFORM_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    messages = (
        [
            {
                "role": "system",
                "content": TEXT_ANALYSIS_PROMPT.format(
                    content=question.content,
                ),
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
    )
    try:
        completion = client.chat.completions.create(
            model="qwen3-omni-flash", messages=messages, modalities=["text"]
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
            result = AudioAnswerAnalysisResponse.model_validate(result_dict)
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
