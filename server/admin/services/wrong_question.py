from sqlalchemy import and_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import StudentWrongQuestion, Student, Question
from core.schema import SearchResultSchema
from admin.schema import SearchSchema
from shared.utils.time import now


class WrongQuestionSchema:
    def __init__(self, wrong_question, question):
        self.id = wrong_question.id
        self.student_id = wrong_question.student_id
        self.question_id = wrong_question.question_id
        self.wrong_count = wrong_question.wrong_count
        self.last_wrong_time = wrong_question.last_wrong_time
        self.is_mastered = wrong_question.is_mastered
        self.mastered_time = wrong_question.mastered_time
        self.create_time = wrong_question.create_time
        self.update_time = wrong_question.update_time
        self.question_content = question.content if question else ""


async def add_wrong_question(db: AsyncSession, student_id: str, question_id: int):
    wrong_question = await db.scalar(
        select(StudentWrongQuestion).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.question_id == question_id,
            )
        )
    )

    if not wrong_question:
        wrong_question = StudentWrongQuestion(
            student_id=student_id,
            question_id=question_id,
            wrong_count=1,
            last_wrong_time=now(),
            is_mastered=0,
            mastered_time=0,
            create_time=now(),
            update_time=now(),
        )
        db.add(wrong_question)
    else:
        wrong_question.wrong_count += 1
        wrong_question.last_wrong_time = now()
        wrong_question.update_time = now()

    await db.commit()
    await db.refresh(wrong_question)

    return wrong_question


async def get_wrong_question(db: AsyncSession, student_id: str, question_id: int):
    wrong_question = await db.scalar(
        select(StudentWrongQuestion).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.question_id == question_id,
            )
        )
    )

    if not wrong_question:
        return None

    question = await db.scalar(select(Question).where(Question.id == question_id))

    return WrongQuestionSchema(wrong_question, question)


async def get_student_wrong_questions(db: AsyncSession, student_id: str, is_mastered: int = None):
    query = select(StudentWrongQuestion).where(StudentWrongQuestion.student_id == student_id)

    if is_mastered is not None:
        query = query.where(StudentWrongQuestion.is_mastered == is_mastered)

    query = query.order_by(StudentWrongQuestion.last_wrong_time.desc())

    result = await db.scalars(query)
    wrong_questions = result.all()

    output = []
    for wq in wrong_questions:
        question = await db.scalar(select(Question).where(Question.id == wq.question_id))
        output.append(WrongQuestionSchema(wq, question))

    return output


async def mark_as_mastered(db: AsyncSession, student_id: str, question_id: int):
    wrong_question = await db.scalar(
        select(StudentWrongQuestion).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.question_id == question_id,
            )
        )
    )

    if not wrong_question:
        raise ValueError("错题记录不存在")

    wrong_question.is_mastered = 1
    wrong_question.mastered_time = now()
    wrong_question.update_time = now()

    await db.commit()
    await db.refresh(wrong_question)

    return wrong_question


async def unmark_as_mastered(db: AsyncSession, student_id: str, question_id: int):
    wrong_question = await db.scalar(
        select(StudentWrongQuestion).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.question_id == question_id,
            )
        )
    )

    if not wrong_question:
        raise ValueError("错题记录不存在")

    wrong_question.is_mastered = 0
    wrong_question.mastered_time = 0
    wrong_question.update_time = now()

    await db.commit()
    await db.refresh(wrong_question)

    return wrong_question


async def delete_wrong_question(db: AsyncSession, student_id: str, question_id: int):
    wrong_question = await db.scalar(
        select(StudentWrongQuestion).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.question_id == question_id,
            )
        )
    )

    if wrong_question:
        await db.delete(wrong_question)
        await db.commit()


async def get_wrong_question_stats(db: AsyncSession, student_id: str):
    total = await db.scalar(
        select(func.count(StudentWrongQuestion.id)).where(
            StudentWrongQuestion.student_id == student_id
        )
    ) or 0

    mastered = await db.scalar(
        select(func.count(StudentWrongQuestion.id)).where(
            and_(
                StudentWrongQuestion.student_id == student_id,
                StudentWrongQuestion.is_mastered == 1,
            )
        )
    ) or 0

    unmastered = total - mastered

    return {
        "total": total,
        "mastered": mastered,
        "unmastered": unmastered,
    }
