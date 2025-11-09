from typing import List, Dict, Any
import requests
import os
from pathlib import Path

from loguru import logger
from pydantic import BaseModel, Field, TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.constants import QUESTION_TYPES, get_question_types
from common.database import Knowledge, Question, Textbook, Unit
from common.settings import envs

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from ai.prompts.question import GENERATE_QUESTION_PROMPT
from ai.services.aliyun import AliyunAIService
from provider.aliyun import AliyunOSS


class QuestionOption(BaseModel):
    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    question_type: str = Field(description="题型")
    question: str = Field(description="题干内容")
    options: List[QuestionOption] = Field(
        description="题目选项列表，非选择题时可为空数组", default=[]
    )
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度，如 简单/中等/较难")
    knowledge: str = Field(description="知识点")


class QuestionGenerationResult(BaseModel):
    questions: List[GeneratedQuestion] = []


async def validate_question_params(unit_id: int, count: int) -> Dict[str, Any]:
    """检查问题生成参数，失败直接退出"""
    if count <= 0:
        raise ValueError("生成题目的数量必须大于 0")

    return {"unit_id": unit_id, "count": count}


async def load_unit_data(db: AsyncSession, unit_id: int) -> Dict[str, Any]:
    """加载单元相关数据"""
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("课程单元不存在")

    textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    knowledge_rows = await db.scalars(
        select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id)
    )
    knowledge_list = knowledge_rows.all()

    knowledge_lines = []
    knowledge_names = []
    for item in knowledge_list:
        snippet = item.content.strip() if item.content else ""
        if len(snippet) > 200:
            snippet = snippet[:200] + "..."
        knowledge_lines.append(f"- {item.name}: {snippet}")
        knowledge_names.append(item.name)

    knowledge_text = "\n".join(knowledge_lines) if knowledge_lines else "(未提供知识点)"
    knowledge_names = "、".join(knowledge_names) if knowledge_names else ""

    return {
        "unit": unit,
        "textbook": textbook,
        "knowledge_text": knowledge_text,
        "knowledge_names": knowledge_names,
    }


async def generate_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """根据传入参数生成对应的 prompt"""
    unit = params["unit"]
    textbook = params["textbook"]
    knowledge_text = params["knowledge_text"]
    count = params["count"]

    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", GENERATE_QUESTION_PROMPT),
        ]
    )

    # 根据科目和年级获取对应的题型
    question_types = get_question_types(textbook.subject, textbook.grade)
    
    prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types,
        "unit_name": unit.name,
        "unit_summary": unit.content or "",
        "knowledge_text": knowledge_text,
        "count": count,
        "format_instructions": format_instructions,
    }

    return {
        **params,
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }


PROMPT_OPTIMIZATION_INSTRUCTION = """
你是一名专业的 Prompt 工程专家。请分析并优化以下 Prompt，使其：
1. 更加清晰明确，减少歧义
2. 更好地引导模型生成高质量题目
3. 确保所有要求都被明确表达
4. 优化语言表达，使其更专业、更易理解
5. 保持原有的核心要求和格式要求不变

请直接返回优化后的 Prompt 内容，不要添加任何解释或说明。
"""


async def optimize_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """优化生成的 prompt，使其更清晰、更有效"""
    logger.info("开始优化 prompt")
    
    prompt_input = params["prompt_input"]
    
    # 获取原始 prompt 模板的文本内容（保留变量占位符）
    original_prompt_text = GENERATE_QUESTION_PROMPT
    
    # 为了优化效果更好，先填充变量获取完整内容用于优化
    filled_prompt_text = GENERATE_QUESTION_PROMPT.format(**prompt_input)
    
    # 创建优化 prompt，要求保留变量占位符
    optimization_instruction = PROMPT_OPTIMIZATION_INSTRUCTION + "\n\n重要：优化后的 Prompt 必须保留所有变量占位符（如 {subject}、{grade}、{count} 等），不要替换为具体值。"
    
    optimization_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                optimization_instruction,
            ),
            ("human", "请优化以下 Prompt（保留所有变量占位符）：\n\n{original_prompt}\n\n注意：优化后的 Prompt 必须保留所有 {{variable}} 格式的占位符。"),
        ]
    )
    
    # 调用 LLM 优化 prompt
    llm = ChatOpenAI(
        model_name="qwen-plus-latest",
        temperature=0.3,  # 使用较低温度以确保优化的一致性
        openai_api_key=envs.AI_PLATFORM_KEY,
        openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    
    optimization_chain = optimization_prompt | llm
    optimized_text = optimization_chain.invoke({"original_prompt": filled_prompt_text})
    
    # 提取优化后的文本（去除可能的 markdown 代码块标记）
    optimized_text_str = optimized_text.content.strip()
    if optimized_text_str.startswith("```"):
        # 移除 markdown 代码块标记
        lines = optimized_text_str.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        optimized_text_str = "\n".join(lines).strip()
    
    logger.info(f"Prompt 优化完成，原始长度: {len(filled_prompt_text)}, 优化后长度: {len(optimized_text_str)}")
    
    # 使用优化后的 prompt 文本创建新的 prompt template
    # 注意：优化后的文本应该包含变量占位符，这样可以在后续调用时填充
    optimized_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", optimized_text_str),
        ]
    )
    
    return {
        **params,
        "prompt": optimized_prompt,
        "original_prompt_text": filled_prompt_text,
        "optimized_prompt_text": optimized_text_str,
    }


async def call_llm(params: Dict[str, Any]) -> Dict[str, Any]:
    """调用大模型结构化输出内容，内容为数组"""
    prompt = params["prompt"]
    prompt_input = params["prompt_input"]
    parser = params["parser"]

    llm = ChatOpenAI(
        model_name="qwen-plus-latest",
        temperature=0.7,
        openai_api_key=envs.AI_PLATFORM_KEY,
        openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    chain = prompt | llm | parser
    result = chain.invoke(prompt_input)

    result = QuestionGenerationResult.model_validate(result)

    return {
        **params,
        "generated_questions": result.questions,
    }


async def convert_to_question_objects(params: Dict[str, Any]) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流"""
    generated_questions: List[GeneratedQuestion] = params["generated_questions"]
    textbook = params["textbook"]
    unit = params["unit"]

    questions: List[Question] = []
    image_questions: List[Question] = []
    audio_questions: List[Question] = []
    text_questions: List[Question] = []

    # 根据科目和年级获取对应的题型
    question_types = get_question_types(textbook.subject, textbook.grade)
    
    for item in generated_questions:
        question_type = item.question_type
        if question_type not in question_types:
            logger.warning(
                f"生成的题型 {question_type} 不在预期列表中（科目: {textbook.subject}, 年级: {textbook.grade}），"
                f"将使用默认题型 {question_types[0]}"
            )
            question_type = question_types[0]

        question = Question(
            subject=textbook.subject,
            grade=textbook.grade,
            type=question_type,
            content=item.question,
            options=TypeAdapter(List[QuestionOption])
            .dump_json(item.options, by_alias=True, exclude_none=True)
            .decode(),
            answer=item.answer,
            difficulty=item.difficulty,
            textbook_id=textbook.id,
            unit_id=unit.id,
            knowledge=item.knowledge if item.knowledge else "",
        )

        questions.append(question)

        # 根据问题类型分流
        if question_type == "辨识题":
            image_questions.append(question)
        elif question_type in ["跟读题", "听力题"]:
            audio_questions.append(question)
        else:
            text_questions.append(question)

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    return {
        **params,
        "questions": questions,
        "image_questions": image_questions,
        "audio_questions": audio_questions,
        "text_questions": text_questions,
    }


async def generate_images(params: Dict[str, Any]) -> Dict[str, Any]:
    """图片生成节点 - 为辨识题生成图片"""
    image_questions: List[Question] = params.get("image_questions", [])

    for question in image_questions:
        try:
            # 生成图片
            image_url = AliyunAIService.generate_image(
                text=question.content, width=1024, height=1024
            )
            # 将图片URL保存到临时字段，后续上传时使用
            question._temp_image_url = image_url
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成图片失败: {e}")
            question._temp_image_url = None

    return params


async def generate_audio(params: Dict[str, Any]) -> Dict[str, Any]:
    """语音生成节点 - 为跟读题和听力题生成语音"""
    audio_questions: List[Question] = params.get("audio_questions", [])

    for question in audio_questions:
        try:
            # 生成语音，使用题目内容作为文本
            audio_url = AliyunAIService.tts(
                text=question.content, voice="Cherry", language="Chinese"
            )
            # 将音频URL保存到临时字段，后续上传时使用
            question._temp_audio_url = audio_url
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成语音失败: {e}")
            question._temp_audio_url = None

    return params


async def download_file(url: str, file_path: str) -> None:
    """下载文件到本地"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


async def upload_files(params: Dict[str, Any]) -> Dict[str, Any]:
    """文件上传节点 - 将图片和音频上传到 OSS"""
    image_questions: List[Question] = params.get("image_questions", [])
    audio_questions: List[Question] = params.get("audio_questions", [])
    unit_id = params["unit_id"]

    oss = AliyunOSS()
    tmp_dir = Path(envs.TMP_DIR)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    # 上传图片
    for idx, question in enumerate(image_questions):
        if hasattr(question, "_temp_image_url") and question._temp_image_url:
            try:
                # 下载图片
                image_path = tmp_dir / f"question_{unit_id}_{idx}_image.jpg"
                await download_file(question._temp_image_url, str(image_path))

                # 读取文件内容
                with open(image_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/images/{idx}.jpg"
                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(image_path)
            except Exception as e:
                logger.error(f"上传图片失败: {e}")
                question.resource = None

    # 上传音频
    for idx, question in enumerate(audio_questions):
        if hasattr(question, "_temp_audio_url") and question._temp_audio_url:
            try:
                # 下载音频
                audio_path = tmp_dir / f"question_{unit_id}_{idx}_audio.mp3"
                await download_file(question._temp_audio_url, str(audio_path))

                # 读取文件内容
                with open(audio_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/audio/{idx}.mp3"
                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(audio_path)
            except Exception as e:
                logger.error(f"上传音频失败: {e}")
                question.resource = None

    return params


async def upload_questions(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    """数据更新节点 - 更新已保存的问题（如 resource 字段等）"""
    from utils.time import now

    # 所有问题已在 convert_data 节点中保存，这里只需要更新（如 resource 字段）
    image_questions: List[Question] = params.get("image_questions", [])
    audio_questions: List[Question] = params.get("audio_questions", [])
    text_questions: List[Question] = params.get("text_questions", [])

    all_questions = image_questions + audio_questions + text_questions

    if all_questions:
        # 更新所有问题的 update_time（resource 字段已在 upload_files 节点中设置）
        for question in all_questions:
            question.update_time = now()

        await db.commit()
        logger.info(
            f"成功更新 {len(all_questions)} 道题目（图片题：{len(image_questions)}，音频题：{len(audio_questions)}，文本题：{len(text_questions)}）"
        )
    else:
        logger.info("没有需要更新的题目")

    return {
        **params,
        "saved_questions": all_questions,
    }


async def generate_question_by_unit(db: AsyncSession, unit_id: int, count: int) -> List[Question]:
    """根据单元 ID 生成指定数量的题目并入库（旧接口，保持兼容）"""
    from ai.graphs.generate_question import generate_question_graph

    result = await generate_question_graph(db, unit_id, count)
    return result.get("saved_questions", [])
