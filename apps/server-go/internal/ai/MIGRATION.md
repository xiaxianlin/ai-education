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

