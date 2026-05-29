# Practice API Contract

Base path: `/api/student/practice`

## State Model

`generate_status` must be checked before `status`.

```text
generate_status:
  0 generating
  1 completed
 -1 failed

status:
  0 not_started
  1 in_progress
  2 completed
  3 abandoned
```

## Student Endpoints

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/` | Pending Go migration | Agent 10 |
| POST | `/create` | Contract gap | Agent 10 |
| GET | `/statistics` | Pending Go migration | Agent 9 |
| GET | `/records` | Pending Go migration | Agent 10 |
| GET | `/{session_id}` | Pending Go migration | Agent 10 |
| POST | `/{session_id}/begin` | Pending Go migration | Agent 10 |
| POST | `/{session_id}/complete` | Pending Go migration | Agent 10 |
| POST | `/answer` | Pending Go migration | Agent 10 + Agent 14 |
| GET | `/progress/{session_id}` | Contract gap | Agent 10 |
| POST | `/answer/audio/asr` | Contract gap | Agent 14 |

## Create Practice Request

```json
{
  "type": "ability_practice",
  "ability_code": "string",
  "subject": "数学",
  "grade": 3
}
```

or:

```json
{
  "type": "unit_practice",
  "unit_id": 1
}
```

Target response:

```json
{
  "session_id": "uuid",
  "message": "练习会话创建成功，正在生成题目"
}
```

## Submit Answer Request

```json
{
  "session_id": "uuid",
  "question_id": "uuid",
  "answer": {},
  "time_spent": 30,
  "audio_url": "optional"
}
```

Target response is `PracticeAnswer`.

## Progress Response

```json
{
  "progress": 0,
  "step": "generating",
  "message": "练习正在生成中"
}
```

Initial mapping:

- `generate_status = 0`: progress `0`
- `generate_status = 1`: progress `100`
- `generate_status = -1`: progress `0`, step `failed`

