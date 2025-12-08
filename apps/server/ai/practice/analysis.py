from typing import List
from loguru import logger

from shared.core.database import (
    PracticeSession,
    PracticeAnswer,
    PracticeWrongRecord,
)


def practice_report_analysis(
    session: PracticeSession,
    answers: List[PracticeAnswer],
    wrong_records: List[PracticeWrongRecord],
) -> int:
    logger.info(f"开始练习报告分析，session_id: {session.id}, 学生ID: {session.student_id}")
