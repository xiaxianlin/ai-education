# Known Contract Gaps

These gaps must be resolved before the related route is cut over to Go.

## Student Practice Create

Frontend calls:

- `POST /api/student/practice/create`

Current Frozen legacy route returns `request.state.student` and does not create a practice session. The Go implementation must define the real contract:

```json
{
  "session_id": "uuid",
  "message": "练习会话创建成功，正在生成题目"
}
```

For frontend compatibility, the web client should consume `session_id` explicitly.

## Student Practice Progress

Frontend calls:

- `GET /api/student/practice/progress/{session_id}`

No current Frozen legacy route was found. The Go implementation should return:

```json
{
  "progress": 0,
  "step": "generating",
  "message": "练习正在生成中"
}
```

Progress may initially be derived from `ah_practice.generate_status`.

## Audio ASR

Frontend calls:

- `POST /api/student/practice/answer/audio/asr`

No current Frozen legacy route was found. Keep this on Frozen legacy only if an implementation exists elsewhere; otherwise implement as part of the Google ADK/audio workstream.

## Mobile Answer Path

Mobile client calls:

- `POST /api/student/practice/submit`

Web client calls:

- `POST /api/student/practice/answer`

Go should standardize on `/practice/answer`. Mobile should be aligned or Go should provide a temporary compatibility alias.

## Answer Evaluation Placeholder

`historical-backend/shared/practice/answer.go` currently contains placeholder-like evaluation behavior and inconsistent dict/object access. The Go migration should implement answer evaluation from first principles:

- local deterministic evaluation for objective question types
- Google ADK evaluation for subjective/open/audio answers

