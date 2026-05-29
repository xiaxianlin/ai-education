package config

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestLoadDotEnvKeepsExistingEnvironment(t *testing.T) {
	t.Setenv("RUN_ENV", "production")

	dir := t.TempDir()
	envPath := filepath.Join(dir, ".env")
	if err := os.WriteFile(envPath, []byte("RUN_ENV=development\nAPP_SECRET_KEY='secret'\n"), 0o600); err != nil {
		t.Fatal(err)
	}

	LoadDotEnv(envPath)

	if got := os.Getenv("RUN_ENV"); got != "production" {
		t.Fatalf("RUN_ENV = %q, want production", got)
	}
	if got := os.Getenv("APP_SECRET_KEY"); got != "secret" {
		t.Fatalf("APP_SECRET_KEY = %q, want secret", got)
	}
}

func TestLoadMapsPythonEnvironment(t *testing.T) {
	t.Setenv("SERVER_ADDR", ":9999")
	t.Setenv("RUN_ENV", "test")
	t.Setenv("TMP_DIR", "/tmp/app")
	t.Setenv("LOG_DIR", "/tmp/log")
	t.Setenv("APP_SECRET_KEY", "secret")
	t.Setenv("CORS_ORIGINS", "http://a.test, http://b.test")
	t.Setenv("ADMIN_USERNAME", "root")
	t.Setenv("ADMIN_PASSWORD", "password")
	t.Setenv("DATABASE_URL", "mysql://user:pass@localhost:3306/db")
	t.Setenv("DATABASE_POOL_SIZE", "7")
	t.Setenv("DATABASE_MAX_OVERFLOW", "3")
	t.Setenv("DATABASE_POOL_TIMEOUT", "11")
	t.Setenv("DATABASE_POOL_RECYCLE", "22")
	t.Setenv("REDIS_URL", "redis://localhost:6379/1")
	t.Setenv("TASK_QUEUE_NAME", "queue")
	t.Setenv("TASK_TIMEOUT", "99")
	t.Setenv("TASK_CONCURRENCY", "4")
	t.Setenv("TASK_LOGLEVEL", "debug")
	t.Setenv("ALIYUN_ACCESS_KEY_ID", "ak")
	t.Setenv("ALIYUN_ACCESS_KEY_SECRET", "sk")
	t.Setenv("ALIYUN_OSS_ENDPOINT", "endpoint")
	t.Setenv("ALIYUN_OSS_BUCKET", "bucket")
	t.Setenv("ALIYUN_OSS_REGION", "region")
	t.Setenv("ALIYUN_WORKSPACE_ID", "workspace")
	t.Setenv("ALIYUN_RAG_INDEX_ID", "index")
	t.Setenv("ALIYUN_RAG_CATEGORY_ID", "category")
	t.Setenv("LLM_API_KEY", "llm-key")
	t.Setenv("LLM_API_BASE", "llm-base")
	t.Setenv("LLM_MODEL_NAME", "llm-model")
	t.Setenv("IMAGE_API_KEY", "image-key")
	t.Setenv("IMAGE_API_BASE", "image-base")
	t.Setenv("IMAGE_MODEL_NAME", "image-model")
	t.Setenv("TTS_API_KEY", "tts-key")
	t.Setenv("TTS_API_BASE", "tts-base")
	t.Setenv("TTS_MODEL_NAME", "tts-model")
	t.Setenv("TTS_API_VOICE", "voice")
	t.Setenv("ASR_API_KEY", "asr-key")
	t.Setenv("ASR_API_BASE", "asr-base")
	t.Setenv("ASR_MODEL_NAME", "asr-model")

	cfg := Load()

	if cfg.ServerAddr != ":9999" || cfg.App.RunEnv != "test" {
		t.Fatalf("basic app config not loaded: %+v", cfg)
	}
	if !reflect.DeepEqual(cfg.App.CORSOrigins, []string{"http://a.test", "http://b.test"}) {
		t.Fatalf("CORSOrigins = %#v", cfg.App.CORSOrigins)
	}
	if cfg.Database.URL != "mysql://user:pass@localhost:3306/db" || cfg.DatabaseURL != cfg.Database.URL {
		t.Fatalf("database url not mapped: %+v", cfg.Database)
	}
	if cfg.Database.PoolSize != 7 || cfg.Database.MaxOverflow != 3 || cfg.Database.PoolTimeout != 11 || cfg.Database.PoolRecycle != 22 {
		t.Fatalf("database pool config not mapped: %+v", cfg.Database)
	}
	if cfg.Redis.URL != "redis://localhost:6379/1" || cfg.Task.QueueName != "queue" || cfg.Task.Concurrency != 4 {
		t.Fatalf("redis/task config not mapped: redis=%+v task=%+v", cfg.Redis, cfg.Task)
	}
	if cfg.Aliyun.AccessKeyID != "ak" || cfg.Aliyun.RAGCategoryID != "category" {
		t.Fatalf("aliyun config not mapped: %+v", cfg.Aliyun)
	}
	if cfg.AI.LLM.ModelName != "llm-model" || cfg.AI.Image.APIBase != "image-base" || cfg.AI.TTS.Voice != "voice" || cfg.AI.ASR.APIKey != "asr-key" {
		t.Fatalf("ai config not mapped: %+v", cfg.AI)
	}
}

func TestLoadUsesDefaultsForInvalidIntegers(t *testing.T) {
	t.Setenv("DATABASE_POOL_SIZE", "not-a-number")
	t.Setenv("TASK_CONCURRENCY", "also-bad")

	cfg := Load()

	if cfg.Database.PoolSize != 20 {
		t.Fatalf("Database.PoolSize = %d, want default 20", cfg.Database.PoolSize)
	}
	if cfg.Task.Concurrency != 2 {
		t.Fatalf("Task.Concurrency = %d, want default 2", cfg.Task.Concurrency)
	}
}
