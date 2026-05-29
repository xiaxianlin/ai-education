# Google ADK AI Architecture

The AI migration replaces scattered Python LangChain/LangGraph utilities with a Go-facing Google ADK boundary.

## Current Python Sources

- `apps/server/shared/question/generate.py`
- `apps/server/shared/practice/answer.py`
- `apps/server/shared/practice/report.py`
- `apps/server/shared/util/ai.py`
- `apps/server/shared/util/oss.py`
- `apps/server/shared/util/rag.py`
- `apps/server/prompt/*.md`

## Go Interfaces

Business modules should depend on interfaces, not directly on ADK implementations.

```go
type QuestionGenerator interface {
    GenerateQuestions(ctx context.Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error)
}

type AnswerEvaluator interface {
    Evaluate(ctx context.Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error)
}

type ReportGenerator interface {
    GenerateReport(ctx context.Context, req GenerateReportRequest) (PracticeReportDraft, error)
}
```

## Agent Split

- `QuestionGeneratorAgent`: builds validated question JSON from prompt, subject, grade, and source material.
- `AnswerEvaluatorAgent`: handles subjective/open/audio scoring. Objective questions stay local.
- `ReportGeneratorAgent`: creates report summary, strengths, weaknesses, and recommendations.

## Tools

- `load_prompt`
- `search_rag`
- `generate_image`
- `generate_audio`
- `upload_oss`
- `save_question`

## Guardrails

- All model output must be decoded into typed Go structs.
- Invalid schema output must not be written to MySQL.
- Objective answer evaluation should not call AI.
- Tool logs must not expose API keys or student private data.

