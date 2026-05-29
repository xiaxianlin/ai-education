# Environment Variable Migration

The Go server keeps the Python service variable names so both services can run from the same deployment environment during migration.

Do not commit real `.env` files. Use `apps/server-go/.env.sample` as the Go template.

## Loading Order

`server-go` reads process environment first. If a key is already set, the local `.env` value will not override it.

When running from `apps/server-go`, `config.Load()` also reads:

```text
apps/server-go/.env
```

## Added Go-only Variable

| Variable | Default | Purpose |
| --- | --- | --- |
| `SERVER_ADDR` | `:7891` | Go API listen address during side-by-side migration. Python remains on `7890`. |

## Variables Kept Compatible with Python

### Application

| Variable | Go config field | Notes |
| --- | --- | --- |
| `RUN_ENV` | `App.RunEnv` | Defaults to `development`. |
| `TMP_DIR` | `App.TmpDir` | Defaults to `./tmp` in Go. |
| `LOG_DIR` | `App.LogDir` | Defaults to `./logs` in Go. |
| `APP_SECRET_KEY` | `App.SecretKey` | Used for token compatibility work. |
| `CORS_ORIGINS` | `App.CORSOrigins` | Comma-separated; `*` stays `[]string{"*"}`. |

### Admin Bootstrap

| Variable | Go config field |
| --- | --- |
| `ADMIN_USERNAME` | `Admin.Username` |
| `ADMIN_PASSWORD` | `Admin.Password` |

### Database

| Variable | Go config field | Default |
| --- | --- | --- |
| `DATABASE_URL` | `Database.URL` / `DatabaseURL` | empty |
| `DATABASE_POOL_SIZE` | `Database.PoolSize` | `20` |
| `DATABASE_MAX_OVERFLOW` | `Database.MaxOverflow` | `10` |
| `DATABASE_POOL_TIMEOUT` | `Database.PoolTimeout` | `30` |
| `DATABASE_POOL_RECYCLE` | `Database.PoolRecycle` | `3600` |

Python currently uses SQLAlchemy URLs such as `mysql+asyncmy://...`. The Go DB integration should either document a Go driver DSN or normalize the Python URL before opening the driver connection.

### Redis and Queue

| Variable | Go config field | Default |
| --- | --- | --- |
| `REDIS_URL` | `Redis.URL` | `redis://redis:6379/0` |
| `TASK_QUEUE_NAME` | `Task.QueueName` | `ai-education-task` |
| `TASK_TIMEOUT` | `Task.Timeout` | `1800` |
| `TASK_CONCURRENCY` | `Task.Concurrency` | `2` |
| `TASK_LOGLEVEL` | `Task.LogLevel` | `info` |

### Alibaba Cloud

| Variable | Go config field |
| --- | --- |
| `ALIYUN_ACCESS_KEY_ID` | `Aliyun.AccessKeyID` |
| `ALIYUN_ACCESS_KEY_SECRET` | `Aliyun.AccessKeySecret` |
| `ALIYUN_OSS_ENDPOINT` | `Aliyun.OSSEndpoint` |
| `ALIYUN_OSS_BUCKET` | `Aliyun.OSSBucket` |
| `ALIYUN_OSS_REGION` | `Aliyun.OSSRegion` |
| `ALIYUN_WORKSPACE_ID` | `Aliyun.WorkspaceID` |
| `ALIYUN_RAG_INDEX_ID` | `Aliyun.RAGIndexID` |
| `ALIYUN_RAG_CATEGORY_ID` | `Aliyun.RAGCategoryID` |

### AI Providers

| Variable | Go config field |
| --- | --- |
| `LLM_API_KEY` | `AI.LLM.APIKey` |
| `LLM_API_BASE` | `AI.LLM.APIBase` |
| `LLM_MODEL_NAME` | `AI.LLM.ModelName` |
| `IMAGE_API_KEY` | `AI.Image.APIKey` |
| `IMAGE_API_BASE` | `AI.Image.APIBase` |
| `IMAGE_MODEL_NAME` | `AI.Image.ModelName` |
| `TTS_API_KEY` | `AI.TTS.APIKey` |
| `TTS_API_BASE` | `AI.TTS.APIBase` |
| `TTS_MODEL_NAME` | `AI.TTS.ModelName` |
| `TTS_API_VOICE` | `AI.TTS.Voice` |
| `ASR_API_KEY` | `AI.ASR.APIKey` |
| `ASR_API_BASE` | `AI.ASR.APIBase` |
| `ASR_MODEL_NAME` | `AI.ASR.ModelName` |

