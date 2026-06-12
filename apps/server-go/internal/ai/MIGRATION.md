# AI Migration

Owner: Agents 12-15

## Scope

Move AI behavior from Python LangChain/LangGraph utilities to Google ADK-backed Go interfaces.

## Interfaces

Business modules must depend on:

- `QuestionGenerator`
- `AnswerEvaluator`
- `ReportGenerator`

Do not call ADK directly from practice or question handlers.

## Python Sources

- `apps/server/shared/question/generate.py`
- `apps/server/shared/practice/answer.py`
- `apps/server/shared/practice/report.py`
- `apps/server/shared/util/ai.py`
- `apps/server/shared/util/oss.py`
- `apps/server/shared/util/rag.py`
- `apps/server/prompt/*.md`

## Known Gaps

- Current Python answer evaluation appears incomplete. Re-implement objective evaluators in Go before enabling AI scoring.
- Audio ASR endpoint contract is referenced by the frontend but not found in the current route set.

## Current Go Boundary

The first migration cut defines provider interfaces and typed schemas only. No Google ADK SDK dependency is imported yet, so the Go service can keep compiling without network-dependent dependency setup.

Files:

- `schema.go`: question generation, answer evaluation, and report generation request/response types.
- `tools.go`: prompt, RAG, image, audio, and upload tool interfaces.
- `noop.go`: `NoopProvider` and `StubProvider` for integration and tests.

## ADK Integration Point

The future Google ADK adapter should live behind the existing interfaces, for example:

```text
internal/ai/adk/
  provider.go
  question_generator.go
  answer_evaluator.go
  report_generator.go
```

Practice and question modules should depend only on the interfaces in package `ai`.
