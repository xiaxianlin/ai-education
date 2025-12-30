"""题目生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import Question, QuestionType
from shared.provider import get_provider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import QuestionGenerationState
from .service import (
    build_question_generation_prompt,
    filter_similar_questions,
    handle_llm_questions,
)

# 最大循环次数，避免无限循环
MAX_LOOP_COUNT = 10


async def entry_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验和加载题目类型信息"""

    logger.info("[entry_node] 开始执行入口节点")
    logger.debug(
        f"[entry_node] 输入 state: question_type_code={state.get('question_type_code')}, count={state.get('count')}"
    )

    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")

    if not state.get("question_type_code"):
        raise ValueError("题目类型编码（question_type_code）不能为空")

    if not state.get("count") or state.get("count", 0) <= 0:
        raise ValueError("生成数量（count）必须大于 0")

    db: AsyncSession = state["db"]
    question_type_code = state["question_type_code"]

    # 查询题目类型
    result = await db.execute(select(QuestionType).where(QuestionType.code == question_type_code))
    question_type = result.scalar_one_or_none()

    if not question_type:
        raise ValueError(f"题目类型不存在: code={question_type_code}")

    if not question_type.is_active:
        raise ValueError(f"题目类型未启用: code={question_type_code}")

    if not question_type.ai_prompt:
        raise ValueError(f"题目类型的 ai_prompt 不能为空: code={question_type_code}")

    # 获取科目和年级
    subject = question_type.subject
    grade = question_type.grades[0] if question_type.grades else 1

    logger.info(
        f"[entry_node] 题目生成开始: type={question_type_code}, "
        f"subject={subject}, grade={grade}, count={state['count']}"
    )

    output = {
        "question_type": question_type,
        "subject": subject,
        "grade": grade,
        "unique_questions": [],
        "loop_count": 0,
    }
    logger.debug(f"[entry_node] 输出: subject={subject}, grade={grade}, unique_questions_count=0, loop_count=0")
    logger.info("[entry_node] 入口节点执行完成")
    return output


async def build_prompt_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建 prompt 节点"""

    logger.info("[build_prompt_node] 开始构建 prompt")
    question_type = state["question_type"]
    count = state["count"]
    unique_questions = state.get("unique_questions", [])

    # 计算还需要生成的数量
    remaining_count = count - len(unique_questions)

    logger.debug(
        f"[build_prompt_node] 输入 state: question_type_code={question_type.code}, "
        f"count={count}, unique_questions_count={len(unique_questions)}, remaining_count={remaining_count}"
    )
    logger.info(
        f"[build_prompt_node] 构建 prompt: 已生成={len(unique_questions)}, " f"需要={count}, 还需={remaining_count}"
    )

    # 构建 prompt
    prompt_data = await build_question_generation_prompt(
        question_type=question_type,
        count=remaining_count,
        existing_questions=unique_questions,
    )

    logger.debug(
        f"[build_prompt_node] 输出: prompt_keys={list(prompt_data.keys())}, "
        f"prompt_input_keys={list(prompt_data.get('prompt_input', {}).keys()) if 'prompt_input' in prompt_data else 'N/A'}"
    )
    logger.info("[build_prompt_node] prompt 构建完成")
    return prompt_data


def should_generate_node(state: QuestionGenerationState) -> str:
    """判断是否需要生成题目

    Returns:
        str: "generate" 表示需要生成, "skip" 表示跳过生成
    """
    logger.info("[should_generate_node] 开始判断是否需要生成")
    count = state["count"]
    unique_questions = state.get("unique_questions", [])
    remaining_count = count - len(unique_questions)

    logger.debug(
        f"[should_generate_node] 输入 state: count={count}, "
        f"unique_questions_count={len(unique_questions)}, remaining_count={remaining_count}"
    )

    if remaining_count <= 0:
        logger.info("[should_generate_node] 题目数量已足够，跳过生成")
        logger.debug("[should_generate_node] 输出: skip")
        return "skip"

    logger.info("[should_generate_node] 需要继续生成题目")
    logger.debug("[should_generate_node] 输出: generate")
    return "generate"


async def call_llm_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """调用大模型生成题目"""

    logger.info("[call_llm_node] 开始调用大模型生成题目")
    logger.debug(
        f"[call_llm_node] 输入 state: question_type_code={state['question_type'].code}, "
        f"prompt_input_keys={list(state.get('prompt_input', {}).keys()) if 'prompt_input' in state else 'N/A'}"
    )

    provider = get_provider()
    result = await provider.invoke_chain(
        prompt=state["prompt"],
        parser=state["prompt_parser"],
        prompt_input=state["prompt_input"],
    )

    logger.debug(
        f"[call_llm_node] LLM 原始返回: result_keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}"
    )
    logger.debug(f"[call_llm_node] LLM 原始返回内容: {result}")

    # 处理不同的返回格式
    questions_list = None

    # 情况1: 标准格式，包含 questions 数组
    if "questions" in result:
        if isinstance(result["questions"], list):
            questions_list = result["questions"]
            logger.debug(f"[call_llm_node] 使用标准格式: questions 数组，数量={len(questions_list)}")
        else:
            raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")
    # 情况2: 单个题目对象格式（LLM 可能只返回一道题目，字段名可能是 question 而不是 stem）
    elif isinstance(result, dict) and ("question" in result or "stem" in result or "options" in result):
        logger.warning("[call_llm_node] LLM 返回的是单个题目对象，将其包装成数组并尝试字段映射")
        # 检查字段映射：如果返回的是 question 字段，需要映射到 stem
        single_question = dict(result)
        if "question" in single_question and "stem" not in single_question:
            # 将 question 字段映射到 stem（如果 question 是字符串，包装成 dict）
            question_value = single_question.pop("question")
            if isinstance(question_value, str):
                single_question["stem"] = {"text": question_value}
            elif isinstance(question_value, dict):
                single_question["stem"] = question_value
            else:
                single_question["stem"] = {"text": str(question_value)}
            logger.debug("[call_llm_node] 已将 question 字段映射到 stem")
        questions_list = [single_question]
    else:
        # 情况3: 可能是解析失败，result 本身就是题目列表
        if isinstance(result, list):
            logger.warning("[call_llm_node] LLM 直接返回了题目列表，使用该列表")
            questions_list = result
        else:
            raise ValueError(
                f"LLM 返回结果格式不正确。期望包含 'questions' 字段的对象，或单个题目对象，或题目列表。"
                f"实际返回的 keys: {list(result.keys()) if isinstance(result, dict) else type(result).__name__}"
            )

    if not questions_list:
        raise ValueError("无法从 LLM 返回结果中提取题目列表")

    logger.info(f"[call_llm_node] 大模型生成题目完成，共 {len(questions_list)} 道题目")
    logger.debug(f"[call_llm_node] 提取的题目数量: {len(questions_list)}")

    # 处理 LLM 返回的题目
    question_type = state["question_type"]
    db = state["db"]

    generated_questions = handle_llm_questions(
        db=db,
        question_type=question_type,
        llm_questions=questions_list,
    )

    output = {"generated_questions": generated_questions}
    logger.debug(f"[call_llm_node] 输出: generated_questions_count={len(generated_questions)}")
    logger.info("[call_llm_node] 大模型调用节点执行完成")
    return output


async def check_similarity_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """检查相似度并去重节点"""

    logger.info("[check_similarity_node] 开始检查相似度并去重")
    generated_questions = state.get("generated_questions", [])
    unique_questions = state.get("unique_questions", [])

    logger.debug(
        f"[check_similarity_node] 输入 state: generated_questions_count={len(generated_questions)}, "
        f"unique_questions_count={len(unique_questions)}"
    )

    if not generated_questions:
        logger.warning("[check_similarity_node] 没有生成的题目需要检查")
        output = {"unique_questions": unique_questions}
        logger.debug(f"[check_similarity_node] 输出: unique_questions_count={len(unique_questions)}")
        return output

    logger.info(
        f"[check_similarity_node] 开始相似度检查: 新生成={len(generated_questions)}, " f"已有={len(unique_questions)}"
    )

    # 过滤相似题目
    filtered_questions = filter_similar_questions(
        questions=generated_questions,
        existing_questions=unique_questions,
        threshold=0.8,
    )

    # 合并到唯一题目列表
    new_unique_questions = list(unique_questions) + list(filtered_questions)

    filtered_count = len(generated_questions) - len(filtered_questions)
    if filtered_count > 0:
        logger.info(
            f"[check_similarity_node] 相似度检查完成: 过滤={filtered_count}道, "
            f"保留={len(filtered_questions)}道, "
            f"总计={len(new_unique_questions)}道"
        )
    else:
        logger.info(f"[check_similarity_node] 相似度检查完成: 全部保留, 总计={len(new_unique_questions)}道")

    output = {"unique_questions": new_unique_questions}
    logger.debug(
        f"[check_similarity_node] 输出: unique_questions_count={len(new_unique_questions)}, "
        f"filtered_count={filtered_count}, kept_count={len(filtered_questions)}"
    )
    logger.info("[check_similarity_node] 相似度检查节点执行完成")
    return output


def loop_condition_node(state: QuestionGenerationState) -> str:
    """循环条件判断节点

    Returns:
        str: "continue" 表示继续生成, "save" 表示保存并结束
    """
    logger.info("[loop_condition_node] 开始判断循环条件")
    count = state["count"]
    unique_questions = state.get("unique_questions", [])
    loop_count = state.get("loop_count", 0)

    current_count = len(unique_questions)

    logger.debug(
        f"[loop_condition_node] 输入 state: count={count}, "
        f"unique_questions_count={current_count}, loop_count={loop_count}"
    )

    # 检查是否达到目标数量
    if current_count >= count:
        logger.info(f"[loop_condition_node] 题目数量已足够: {current_count} >= {count}")
        logger.debug("[loop_condition_node] 输出: save")
        return "save"

    # 检查是否超过最大循环次数
    if loop_count >= MAX_LOOP_COUNT:
        logger.warning(
            f"[loop_condition_node] 达到最大循环次数: {loop_count} >= {MAX_LOOP_COUNT}, "
            f"当前数量={current_count}, 目标数量={count}"
        )
        logger.debug("[loop_condition_node] 输出: save")
        return "save"

    # 继续生成
    remaining = count - current_count
    logger.info(
        f"[loop_condition_node] 题目数量不足: {current_count} < {count}, "
        f"还需={remaining}道, 继续生成 (循环次数={loop_count + 1})"
    )
    logger.debug("[loop_condition_node] 输出: continue")
    return "continue"


async def increment_loop_count_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """增加循环计数节点"""
    logger.info("[increment_loop_count_node] 开始增加循环计数")
    loop_count = state.get("loop_count", 0)
    logger.debug(f"[increment_loop_count_node] 输入 state: loop_count={loop_count}")

    new_loop_count = loop_count + 1
    output = {"loop_count": new_loop_count}
    logger.debug(f"[increment_loop_count_node] 输出: loop_count={new_loop_count}")
    logger.info(f"[increment_loop_count_node] 循环计数已增加到 {new_loop_count}")
    return output


async def save_questions_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库节点"""

    logger.info("[save_questions_node] 开始保存题目到数据库")
    db = state["db"]
    unique_questions = state.get("unique_questions", [])

    logger.debug(f"[save_questions_node] 输入 state: unique_questions_count={len(unique_questions)}")

    if not unique_questions:
        logger.warning("[save_questions_node] 没有题目需要保存")
        await db.commit()
        output = {"questions": []}
        logger.debug("[save_questions_node] 输出: questions_count=0")
        logger.info("[save_questions_node] 保存节点执行完成（无题目）")
        return output

    logger.info(f"[save_questions_node] 开始保存题目到数据库: 共 {len(unique_questions)} 道")

    # 题目已经在 handle_llm_questions 中添加到数据库，这里只需要提交
    await db.commit()

    logger.info("[save_questions_node] 题目保存完成")
    output = {"questions": unique_questions}
    logger.debug(f"[save_questions_node] 输出: questions_count={len(unique_questions)}")
    logger.info("[save_questions_node] 保存节点执行完成")
    return output


# ==================== 图构建 ====================


def create_question_generation_graph() -> CompiledStateGraph:
    """创建题目生成流程图"""
    workflow = StateGraph(QuestionGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("check_similarity", check_similarity_node)
    workflow.add_node("increment_loop", increment_loop_count_node)
    workflow.add_node("save_questions", save_questions_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边
    workflow.add_edge("entry", "build_prompt")

    # 在 build_prompt 之后判断是否需要生成
    workflow.add_conditional_edges(
        "build_prompt",
        should_generate_node,
        {
            "generate": "call_llm",
            "skip": "check_similarity",
        },
    )

    workflow.add_edge("call_llm", "check_similarity")

    # 循环条件判断
    workflow.add_conditional_edges(
        "check_similarity",
        loop_condition_node,
        {
            "continue": "increment_loop",
            "save": "save_questions",
        },
    )

    # 增加循环计数后继续生成
    workflow.add_edge("increment_loop", "build_prompt")

    # 保存后结束
    workflow.add_edge("save_questions", END)

    return workflow.compile()


question_generation_graph = create_question_generation_graph()


async def invoke_question_generation_workflow(
    *,
    db: AsyncSession,
    question_type_code: str,
    count: int,
) -> List[Question]:
    """执行题目生成工作流

    Args:
        db: 数据库会话
        question_type_code: 题目类型编码
        count: 需要生成的数量

    Returns:
        List[Question]: 生成的题目列表
    """
    logger.info(
        f"[invoke_question_generation_workflow] 开始执行题目生成工作流: "
        f"question_type_code={question_type_code}, count={count}"
    )

    state = QuestionGenerationState(
        db=db,
        question_type_code=question_type_code,
        count=count,
    )

    logger.debug(
        f"[invoke_question_generation_workflow] 初始 state: question_type_code={question_type_code}, count={count}"
    )

    result = await question_generation_graph.ainvoke(state)

    questions = result.get("questions", [])
    logger.info(f"[invoke_question_generation_workflow] 工作流执行完成: 生成题目数量={len(questions)}")
    logger.debug(f"[invoke_question_generation_workflow] 最终结果: questions_count={len(questions)}")

    return questions
