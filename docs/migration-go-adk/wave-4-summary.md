# Wave 4 Summary

Wave 4 moves the Go backend beyond DB-backed reads into AI-backed practice generation.

## Completed

- Added the official Google ADK Go SDK dependency: `google.golang.org/adk`.
- Implemented an ADK-backed adapter/provider under `apps/server-go/internal/ai`.
- Implemented generated practice persistence into `ah_question` and `ah_practice_answer`.
- Registered real `practice.generate` handling in the Go API with in-process task dispatch.
- Mounted DB-backed textbook, mastery/statistics, and practice student routes when DB is available.
- Updated practice handlers to resolve the current student through the auth token instead of treating the token value as `student_id`.
- Added SQL repositories and tests for textbook and mastery.

## Runtime Notes

- `pnpm dev:server` remains pointed at `apps/server-go`.
- Frozen legacy server remains available only through explicitly named legacy scripts.
- If ADK config is missing or invalid, generation tasks fail the practice with `generate_status=-1` instead of silently staying pending.
- External Redis/queue worker parity is not required for the default Go API path; the current Go API dispatches generation tasks in-process.

## Verification

```bash
cd apps/server-go
GOCACHE=/private/tmp/ai-education-go-build-cache go test ./...
GOCACHE=/private/tmp/ai-education-go-build-cache go build ./cmd/api ./cmd/worker
SERVER_ADDR=:7892 GOCACHE=/private/tmp/ai-education-go-build-cache go run ./cmd/api
curl -s http://127.0.0.1:7892/health
curl -s http://127.0.0.1:7892/api/student/check
```

The test and build commands passed. The smoke check returned Go health OK and the expected unauthenticated student check response.

## Remaining Critical Path

1. Migrate admin mutation routes that still depend on Frozen legacy-only upload, parse, RAG, and OSS flows.
2. Add ADK tools for RAG lookup, image generation, audio generation, OSS upload, and generated asset persistence.
3. Replace in-process dispatch with a Redis-backed Go queue worker when deployment needs out-of-process background jobs.
4. Run authenticated frontend smoke tests through admin and student web apps.
