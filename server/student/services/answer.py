"""答题服务"""

import os
from typing import Optional
from pathlib import Path
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, PracticeAnswer, PracticeWrongRecord, Question
from shared.services.aliyun import AliyunAIService
from shared.provider.aliyun import AliyunOSS
from shared.utils.time import now
from core.settings import envs


async def submit_answer(
    db: AsyncSession,
    student_id: str,
    session_id: int,
    question_id: int,
    answer: str,
    time_spent: int,
    is_video_answer: bool = False,
    audio_bytes: Optional[bytes] = None,
) -> dict:
    """
    提交答题答案

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID
        question_id: 题目ID
        answer: 答案（文本答案或识别前的原始答案）
        time_spent: 答题耗时（秒）
        is_video_answer: 是否为音频回答
        audio_bytes: 音频字节数据

    Returns:
        答题结果
    """
    try:
        # 1. 查询练习会话
        session = await db.scalar(
            select(PracticeSession).where(PracticeSession.id == session_id)
        )
        if not session:
            raise ValueError("练习会话不存在")

        if session.student_id != student_id:
            raise ValueError("无权操作此练习")

        # 2. 查询题目信息
        question = await db.scalar(select(Question).where(Question.id == question_id))
        if not question:
            raise ValueError("题目不存在")

        # 3. 查询答题记录
        answer_record = await db.scalar(
            select(PracticeAnswer).where(
                PracticeAnswer.session_id == session_id,
                PracticeAnswer.question_id == question_id,
            )
        )
        if not answer_record:
            raise ValueError("答题记录不存在")

        # 4. 处理音频答案（如果是音频题）
        text_answer = answer

        if is_video_answer and audio_bytes:
            try:
                # 创建临时文件保存音频
                temp_file = None
                try:
                    # 创建临时目录
                    tmp_dir = Path(envs.TMP_DIR) / "answers"
                    tmp_dir.mkdir(parents=True, exist_ok=True)

                    # 创建临时文件
                    temp_file = (
                        tmp_dir / f"{student_id}_{session_id}_{question_id}_{now()}.mp3"
                    )

                    # 写入音频数据
                    with open(temp_file, "wb") as f:
                        f.write(audio_bytes)

                    logger.info(f"音频临时文件创建成功: {temp_file}")

                    # 上传到OSS获取URL用于ASR识别
                    oss = AliyunOSS()
                    oss_path = f"temp/answers/{student_id}_{session_id}_{question_id}.mp3"
                    oss.upload(oss_path, audio_bytes)

                    # 获取音频访问URL
                    audio_url = oss.get_access_url(oss_path, days=1)

                    # ASR 语音识别
                    text_answer = AliyunAIService.asr(audio_url, language="zh")
                    logger.info(f"ASR识别结果: {text_answer}")

                    # 删除临时OSS文件
                    oss.delete(oss_path)

                finally:
                    # 清理临时文件
                    if temp_file and temp_file.exists():
                        os.remove(temp_file)
                        logger.info(f"临时文件已删除: {temp_file}")

            except Exception as e:
                logger.error(f"音频处理失败: {e}")
                raise ValueError(f"音频处理失败: {str(e)}")

        # 5. 判断答案是否正确
        is_correct = check_answer(text_answer, question.answer, question.type)

        # 6. 更新答题记录
        answer_record.text_answer = text_answer
        answer_record.status = 1 if is_correct else 2
        answer_record.time_spent = time_spent
        answer_record.submit_time = now()
        if audio_bytes:
            answer_record.audio_answer = audio_bytes

        # 7. 更新练习会话统计
        session.answer_count += 1
        if is_correct:
            session.correct_count += 1

        # 如果是第一次答题，更新开始时间
        if session.answer_count == 1:
            session.start_time = now()

        # 如果所有题目都已完成，更新状态为已完成
        if session.answer_count >= session.question_count:
            session.status = 2
            session.end_time = now()
        elif session.status == 0:
            # 如果还没开始，更新状态为进行中
            session.status = 1

        session.update_time = now()

        # 8. 如果答错了，添加错题记录并生成分析
        analysis = None
        if not is_correct:
            # 先生成错题分析
            try:
                analysis = await generate_wrong_answer_analysis(
                    question=question,
                    user_answer=text_answer,
                    correct_answer=question.answer,
                )
                logger.info(f"错题分析生成成功: question_id={question_id}")
            except Exception as e:
                logger.error(f"生成错题分析失败: {e}")
                analysis = "暂时无法生成错题分析，请稍后重试。"

            # 创建错题记录，包含分析结果
            wrong_record = PracticeWrongRecord(
                student_id=student_id,
                question_id=question_id,
                session_id=session_id,
                unit_id=question.unit_id,
                knowledge=question.knowledge,
                textbook_id=question.textbook_id,
                user_answer=text_answer,
                correct_answer=question.answer,
                analysis=analysis,  # 存储错题分析
                time_spent=time_spent,  # 答题耗时
                is_corrected=0,
                corrected_time=0,
                create_time=now(),
                update_time=now(),
            )
            db.add(wrong_record)

        await db.commit()

        logger.info(
            f"答题提交成功: student_id={student_id}, session_id={session_id}, "
            f"question_id={question_id}, is_correct={is_correct}"
        )

        return {
            "is_correct": is_correct,
            "correct_answer": question.answer,
            "user_answer": text_answer,
            "analysis": analysis if not is_correct else None,
            "session_progress": {
                "answer_count": session.answer_count,
                "correct_count": session.correct_count,
                "total_count": session.question_count,
                "status": session.status,
            },
        }
    
    except ValueError:
        # 业务错误直接抛出，不需要回滚
        raise
    
    except Exception as e:
        # 发生异常时回滚事务
        await db.rollback()
        logger.error(
            f"答题提交失败: student_id={student_id}, session_id={session_id}, "
            f"question_id={question_id}, error={str(e)}",
            exc_info=e
        )
        raise ValueError(f"答题提交失败: {str(e)}")


def check_answer(user_answer: str, correct_answer: str, question_type: str) -> bool:
    """
    判断答案是否正确

    Args:
        user_answer: 用户答案
        correct_answer: 正确答案
        question_type: 题目类型

    Returns:
        是否正确
    """
    # 标准化答案（去除空格、转小写）
    user_answer_normalized = user_answer.strip().lower()
    correct_answer_normalized = correct_answer.strip().lower()

    # 选择题：精确匹配
    if question_type in ["single_choice", "multiple_choice"]:
        return user_answer_normalized == correct_answer_normalized

    # 判断题：精确匹配
    if question_type == "true_false":
        return user_answer_normalized == correct_answer_normalized

    # 填空题：包含匹配（可能有多个答案，用|分隔）
    if question_type == "fill_blank":
        # 如果正确答案包含多个可能的答案（用|分隔）
        possible_answers = [
            ans.strip().lower() for ans in correct_answer_normalized.split("|")
        ]
        return user_answer_normalized in possible_answers

    # 口语题、问答题：模糊匹配（包含关键词即可）
    if question_type in ["oral", "short_answer"]:
        # 简单的关键词匹配
        keywords = [
            kw.strip()
            for kw in correct_answer_normalized.split()
            if len(kw.strip()) > 1
        ]
        if not keywords:
            # 如果没有关键词，使用完全匹配
            return user_answer_normalized == correct_answer_normalized

        # 检查用户答案是否包含至少50%的关键词
        matched_keywords = sum(1 for kw in keywords if kw in user_answer_normalized)
        return matched_keywords >= len(keywords) * 0.5

    # 默认：完全匹配
    return user_answer_normalized == correct_answer_normalized


async def generate_wrong_answer_analysis(
    question: Question, user_answer: str, correct_answer: str
) -> str:
    """
    生成错题分析

    Args:
        question: 题目对象
        user_answer: 用户答案
        correct_answer: 正确答案

    Returns:
        错题分析文本
    """
    try:
        # 构建分析提示词
        analysis_prompt = f"""
请分析以下错题：

题目：{question.content}
选项：{question.options if question.options else "无"}
知识点：{question.knowledge}
正确答案：{correct_answer}
学生答案：{user_answer}

请提供简洁的错题分析，包括：
1. 学生为什么会答错（可能的原因）
2. 相关知识点解释
3. 如何避免类似错误

要求：
- 语言简洁明了，适合学生阅读
- 字数控制在200字以内
- 重点突出知识点和解题思路
"""

        # 调用AI生成分析
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(
            model="qwen-plus",
            openai_api_base=envs.AI_PLATFORM_URL,
            openai_api_key=envs.AI_PLATFORM_KEY,
            temperature=0.7,
        )

        response = llm.invoke(analysis_prompt)
        analysis = response.content.strip()

        logger.info(f"错题分析生成成功: question_id={question.id}")
        return analysis

    except Exception as e:
        logger.error(f"生成错题分析失败: {e}")
        return "暂时无法生成错题分析，请稍后重试。"
