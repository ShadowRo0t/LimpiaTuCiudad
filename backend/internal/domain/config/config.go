package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	ServiceName string
	Env         string
	LogLevel    string

	HTTPAddr        string
	ShutdownTimeout time.Duration

	CORSOrigins []string

	MongoDBURI string
	MongoDB    string

	JWTSecret []byte

	MaxUploadMB int64
}

func Load() (Config, error) {
	cfg := Config{
		ServiceName:     getenv("SERVICE_NAME", "limpiatuciudad-api"),
		Env:             getenv("ENV", "dev"),
		LogLevel:        getenv("LOG_LEVEL", "info"),
		HTTPAddr:        getenv("HTTP_ADDR", ":3000"),
		ShutdownTimeout: getDuration("SHUTDOWN_TIMEOUT", 10*time.Second),

		CORSOrigins: splitCSV(os.Getenv("CORS_ORIGINS")),
		MongoDBURI:  getenv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:     getenv("MONGO_DB", "limpiatuciudad"),

		JWTSecret: []byte(os.Getenv("JWT_SECRET")),

		MaxUploadMB: int64(getInt("MAX_UPLOAD_MB", 10)),
	}
	return cfg, nil
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func splitCSV(s string) []string {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func getDuration(k string, def time.Duration) time.Duration {
	if v := os.Getenv(k); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}

func getInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		var n int
		_, _ = fmt.Sscanf(v, "%d", &n)
		if n > 0 {
			return n
		}
	}
	return def
}
