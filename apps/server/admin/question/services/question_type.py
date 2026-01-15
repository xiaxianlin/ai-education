"""
题型服务层
"""

from pathlib import Path
from typing import Any, Dict, List

from shared.core.database import Ability, QuestionType
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from admin.question.schema import AbilityPracticeSearchSchema, QuestionTypeSaveSchema

# prompt 文件目录路径
PROMPTS_DIR = Path(__file__).parent.parent.parent / "shared" / "prompts"


async def create_question_type(db: AsyncSession, params: QuestionTypeSaveSchema):
    """创建题型"""
    question_type = QuestionType(
        name=params.name,
        code=params.code,
        description=params.description,
        category=params.category,
        subject=params.subject,
        ability_code=params.ability_code,
        configs={},
    )
    db.add(question_type)
    await db.commit()
    await db.refresh(question_type)


async def update_question_type(db: AsyncSession, id: int, params: QuestionTypeSaveSchema):
    """更新题型"""
    question_type = await db.scalar(select(QuestionType).where(QuestionType.id == id))

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    question_type.name = params.name
    question_type.code = params.code

    if params.description:
        question_type.description = params.description
    if params.ability_code:
        question_type.ability_code = params.ability_code

    await db.commit()
    await db.refresh(question_type)


async def delete_question_type(db: AsyncSession, id: int) -> None:
    """删除题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.id == id))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型 {id} 不存在")

    await db.delete(question_type)
    await db.commit()


async def search_unit_practice_types(db: AsyncSession):
    """搜索单元练习题型"""
    query = select(QuestionType).where(QuestionType.category == "unit_practice").order_by(QuestionType.id)
    result = await db.scalars(query)
    return list(result.all())


async def search_ability_practice_types(db: AsyncSession, params: AbilityPracticeSearchSchema):
    """搜索能力练习题型"""

    query = (
        select(QuestionType)
        .join(Ability, Ability.code == QuestionType.ability_code)
        .where(
            QuestionType.category == "ability_practice",
            QuestionType.subject == params.subject,
            Ability.grade == params.grade,
            Ability.subject == params.subject,
        )
        .order_by(QuestionType.ability_code, QuestionType.id)
    )

    result = await db.scalars(query)
    return list(result.all())


async def list_all_question_types(db: AsyncSession) -> List[QuestionType]:
    """获取所有题型（不分页，用于导出全量数据）"""
    # 构建查询，获取所有数据
    query = select(QuestionType).order_by(QuestionType.id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def batch_create_question_types(db: AsyncSession, type_data_list: List[QuestionTypeSaveSchema]):
    """批量创建题型"""

    for type_data in type_data_list:
        question_type = QuestionType(**type_data.model_dump())
        db.add(question_type)

    await db.commit()


async def get_question_type_by_code(db: AsyncSession, code: str) -> QuestionType:
    """根据 code 获取题型"""
    result = await db.execute(select(QuestionType).where(QuestionType.code == code))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题型不存在: code={code}")

    return question_type


def read_prompt_file(code: str) -> str:
    """读取 prompt 文件

    Args:
        code: 题型编码

    Returns:
        str: prompt 文件内容，文件不存在时返回空字符串
    """
    file_path = PROMPTS_DIR / f"{code}.md"
    if file_path.exists():
        return file_path.read_text(encoding="utf-8")
    return ""


def write_prompt_file(code: str, content: str) -> None:
    """写入 prompt 文件

    Args:
        code: 题型编码
        content: prompt 内容

    Raises:
        OSError: 文件写入失败
    """
    PROMPTS_DIR.mkdir(parents=True, exist_ok=True)
    file_path = PROMPTS_DIR / f"{code}.md"
    file_path.write_text(content, encoding="utf-8")


async def update_question_type_configs(db: AsyncSession, code: str, configs: Dict[str, Any]) -> QuestionType:
    """更新题型的 configs 字段

    Args:
        db: 数据库会话
        code: 题型编码
        configs: configs 配置字典

    Returns:
        QuestionType: 更新后的题型对象

    Raises:
        ValueError: 题型不存在
    """
    question_type = await get_question_type_by_code(db, code)

    question_type.configs = configs
    flag_modified(question_type, "configs")

    await db.commit()
    await db.refresh(question_type)

    return question_type
