"""
练习会话生成模块

练习会话生成流程：
1. 生成会话 ID (UUID v4)，初始化练习会话记录，状态为生成中
2. 检查参数信息：db、学生 ID；能力练习检查原子能力 code (数组类型)；单元练习检查单元 ID
3. 构建题型选择 prompt，根据不同类型的练习生成不同的题型选择 prompt
4. 调用大模型选择题型
5. 根据题型列表调用题目生成并行生成题目，并归拢题目
6. 预生成练习答题数据，并启用题目
7. 更新练习会话状态为已完成并返回会话 ID
8. 如果生成失败，删除所有练习会话相关的数据

练习类型：
- ability_practice: 能力练习 - 基于原子能力 code 列表生成
- unit_practice: 单元练习 - 基于单元 ID 生成
"""

import asyncio
from typing import Any, Dict, List, Optional

import pendulum
from loguru import logger
from shared.core.database import (
    AbilityAtomic,
    PracticeSession,
    PracticeSessionAnswer,
    Question,
    QuestionType,
    Textbook,
    Unit,
    generate_session_id,
)
from shared.provider import get_provider
from shared.worker import Executor, submit_task
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .prompt import SELECT_QUESTION_TYPE_PROMPT, SELECT_QUESTION_TYPE_SYSTEM_PROMPT

# 练习类型常量
PRACTICE_TYPE_ABILITY = "ability_practice"
PRACTICE_TYPE_UNIT = "unit_practice"

VALID_PRACTICE_TYPES = [PRACTICE_TYPE_ABILITY, PRACTICE_TYPE_UNIT]


# ==================== 参数验证 ====================


async def validate_ability_practice_params(
    db: AsyncSession,
    student_id: str,
    ability_codes: List[str],
    subject: str,
    grade: int,
) -> Dict[str, Any]:
    """验证能力练习参数

    Args:
        db: 数据库会话
        student_id: 学生 ID
        ability_codes: 原子能力 code 列表
        subject: 科目
        grade: 年级

    Returns:
        Dict: 验证后的参数信息

    Raises:
        ValueError: 参数验证失败
    """
    if not student_id:
        raise ValueError("学生 ID 不能为空")

    if not ability_codes or len(ability_codes) == 0:
        raise ValueError("原子能力 code 列表不能为空")

    if not subject:
        raise ValueError("科目不能为空")

    if not grade or grade < 1:
        raise ValueError("年级必须大于 0")

    # 验证原子能力是否存在
    abilities = await db.scalars(
        select(AbilityAtomic).where(
            AbilityAtomic.code.in_(ability_codes),
            AbilityAtomic.subject == subject,
            AbilityAtomic.grade == grade,
            AbilityAtomic.is_active == 1,
        )
    )
    ability_list = list(abilities.all())

    if len(ability_list) == 0:
        raise ValueError(f"未找到有效的原子能力: codes={ability_codes}")

    found_codes = {a.code for a in ability_list}
    missing_codes = set(ability_codes) - found_codes
    if missing_codes:
        logger.warning(f"部分原子能力未找到: missing_codes={missing_codes}")

    return {
        "abilities": ability_list,
        "subject": subject,
        "grade": grade,
    }


async def validate_unit_practice_params(
    db: AsyncSession,
    student_id: str,
    unit_id: int,
) -> Dict[str, Any]:
    """验证单元练习参数

    Args:
        db: 数据库会话
        student_id: 学生 ID
        unit_id: 单元 ID

    Returns:
        Dict: 验证后的参数信息，包含单元和教材信息

    Raises:
        ValueError: 参数验证失败
    """
    if not student_id:
        raise ValueError("学生 ID 不能为空")

    if not unit_id:
        raise ValueError("单元 ID 不能为空")

    # 查询单元信息
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError(f"单元不存在: unit_id={unit_id}")

    # 查询教材信息
    textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
    if not textbook:
        raise ValueError(f"教材不存在: textbook_id={unit.textbook_id}")

    return {
        "unit": unit,
        "textbook": textbook,
        "subject": textbook.subject,
        "grade": textbook.grade,
    }


# ==================== 题型选择 ====================


async def select_question_types(
    db: AsyncSession,
    practice_type: str,
    subject: str,
    grade: int,
    total_count: int,
    context: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """调用大模型选择题型

    Args:
        db: 数据库会话
        practice_type: 练习类型
        subject: 科目
        grade: 年级
        total_count: 需要生成的题目总数
        context: 额外上下文信息

    Returns:
        List[Dict]: 题型选择结果列表，每个元素包含:
            - question_type_code: 题型代码
            - question_type_name: 题型名称
            - difficulty: 难度
            - question_count: 题目数量
    """
    # 获取可用题型
    question_types = await db.scalars(
        select(QuestionType).where(
            QuestionType.subject == subject,
            QuestionType.is_active == 1,
        )
    )
    question_type_list = list(question_types.all())

    if not question_type_list:
        raise ValueError(f"未找到可用题型: subject={subject}")

    # 构建题型数据
    question_types_data = []
    for qt in question_type_list:
        question_types_data.append({
            "code": qt.code,
            "name": qt.name,
            "description": qt.description,
            "interaction_type": qt.interaction_type,
        })

    # 构建能力目标和认知层级
    ability_focus = ""
    cognitive_preference = "理解、应用"

    if practice_type == PRACTICE_TYPE_ABILITY:
        abilities = context.get("abilities", [])
        ability_names = [a.name for a in abilities]
        ability_focus = ", ".join(ability_names) if ability_names else "综合能力"
    elif practice_type == PRACTICE_TYPE_UNIT:
        unit = context.get("unit")
        if unit:
            ability_focus = f"单元 {unit.name} 相关能力"

    # 难度分布
    difficulty_distribution = "简单: 30%, 中等: 50%, 困难: 20%"

    # 构建 prompt
    from langchain_core.output_parsers import JsonOutputParser
    from langchain_core.prompts import ChatPromptTemplate
    from pydantic import BaseModel, Field

    class QuestionTypeSelection(BaseModel):
        """题型选择结果"""

        question_type_code: str = Field(description="题型代码")
        question_type_name: str = Field(description="题型名称")
        difficulty: str = Field(description="难度: easy/medium/hard")
        question_count: int = Field(description="题目数量")

    class QuestionTypeSelectionResult(BaseModel):
        """题型选择结果列表"""

        selections: List[QuestionTypeSelection] = Field(description="题型选择列表")

    parser = JsonOutputParser(pydantic_object=QuestionTypeSelectionResult)
    format_instructions = parser.get_format_instructions()

    # 获取学段
    stage = "小学" if grade <= 6 else ("初中" if grade <= 9 else "高中")

    prompt = ChatPromptTemplate.from_messages([
        ("system", SELECT_QUESTION_TYPE_SYSTEM_PROMPT),
        ("human", SELECT_QUESTION_TYPE_PROMPT + "\n\n可用题型数据:\n{question_types_data}\n\n{format_instructions}"),
    ])

    provider = get_provider()

    result = await provider.invoke_chain(
        prompt=prompt,
        parser=parser,
        prompt_input={
            "subject": subject,
            "stage": stage,
            "grade": grade,
            "total_count": total_count,
            "ability_focus": ability_focus,
            "cognitive_preference": cognitive_preference,
            "difficulty_distribution": difficulty_distribution,
            "question_types_data": str(question_types_data),
            "format_instructions": format_instructions,
        },
    )

    selections = result.get("selections", [])
    if not selections:
        # 如果 LLM 没有返回结果，使用默认分配
        logger.warning("LLM 未返回题型选择结果，使用默认分配")
        if question_type_list:
            default_qt = question_type_list[0]
            selections = [{
                "question_type_code": default_qt.code,
                "question_type_name": default_qt.name,
                "difficulty": "medium",
                "question_count": total_count,
            }]

    logger.info(f"题型选择完成: selections={selections}")
    return selections


# ==================== 题目生成 ====================


async def generate_questions_for_type(
    db: AsyncSession,
    question_type_code: str,
    count: int,
    difficulty: str,
    context: Dict[str, Any],
) -> List[Question]:
    """根据题型生成题目

    Args:
        db: 数据库会话
        question_type_code: 题型代码
        count: 生成数量
        difficulty: 难度
        context: 上下文信息

    Returns:
        List[Question]: 生成的题目列表
    """
    from shared.generation import invoke_question_generation_workflow

    try:
        questions = await invoke_question_generation_workflow(
            db=db,
            question_type_code=question_type_code,
            count=count,
        )
        logger.info(f"题目生成完成: question_type_code={question_type_code}, count={len(questions)}")
        return questions
    except Exception as e:
        logger.error(f"题目生成失败: question_type_code={question_type_code}, error={e}")
        return []


async def generate_questions_parallel(
    db: AsyncSession,
    selections: List[Dict[str, Any]],
    context: Dict[str, Any],
) -> List[Question]:
    """并行生成题目

    Args:
        db: 数据库会话
        selections: 题型选择列表
        context: 上下文信息

    Returns:
        List[Question]: 所有生成的题目列表
    """
    tasks = []
    for selection in selections:
        task = generate_questions_for_type(
            db=db,
            question_type_code=selection["question_type_code"],
            count=selection["question_count"],
            difficulty=selection.get("difficulty", "medium"),
            context=context,
        )
        tasks.append(task)

    # 并行执行所有题目生成任务
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 合并结果
    all_questions = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"题目生成任务失败: selection={selections[i]}, error={result}")
        elif isinstance(result, list):
            all_questions.extend(result)

    logger.info(f"并行生成题目完成: total={len(all_questions)}")
    return all_questions


# ==================== 答题记录预生成 ====================


async def prepare_answer_records(
    db: AsyncSession,
    session: PracticeSession,
    questions: List[Question],
) -> None:
    """为练习会话创建答题记录

    Args:
        db: 数据库会话
        session: 练习会话
        questions: 题目列表
    """
    # 删除已有的答题记录（如果存在）
    await db.execute(
        delete(PracticeSessionAnswer).where(PracticeSessionAnswer.session_id == session.id)
    )
    await db.flush()

    # 批量创建答题记录
    answer_records = []
    for index, question in enumerate(questions):
        knowledge = question.knowledge_points[0] if question.knowledge_points else None
        answer_record = PracticeSessionAnswer(
            session_id=session.id,
            question_id=question.id,
            student_id=session.student_id,
            question_order=index + 1,
            unit_id=question.unit_id,
            knowledge=knowledge,
            textbook_id=question.textbook_id,
            status=0,
            time_spent=0,
        )
        answer_records.append(answer_record)

    db.add_all(answer_records)
    logger.info(f"预生成答题记录完成: session_id={session.id}, count={len(answer_records)}")


# ==================== 清理数据 ====================


async def cleanup_session_data(db: AsyncSession, session_id: str) -> None:
    """清理练习会话相关数据（生成失败时调用）

    Args:
        db: 数据库会话
        session_id: 会话 ID
    """
    try:
        # 删除答题记录
        await db.execute(
            delete(PracticeSessionAnswer).where(PracticeSessionAnswer.session_id == session_id)
        )

        # 删除练习会话
        await db.execute(
            delete(PracticeSession).where(PracticeSession.id == session_id)
        )

        await db.commit()
        logger.info(f"清理练习会话数据完成: session_id={session_id}")
    except Exception as e:
        logger.error(f"清理练习会话数据失败: session_id={session_id}, error={e}")
        await db.rollback()


# ==================== 主流程 ====================


async def execute_generate_practice_session(db: AsyncSession, session_id: str) -> None:
    """执行练习会话生成

    生成流程：
    1. 查询会话信息
    2. 验证参数
    3. 选择题型
    4. 并行生成题目
    5. 预生成答题记录
    6. 更新会话状态

    Args:
        db: 数据库会话
        session_id: 练习会话 ID
    """
    start_time = pendulum.now()
    session = None

    try:
        # 1. 查询会话信息
        session = await db.scalar(
            select(PracticeSession).where(PracticeSession.id == session_id)
        )
        if not session:
            raise ValueError(f"练习会话不存在: session_id={session_id}")

        logger.info(
            f"开始生成练习会话: session_id={session_id}, "
            f"practice_type={session.practice_type}, "
            f"parameters={session.parameters}"
        )

        # 2. 验证参数并获取上下文
        practice_type = session.practice_type
        parameters = session.parameters or {}
        context = {}

        if practice_type == PRACTICE_TYPE_ABILITY:
            context = await validate_ability_practice_params(
                db=db,
                student_id=session.student_id,
                ability_codes=parameters.get("ability_codes", []),
                subject=parameters.get("subject", ""),
                grade=parameters.get("grade", 0),
            )
        elif practice_type == PRACTICE_TYPE_UNIT:
            context = await validate_unit_practice_params(
                db=db,
                student_id=session.student_id,
                unit_id=parameters.get("unit_id", 0),
            )
        else:
            raise ValueError(f"不支持的练习类型: practice_type={practice_type}")

        subject = context.get("subject", "")
        grade = context.get("grade", 0)
        generate_count = parameters.get("generate_count", 15)

        # 3. 选择题型
        selections = await select_question_types(
            db=db,
            practice_type=practice_type,
            subject=subject,
            grade=grade,
            total_count=generate_count,
            context=context,
        )

        # 4. 并行生成题目
        questions = await generate_questions_parallel(
            db=db,
            selections=selections,
            context=context,
        )

        if not questions:
            raise ValueError("题目生成失败，没有生成任何题目")

        # 5. 预生成答题记录
        await prepare_answer_records(db, session, questions)

        # 6. 更新会话状态为已完成
        end_time = pendulum.now()
        session.question_count = len(questions)
        session.generate_status = 1  # 已完成
        session.generate_time = int(end_time.diff(start_time).in_seconds())
        await db.commit()

        logger.info(
            f"练习会话生成完成: session_id={session_id}, "
            f"question_count={session.question_count}, "
            f"elapsed_time={session.generate_time}s"
        )

    except Exception as e:
        logger.error(f"练习会话生成失败: session_id={session_id}, error={e}")

        # 更新会话状态为生成失败
        if session:
            session.generate_status = -1  # 生成失败
            await db.commit()

        # 清理相关数据
        await cleanup_session_data(db, session_id)

        raise


async def create_practice_session(
    *,
    db: AsyncSession,
    practice_type: str,
    student_id: str,
    parameters: Dict[str, Any],
    immediately: bool = False,
) -> str:
    """创建练习会话

    Args:
        db: 数据库会话
        practice_type: 练习类型 (ability_practice / unit_practice)
        student_id: 学生 ID
        parameters: 练习参数
        immediately: 是否立即执行生成（同步模式）

    Returns:
        str: 练习会话 ID (UUID v4)
    """
    # 验证练习类型
    if practice_type not in VALID_PRACTICE_TYPES:
        raise ValueError(f"无效的练习类型: practice_type={practice_type}")

    logger.info(
        f"开始创建练习会话 | practice_type={practice_type} | "
        f"student_id={student_id} | parameters={parameters} | "
        f"immediately={immediately}"
    )

    # 1. 生成会话 ID，初始化练习会话记录，状态为生成中
    session_id = generate_session_id()

    session = PracticeSession(
        id=session_id,
        student_id=student_id,
        practice_type=practice_type,
        parameters=parameters,
        generate_status=0,  # 生成中
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    logger.info(f"练习会话记录创建成功: session_id={session_id}")

    try:
        if immediately:
            # 同步模式：立即执行生成
            await execute_generate_practice_session(db, session_id)
            logger.info(f"练习会话生成完成: session_id={session_id}")
        else:
            # 异步模式：提交到任务队列
            await submit_task(session_id, Executor.generate_practice_task, [session_id])
            logger.info(f"练习会话生成任务提交完成: session_id={session_id}")

        return session_id

    except Exception as e:
        logger.error(f"创建练习会话失败: session_id={session_id}, error={e}")
        # 清理数据
        await cleanup_session_data(db, session_id)
        raise ValueError(f"会话创建失败: {str(e)}")
