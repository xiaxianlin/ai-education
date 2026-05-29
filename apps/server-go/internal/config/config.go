package config

import "os"

type Config struct {
	ServerAddr  string
	RunEnv      string
	DatabaseURL string
}

func Load() Config {
	return Config{
		ServerAddr:  getEnv("SERVER_ADDR", ":7891"),
		RunEnv:      getEnv("RUN_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
