package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	ServerAddr string

	App      AppConfig
	Admin    AdminConfig
	Aliyun   AliyunConfig
	Database DatabaseConfig
	Redis    RedisConfig
	Task     TaskConfig
	AI       AIConfig

	// Deprecated compatibility field for Wave 1 DB code. Prefer Database.URL.
	DatabaseURL string
}

type AppConfig struct {
	RunEnv       string
	TmpDir       string
	LogDir       string
	SecretKey    string
	CORSOrigins  []string
	CORSRawValue string
}

type AdminConfig struct {
	Username string
	Password string
}

type AliyunConfig struct {
	AccessKeyID     string
	AccessKeySecret string
	OSSEndpoint     string
	OSSBucket       string
	OSSRegion       string
	WorkspaceID     string
	RAGIndexID      string
	RAGCategoryID   string
}

type DatabaseConfig struct {
	URL         string
	PoolSize    int
	MaxOverflow int
	PoolTimeout int
	PoolRecycle int
}

type RedisConfig struct {
	URL string
}

type TaskConfig struct {
	QueueName   string
	Timeout     int
	Concurrency int
	LogLevel    string
}

type AIConfig struct {
	LLM   ModelConfig
	Image ModelConfig
	TTS   TTSConfig
	ASR   ModelConfig
}

type ModelConfig struct {
	APIKey    string
	APIBase   string
	ModelName string
}

type TTSConfig struct {
	APIKey    string
	APIBase   string
	ModelName string
	Voice     string
}

func Load() Config {
	LoadDotEnv(".env")

	databaseURL := getEnv("DATABASE_URL", "")
	return Config{
		ServerAddr: getEnv("SERVER_ADDR", ":7891"),
		App: AppConfig{
			RunEnv:       getEnv("RUN_ENV", "development"),
			TmpDir:       getEnv("TMP_DIR", "./tmp"),
			LogDir:       getEnv("LOG_DIR", "./logs"),
			SecretKey:    getEnv("APP_SECRET_KEY", ""),
			CORSRawValue: getEnv("CORS_ORIGINS", "*"),
			CORSOrigins:  parseCSV(getEnv("CORS_ORIGINS", "*")),
		},
		Admin: AdminConfig{
			Username: getEnv("ADMIN_USERNAME", ""),
			Password: getEnv("ADMIN_PASSWORD", ""),
		},
		Aliyun: AliyunConfig{
			AccessKeyID:     getEnv("ALIYUN_ACCESS_KEY_ID", ""),
			AccessKeySecret: getEnv("ALIYUN_ACCESS_KEY_SECRET", ""),
			OSSEndpoint:     getEnv("ALIYUN_OSS_ENDPOINT", ""),
			OSSBucket:       getEnv("ALIYUN_OSS_BUCKET", ""),
			OSSRegion:       getEnv("ALIYUN_OSS_REGION", ""),
			WorkspaceID:     getEnv("ALIYUN_WORKSPACE_ID", ""),
			RAGIndexID:      getEnv("ALIYUN_RAG_INDEX_ID", ""),
			RAGCategoryID:   getEnv("ALIYUN_RAG_CATEGORY_ID", ""),
		},
		Database: DatabaseConfig{
			URL:         databaseURL,
			PoolSize:    getEnvInt("DATABASE_POOL_SIZE", 20),
			MaxOverflow: getEnvInt("DATABASE_MAX_OVERFLOW", 10),
			PoolTimeout: getEnvInt("DATABASE_POOL_TIMEOUT", 30),
			PoolRecycle: getEnvInt("DATABASE_POOL_RECYCLE", 3600),
		},
		Redis: RedisConfig{
			URL: getEnv("REDIS_URL", "redis://redis:6379/0"),
		},
		Task: TaskConfig{
			QueueName:   getEnv("TASK_QUEUE_NAME", "ai-education-task"),
			Timeout:     getEnvInt("TASK_TIMEOUT", 1800),
			Concurrency: getEnvInt("TASK_CONCURRENCY", 2),
			LogLevel:    getEnv("TASK_LOGLEVEL", "info"),
		},
		AI: AIConfig{
			LLM: ModelConfig{
				APIKey:    getEnv("LLM_API_KEY", ""),
				APIBase:   getEnv("LLM_API_BASE", ""),
				ModelName: getEnv("LLM_MODEL_NAME", ""),
			},
			Image: ModelConfig{
				APIKey:    getEnv("IMAGE_API_KEY", ""),
				APIBase:   getEnv("IMAGE_API_BASE", ""),
				ModelName: getEnv("IMAGE_MODEL_NAME", ""),
			},
			TTS: TTSConfig{
				APIKey:    getEnv("TTS_API_KEY", ""),
				APIBase:   getEnv("TTS_API_BASE", ""),
				ModelName: getEnv("TTS_MODEL_NAME", ""),
				Voice:     getEnv("TTS_API_VOICE", ""),
			},
			ASR: ModelConfig{
				APIKey:    getEnv("ASR_API_KEY", ""),
				APIBase:   getEnv("ASR_API_BASE", ""),
				ModelName: getEnv("ASR_MODEL_NAME", ""),
			},
		},
		DatabaseURL: databaseURL,
	}
}

func LoadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		key, value, ok := parseDotEnvLine(scanner.Text())
		if !ok {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		_ = os.Setenv(key, value)
	}
}

func parseDotEnvLine(line string) (string, string, bool) {
	line = strings.TrimSpace(line)
	if line == "" || strings.HasPrefix(line, "#") {
		return "", "", false
	}
	line = strings.TrimPrefix(line, "export ")

	key, value, found := strings.Cut(line, "=")
	if !found {
		return "", "", false
	}
	key = strings.TrimSpace(key)
	if key == "" {
		return "", "", false
	}

	value = strings.TrimSpace(value)
	if len(value) >= 2 {
		quote := value[0]
		if (quote == '\'' || quote == '"') && value[len(value)-1] == quote {
			value = value[1 : len(value)-1]
		}
	}
	return key, value, true
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func parseCSV(value string) []string {
	if value == "" {
		return nil
	}
	if value == "*" {
		return []string{"*"}
	}
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
