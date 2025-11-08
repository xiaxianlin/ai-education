from typing import List, Dict, Any
import requests
import os
from pathlib import Path

from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.constants import QUESTION_TYPES
from common.database import Knowledge, Question, Textbook, Unit
from common.settings import envs

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from common.schema import QuestionGenerationResult, QuestionOption, GeneratedQuestion
from ai.prompts.question import GENERATE_QUESTION_PROMPT
from ai.services.aliyun import AliyunAIService
from provider.aliyun import AliyunOSS


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
    for item in knowledge_list:
        snippet = item.content.strip() if item.content else ""
        if len(snippet) > 200:
            snippet = snippet[:200] + "..."
        knowledge_lines.append(f"- {item.name}: {snippet}")

    knowledge_text = "\n".join(knowledge_lines) if knowledge_lines else "(未提供知识点)"

    return {
        "unit": unit,
        "textbook": textbook,
        "knowledge_text": knowledge_text,
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

    prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": QUESTION_TYPES,
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
    direct_questions: List[Question] = []

    for item in generated_questions:
        question_type = item.question_type
        if question_type not in QUESTION_TYPES:
            logger.warning(f"生成的题型 {question_type} 不在预期列表中，将使用默认题型")
            question_type = QUESTION_TYPES[0]

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
            knowledge_id=None,
        )

        questions.append(question)

        # 根据问题类型分流
        if question_type == "辨识题":
            image_questions.append(question)
        elif question_type in ["跟读题", "听力题"]:
            audio_questions.append(question)
        else:
            direct_questions.append(question)

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    return {
        **params,
        "questions": questions,
        "image_questions": image_questions,
        "audio_questions": audio_questions,
        "direct_questions": direct_questions,
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


async def save_questions(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    """数据存储节点 - 将问题保存到数据库"""
    # 合并所有问题：直接存储的、图片的、音频的
    direct_questions: List[Question] = params.get("direct_questions", [])
    image_questions: List[Question] = params.get("image_questions", [])
    audio_questions: List[Question] = params.get("audio_questions", [])

    all_questions = direct_questions + image_questions + audio_questions

    if all_questions:
        db.add_all(all_questions)
        await db.commit()
        logger.info(f"成功保存 {len(all_questions)} 道题目到数据库")
    else:
        logger.warning("没有需要保存的题目")

    return {
        **params,
        "saved_questions": all_questions,
    }


async def generate_question_by_unit(db: AsyncSession, unit_id: int, count: int) -> List[Question]:
    """根据单元 ID 生成指定数量的题目并入库（旧接口，保持兼容）"""
    from ai.graphs.generate_question import generate_question_graph

    result = await generate_question_graph(db, unit_id, count)
    return result.get("saved_questions", [])
