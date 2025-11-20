from pydantic import BaseModel


class LoginSchema(BaseModel):
    phone: str
    password: str


class AnswerQuestionSchema(BaseModel):
    session_id: str


class CompletePracticeSchema(BaseModel):
    session_id: str
