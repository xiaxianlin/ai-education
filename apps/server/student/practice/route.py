# -*- coding: utf-8 -*-
"""
练习路由

支持题型系统的练习功能：
- 获取题目
- 提交答案（支持复合题）
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from shared.core.database import Question

practice_router = APIRouter(prefix="/practice")


# ============ 请求/响应模型 ============


class SubAnswerSchema(BaseModel):
    """子题答案"""

    sub_question_id: str = Field(..., description="子题ID")
    answer: Any = Field(..., description="答案内容")
    time_spent: Optional[int] = Field(None, description="答题耗时(秒)")


class AnswerSchema(BaseModel):
    """答案提交"""

    session_id: int = Field(..., description="练习会话ID")
    question_id: str = Field(..., description="题目ID")
    answer: Any = Field(..., description="主答案内容")
    sub_answers: Optional[list[SubAnswerSchema]] = Field(None, description="子题答案列表")
    time_spent: Optional[int] = Field(None, description="总答题耗时(秒)")


class AnswerResultSchema(BaseModel):
    """答案评判结果"""

    is_correct: bool = Field(..., description="是否正确")
    score: float = Field(..., description="得分")
    full_score: float = Field(..., description="满分")
    feedback: Optional[str] = Field(None, description="反馈信息")
    correct_answer: Optional[Any] = Field(None, description="正确答案")
    sub_results: Optional[list[dict]] = Field(None, description="子题评判结果")


# ============ 路由 ============


@practice_router.get(
    "/question/{question_id}",
    tags=["练习"],
    summary="获取题目详情",
    description="获取题目内容",
)
async def get_question(
    question_id: str,
    request: Request,
    db: AsyncSession = Database,
):
    """获取题目详情"""
    question = await db.scalar(select(Question).where(Question.id == question_id))

    if not question:
        raise HTTPException(status_code=404, detail=f"题目 {question_id} 不存在")

    # 转换为前端格式
    return {
        "id": question.id,
        "questionTypeId": question.question_type_id,
        "questionTypeCode": question.question_type_code,
        "subject": question.subject,
        "grade": question.grade,
        "stage": question.stage,
        "stem": question.stem,
        "options": question.options,
        "blanks": question.blanks,
        "resources": question.resources,
        "difficulty": question.difficulty,
        "cognitiveLevel": question.cognitive_level,
        # 不返回答案，仅用于学生答题
    }


@practice_router.post(
    "/answer",
    tags=["练习"],
    summary="提交答案",
    description="提交答案，支持复合题",
    response_model=AnswerResultSchema,
)
async def submit_answer(
    params: AnswerSchema,
    request: Request,
    db: AsyncSession = Database,
):
    """提交答案"""
    student = request.state.student

    # 获取题目
    question = await db.scalar(select(Question).where(Question.id == params.question_id))

    if not question:
        raise HTTPException(status_code=404, detail=f"题目 {params.question_id} 不存在")

    # 评判答案
    result = evaluate_answer(question, params)

    # TODO: 保存答题记录到数据库

    return result


def evaluate_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """
    评判答案

    支持：
    - 精确匹配 (exact)
    - 模糊匹配 (fuzzy)
    - 复合题 (composite)
    """
    answer_config = question.answer or {}
    answer_type = answer_config.get("type", "exact")

    if answer_type == "composite":
        # 复合题评判
        return evaluate_composite_answer(question, params)
    elif answer_type == "exact":
        return evaluate_exact_answer(question, params)
    elif answer_type == "fuzzy":
        return evaluate_fuzzy_answer(question, params)
    else:
        # AI 评分等其他类型暂时返回待评判
        return AnswerResultSchema(
            is_correct=False,
            score=0,
            full_score=answer_config.get("scoring", {}).get("full_score", 10),
            feedback="此题型暂不支持自动评判",
        )


def evaluate_exact_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """精确匹配评判"""
    answer_config = question.answer or {}
    correct_answers = answer_config.get("correct_answers", [])
    scoring = answer_config.get("scoring", {})
    full_score = scoring.get("full_score", 10)

    user_answer = str(params.answer).strip()
    is_correct = user_answer in [str(a).strip() for a in correct_answers]

    return AnswerResultSchema(
        is_correct=is_correct,
        score=full_score if is_correct else 0,
        full_score=full_score,
        feedback="回答正确！" if is_correct else "回答错误，请再试一次。",
        correct_answer=correct_answers[0] if correct_answers and not is_correct else None,
    )


def evaluate_fuzzy_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """模糊匹配评判"""
    answer_config = question.answer or {}
    correct_answers = answer_config.get("correct_answers", [])
    accept_values = answer_config.get("accept_values", [])
    scoring = answer_config.get("scoring", {})
    full_score = scoring.get("full_score", 10)

    user_answer = str(params.answer).strip().lower()
    all_acceptable = [str(a).strip().lower() for a in correct_answers + accept_values]

    is_correct = user_answer in all_acceptable

    return AnswerResultSchema(
        is_correct=is_correct,
        score=full_score if is_correct else 0,
        full_score=full_score,
        feedback="回答正确！" if is_correct else "回答错误，请再试一次。",
        correct_answer=correct_answers[0] if correct_answers and not is_correct else None,
    )


def evaluate_composite_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """复合题评判"""
    stem = question.stem or {}
    sub_questions = stem.get("sub_questions", [])
    answer_config = question.answer or {}
    scoring = answer_config.get("scoring", {})
    partial_strategy = scoring.get("partial_strategy", "sum")

    if not sub_questions or not params.sub_answers:
        return AnswerResultSchema(
            is_correct=False,
            score=0,
            full_score=scoring.get("full_score", 10),
            feedback="请完成所有小题",
        )

    # 构建子答案映射
    sub_answer_map = {sa.sub_question_id: sa.answer for sa in params.sub_answers}

    total_score = 0
    full_score = 0
    sub_results = []
    all_correct = True

    for sub_q in sub_questions:
        sub_id = sub_q.get("id")
        sub_answer_config = sub_q.get("answer", {})
        sub_full_score = sub_answer_config.get("scoring", {}).get("full_score", 10)
        full_score += sub_full_score

        user_sub_answer = sub_answer_map.get(sub_id)
        correct_answers = sub_answer_config.get("correct_answers", [])

        if user_sub_answer is None:
            is_sub_correct = False
            sub_score = 0
        else:
            is_sub_correct = str(user_sub_answer).strip() in [
                str(a).strip() for a in correct_answers
            ]
            sub_score = sub_full_score if is_sub_correct else 0

        total_score += sub_score
        all_correct = all_correct and is_sub_correct

        sub_results.append(
            {
                "sub_question_id": sub_id,
                "is_correct": is_sub_correct,
                "score": sub_score,
                "full_score": sub_full_score,
            }
        )

    # 根据策略计算最终得分
    if partial_strategy == "all_or_nothing":
        final_score = full_score if all_correct else 0
    else:  # sum
        final_score = total_score

    return AnswerResultSchema(
        is_correct=all_correct,
        score=final_score,
        full_score=full_score,
        feedback=(
            "全部正确！"
            if all_correct
            else f"正确 {sum(1 for r in sub_results if r['is_correct'])}/{len(sub_results)} 题"
        ),
        sub_results=sub_results,
    )
