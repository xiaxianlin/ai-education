"""答题服务"""

from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from core.database import PracticeSession, PracticeAnswer, PracticeWrongRecord, Question
from student.schema import AnswerQuestionSchema, AnswerResultSchema
from shared.utils.time import now
from core.settings import envs


class AnswerAnalysisResult(BaseModel):
    """答案分析结果模型"""

    is_correct: bool = Field(description="答案是否正确")
    analysis: str = Field(description="分析内容，如果正确则给予鼓励，如果错误则说明原因和知识点")


ANALYSIS_PROMPT = """
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


async def _ai_analysis_answer(
    db: AsyncSession, params: AnswerQuestionSchema, question: Question, text_answer: str
) -> tuple[bool, str]:
    """
    分析学生答题情况，并返回是否正确和分析结果

    Args:
        db: 数据库会话
        params: 答题参数
        question: 题目
        text_answer: 学生答案

    Returns:
        (is_correct, analysis): 是否正确和分析结果
    """
    try:
        # 创建 JSON 输出解析器
        parser = JsonOutputParser(pydantic_object=AnswerAnalysisResult)
        format_instructions = parser.get_format_instructions()

        # 格式化提示词
        analysis_prompt = ANALYSIS_PROMPT.format(
            content=question.content,
            options=question.options if question.options else "无",
            knowledge=question.knowledge if question.knowledge else "无",
            question_answer=question.answer,
            student_answer=text_answer,
            format_instructions=format_instructions,
        )

        # 调用 LLM
        llm = ChatOpenAI(
            model_name="qwen3-max-preview",
            openai_api_base=envs.AI_PLATFORM_URL,
            openai_api_key=envs.AI_PLATFORM_KEY,
            temperature=0.7,
        )

        # 使用 chain 进行调用和解析
        chain = llm | parser
        result = await chain.ainvoke(analysis_prompt)

        # 验证结果
        if not isinstance(result, dict):
            raise ValueError(f"LLM 返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

        # 解析结果
        analysis_result = AnswerAnalysisResult.model_validate(result)
        is_correct = analysis_result.is_correct
        analysis = analysis_result.analysis

        # 如果判断为错误，添加错题记录
        if not is_correct:
            wrong_record = PracticeWrongRecord(
                student_id=params.student_id,
                session_id=params.session_id,
                question_id=params.question_id,
                unit_id=question.unit_id,
                textbook_id=question.textbook_id,
                knowledge=question.knowledge,
                user_answer=text_answer,
                correct_answer=question.answer,
                analysis=analysis,
                time_spent=params.time_spent,
                is_corrected=0,
                corrected_time=0,
                create_time=now(),
                update_time=now(),
            )
            await db.add(wrong_record)
            logger.info(
                f"添加错题记录: student_id={params.student_id}, question_id={params.question_id}, "
                f"session_id={params.session_id}"
            )

        return is_correct, analysis

    except Exception as e:
        logger.error(f"生成答案分析失败: {e}", exc_info=e)
        raise ValueError(f"生成答案分析失败: {str(e)}")


async def submit_answer(db: AsyncSession, student_id: str, params: AnswerQuestionSchema) -> dict:
    """提交答题答案"""
    try:
        # 1. 查询练习会话
        session = await db.scalar(
            select(PracticeSession).where(PracticeSession.id == params.session_id)
        )
        if not session:
            raise ValueError("练习会话不存在")

        if session.student_id != student_id:
            raise ValueError("无权操作此练习")

        # 2. 查询题目信息
        question = await db.scalar(select(Question).where(Question.id == params.question_id))
        if not question:
            raise ValueError("题目不存在")

        # 3. 查询答题记录
        answer_record = await db.scalar(
            select(PracticeAnswer).where(
                PracticeAnswer.session_id == params.session_id,
                PracticeAnswer.question_id == params.question_id,
            )
        )
        if not answer_record:
            raise ValueError("答题记录不存在")

        # 4. 使用传入的文本答案（口语题已在单独接口中完成 ASR 解析）
        text_answer = params.answer

        # 5. 使用 AI 分析答案，判断是否正确并生成分析
        if text_answer != question.answer:
            is_correct, analysis = await _ai_analysis_answer(db, params, question, text_answer)
        else:
            is_correct = True
            analysis = None

        # 6. 更新答题记录
        answer_record.text_answer = text_answer
        answer_record.status = 1 if is_correct else 2
        answer_record.time_spent = params.time_spent
        answer_record.submit_time = now()
        if params.audio_data:
            answer_record.audio_answer = params.audio_data

        # 7. 更新练习会话统计
        session.answer_count += 1
        if is_correct:
            session.correct_count += 1

        session.update_time = now()

        await db.commit()

        logger.info(
            f"答题提交成功: student_id={student_id}, session_id={params.session_id}, "
            f"question_id={params.question_id}, is_correct={is_correct}"
        )

        return AnswerResultSchema(
            is_correct=is_correct,
            correct_answer=question.answer,
            user_answer=text_answer,
            analysis=analysis if not is_correct else None,
        )

    except ValueError:
        raise

    except Exception as e:
        # 发生异常时回滚事务
        await db.rollback()
        logger.error(
            f"答题提交失败: student_id={student_id}, session_id={params.session_id}, "
            f"question_id={params.question_id}, error={str(e)}",
            exc_info=e,
        )
        raise ValueError(f"答题提交失败: {str(e)}")
