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

The current Go package also defines a low-level `Adapter` interface for the future
Google ADK SDK integration:

```go
type Adapter interface {
    Invoke(ctx Context, req AdapterRequest) (AdapterResponse, error)
}
```

This interface intentionally has no Google ADK import. The SDK-backed
implementation now translates `AdapterRequest` into ADK `llmagent` runs while
the rest of the service continues to depend on package-local contracts.

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

## Current ADK Layer

Implemented in `apps/server-go/internal/ai`:

- `FilePromptLoader`: loads `apps/server/prompt/*.md`-style prompt files by safe
  prompt code and rejects path traversal.
- `RenderPrompt`: fills simple `{name}` placeholders while preserving escaped
  literal braces used in JSON examples.
- JSON helpers: extract fenced/raw JSON from model text, decode with
  `json.Decoder.UseNumber`, and accept single question, question arrays, or
  `{ "questions": [...] }` wrappers.
- Schema validation: verifies required content/answer fields, supported
  resource types, objective/subjective answer modes, rubrics, difficulty, and
  type-specific shapes for choice, judge, sorting, matching, and input.
- `ObjectiveAnswerEvaluator`: deterministic local scoring for objective
  choice/judge/input/sorting/matching answers. Subjective answers return
  `ErrRequiresAI` for the future ADK evaluator.
- `ADKAdapter`: wraps Google ADK Go `llmagent`, `runner`, in-memory sessions, and
  Gemini model configuration behind `Adapter.Invoke`.
- `ADKProvider`: exposes `QuestionGenerator`, `ReportGenerator`, and local
  objective `AnswerEvaluator` implementations to business modules.

## Remaining ADK Provider Points

- Add tool-backed RAG, image, audio, and OSS integrations.
- Route subjective/open/audio evaluation to an ADK-backed evaluator only after
  objective answers have been handled locally.
- Keep image/audio/RAG/OSS calls behind the tool interfaces in `tools.go`.
