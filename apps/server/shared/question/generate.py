from typing import List

from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain.tools import tool
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
from loguru import logger
from pydantic import BaseModel
from shared.core.schema import QuestionSchema
from shared.util import ai, oss, prompt


@tool
def generate_image(image_prompt: str) -> str:
    """图片生成工具，根据提示词生成图片并返回图片URL

    Args:
        image_prompt: 图片生成提示词，描述需要生成的图片内容

    Returns:
        str: 生成的图片URL路径
    """
    image_base64 = ai.image(image_prompt)
    image_path = oss.upload_image(image_base64)
    return image_path


@tool
def generate_audio(text: str) -> str:
    """根据文本生成音频并返回音频URL

    Args:
        text: 需要转换为语音的文本内容

    Returns:
        str: 生成的音频URL路径
    """
    audio_base64 = ai.tts(text)
    audio_path = oss.upload_audio(audio_base64)
    return audio_path


def generate_question_workflow(code: str, input_params: dict):
    """生成题目（原有的简单链式调用方式）"""

    llm = ai.get_langchain_client()
    question_prompt = prompt.get_question_generate_prompt(code)
    parser = JsonOutputParser(pydantic_object=QuestionSchema)

    chain = question_prompt | llm | parser

    result = chain.invoke({**input_params, "format_instructions": parser.get_format_instructions()})
    logger.info(f"生成题目结果: {result}")
    return result


class QuestionSchemaList(BaseModel):
    questions: List[QuestionSchema]


def generate_question_agent(code: str, input_params: dict):
    """
    使用 LangChain create_agent 生成题目，支持工具调用和结构化输出

    该函数使用 create_agent 创建一个智能代理，可以：
    1. 根据题目需求自主决定是否需要生成图片或音频
    2. 调用 generate_image 和 generate_audio 工具生成多媒体资源
    3. 输出符合 QuestionSchema 格式的结构化题目数据

    Args:
        code (str): 题型代码，用于获取对应的提示词模板（如 "choice", "judge" 等）
        input_params (dict): 输入参数，包含以下字段：
            - subject (str): 学科名称
            - grade (int): 年级
            - count (int): 生成题目数量
            - unit_content (str): 单元内容描述
            - 其他题型特定参数

    Returns:
        dict: 结构化的题目数据，符合 QuestionSchema 格式，包含：
            - id: 题目ID
            - question_type_code: 题型代码
            - subject: 科目
            - grade: 年级
            - content: 题目内容（可能包含生成的图片/音频URL）
            - answer: 答案配置
            - difficulty: 难度等级

    Raises:
        ValueError: 当题目生成失败时抛出异常

    Example:
        ```python
        result = generate_question_agent(
            code="choice",
            input_params={
                "subject": "数学",
                "grade": 3,
                "count": 5,
                "unit_content": "第一单元：加减法运算，包含100以内的加减法..."
            }
        )
        # result 将包含生成的题目数据，如果需要配图，agent会自动调用generate_image工具
        ```
    """
    # 初始化 LLM（支持工具调用）
    llm = ai.get_langchain_client()

    # 定义可用工具列表
    tools = [generate_image, generate_audio]

    # 获取题目生成的提示词模板并格式化
    # question_prompt 已经包含了完整的角色定义、任务说明、数据结构、示例等
    # 可以直接作为 system_prompt 使用
    question_prompt_template = prompt.get_question_generate_prompt(code)

    # 创建输出解析器以生成 format_instructions
    # 虽然 response_format 会处理结构化输出，但 prompt 中仍需要 format_instructions
    parser = PydanticOutputParser(pydantic_object=QuestionSchema)

    # 格式化系统提示词，包含 format_instructions
    system_prompt = question_prompt_template.format(
        **input_params, format_instructions=parser.get_format_instructions()
    )

    try:
        # 使用 create_agent 创建 Agent，并指定结构化输出格式
        logger.info(f"开始创建 Agent，code={code}, params={input_params}")

        agent_graph = create_agent(
            model=llm,
            tools=tools,
            system_prompt=system_prompt,  # 直接使用 question_prompt 作为系统提示
            response_format=ToolStrategy(QuestionSchemaList),  # 指定结构化输出格式
            debug=True,  # 启用调试日志
        )

        # 执行 Agent
        # create_agent 返回的是一个 CompiledStateGraph，需要通过 invoke 调用
        # 输入格式为 {"messages": [{"role": "user", "content": "..."}]}
        logger.info("开始执行 Agent 生成题目")

        result = agent_graph.invoke({"messages": [{"role": "user", "content": "请生成题目"}]})

        # 提取结构化输出
        # 当使用 response_format 时，结果会包含在 state 中
        logger.info(f"Agent 执行完成，结果类型: {type(result)}")

        # 从结果中提取最终的消息
        response = result.get("structured_response", [])
        if not response:
            raise ValueError("Agent 未返回任何消息")

        logger.info(f"题目生成成功: {response}")

        return response.questions

    except Exception as e:
        logger.error(f"Agent 执行失败: {e}")
        raise ValueError(f"题目生成失败: {str(e)}")
