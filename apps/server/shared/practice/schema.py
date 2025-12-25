from pydantic import BaseModel


class AnswerAnalysisSchema(BaseModel):
    """答题分析响应"""

    text: str
    match: bool
    analysis: str
