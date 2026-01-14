"""练习生成服务函数

包含参数验证、题型选择、答题记录处理等功能
"""

from typing import Any, Dict, List, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from pydantic import BaseModel, Field
from shared.core.database import Ability, Practice, PracticeAnswer, Question, QuestionType, Textbook, Unit
from shared.practice.prompt import SELECT_QUESTION_TYPE_PROMPT, SELECT_QUESTION_TYPE_SYSTEM_PROMPT
from shared.practice.question_type_rules import get_rule_based_selection
from shared.provider import get_provider
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import PRACTICE_TYPE_ABILITY, PRACTICE_TYPE_UNIT


# ==================== Pydantic 模型 ====================


class QuestionTypeSelection(BaseModel):
    """题型选择结果"""

    question_type_code: str = Field(description="题型代码")
    question_type_name: str = Field(description="题型名称")
    difficulty: str = Field(description="难度: easy/medium/hard")
    question_count: int = Field(description="题目数量")


class QuestionTypeSelectionResult(BaseModel):
    """题型选择结果列表"""

    selections: List[QuestionTypeSelection] = Field(description="题型选择列表")


# ==================== 服务函数 ====================


async def validate_ability_practice_params(
    db: AsyncSession,
    student_id: str,
    ability_code: str,
    subject: Optional[str] = None,
    grade: Optional[int] = None,
) -> Dict[str, Any]:
    """验证能力练习参数

    Args:
        db: 数据库会话
        student_id: 学生 ID
        ability_code: 能力 code
        subject: 科目（可选，如果未提供则从 ability_code 查询获取）
        grade: 年级（可选，如果未提供则从 ability_code 查询获取）

    Returns:
        Dict: 验证后的参数信息

    Raises:
        ValueError: 参数验证失败
    """
    if not student_id:
        raise ValueError("学生 ID 不能为空")

    if not ability_code:
        raise ValueError("能力 code 不能为空")

    # 如果未提供 subject 和 grade，从 ability_code 查询获取
    if not subject or not grade:
        abilities = await db.scalars(
            select(Ability).where(
                Ability.code == ability_code,
                Ability.is_active == 1,
            )
        )
        ability_list = list(abilities.all())

        if not ability_list:
            raise ValueError(f"未找到有效的能力: code={ability_code}")

        if len(ability_list) > 1:
            raise ValueError(
                f"找到多个匹配的能力: code={ability_code}, " f"请指定 subject 和 grade 以确定具体的能力"
            )

        ability = ability_list[0]
        subject = ability.subject
        grade = ability.grade
    else:
        # 验证年级有效性
        if grade < 1:
            raise ValueError("年级必须大于 0")

        # 验证能力是否存在
        ability = await db.scalar(
            select(Ability).where(
                Ability.code == ability_code,
                Ability.subject == subject,
                Ability.grade == grade,
                Ability.is_active == 1,
            )
        )

        if not ability:
            raise ValueError(f"未找到有效的能力: code={ability_code}, subject={subject}, grade={grade}")

    return {
        "abilities": [ability],
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


async def select_question_types(
    db: AsyncSession,
    practice_type: str,
    subject: str,
    grade: int,
    total_count: int,
    context: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """选择题型 - 规则引擎优先，LLM 兜底

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
    # 根据练习类型筛选题型
    if practice_type == PRACTICE_TYPE_ABILITY:
        # 能力练习：筛选 ability_practice 类型的题型
        question_types = await db.scalars(
            select(QuestionType).where(
                QuestionType.subject == subject,
                QuestionType.category == "ability_practice",
            )
        )
    else:
        # 单元练习：筛选 unit_practice 类型的题型
        question_types = await db.scalars(
            select(QuestionType).where(
                QuestionType.subject == subject,
                QuestionType.category == "unit_practice",
            )
        )
    question_type_list = list(question_types.all())

    if not question_type_list:
        raise ValueError(f"未找到可用题型: subject={subject}")

    # 可用题型代码列表
    available_type_codes = [qt.code for qt in question_type_list]

    # 1. 先尝试规则引擎
    rule_selections = get_rule_based_selection(
        subject=subject,
        grade=grade,
        total_count=total_count,
        available_type_codes=available_type_codes,
    )

    if rule_selections:
        logger.info(f"使用规则引擎选择题型: {len(rule_selections)} 种题型")
        return rule_selections

    # 2. 规则无法匹配，使用 LLM 选择
    logger.info("规则未匹配，使用 LLM 选择题型")

    # 构建题型数据（使用列表推导式）
    question_types_data = [
        {
            "code": qt.code,
            "name": qt.name,
            "description": qt.description,
            "category": qt.category,
            "grade_band": qt.grade_band,
        }
        for qt in question_type_list
    ]

    # 构建能力目标
    ability_focus = ""
    if practice_type == PRACTICE_TYPE_ABILITY:
        abilities = context.get("abilities", [])
        ability_names = [a.name for a in abilities]
        ability_focus = ", ".join(ability_names) if ability_names else "综合能力"
    elif practice_type == PRACTICE_TYPE_UNIT:
        unit = context.get("unit")
        if unit:
            ability_focus = f"单元 {unit.name} 相关能力"

    # 认知层级和难度分布
    cognitive_preference = "理解、应用"
    difficulty_distribution = "简单: 30%, 中等: 50%, 困难: 20%"

    # 使用模块级别的 Pydantic 模型
    parser = JsonOutputParser(pydantic_object=QuestionTypeSelectionResult)
    format_instructions = parser.get_format_instructions()

    # 获取学段
    stage = "小学" if grade <= 6 else ("初中" if grade <= 9 else "高中")

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SELECT_QUESTION_TYPE_SYSTEM_PROMPT),
            (
                "human",
                SELECT_QUESTION_TYPE_PROMPT + "\n\n可用题型数据:\n{question_types_data}\n\n{format_instructions}",
            ),
        ]
    )

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
            selections = [
                {
                    "question_type_code": default_qt.code,
                    "question_type_name": default_qt.name,
                    "difficulty": "medium",
                    "question_count": total_count,
                }
            ]

    logger.info(f"题型选择完成: selections={selections}")
    return selections


async def prepare_answer_records(
    db: AsyncSession,
    session: Practice,
    questions: List[Question],
) -> None:
    """为练习创建答题记录

    Args:
        db: 数据库会话
        session: 练习
        questions: 题目列表
    """
    # 删除已有的答题记录（如果存在）
    await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session.id))
    await db.flush()

    # 批量创建答题记录（使用列表推导式）
    answer_records = [
        PracticeAnswer(
            session_id=session.id,
            question_id=question.id,
            student_id=session.student_id,
            question_order=index + 1,
            status=0,
            time_spent=0,
        )
        for index, question in enumerate(questions)
    ]

    db.add_all(answer_records)
    logger.info(f"预生成答题记录完成: session_id={session.id}, count={len(answer_records)}")


async def cleanup_session_data(db: AsyncSession, session_id: str) -> None:
    """清理练习会话相关数据（生成失败时调用）

    Args:
        db: 数据库会话
        session_id: 会话 ID
    """
    try:
        # 删除答题记录
        await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))

        # 删除练习
        await db.execute(delete(Practice).where(Practice.id == session_id))

        await db.commit()
        logger.info(f"清理练习会话数据完成: session_id={session_id}")
    except Exception as e:
        logger.error(f"清理练习会话数据失败: session_id={session_id}, error={e}")
        await db.rollback()
