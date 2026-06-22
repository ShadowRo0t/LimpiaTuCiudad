package logger

import (
	"log/slog"
	"os"
)

func New(level string) *slog.Logger {
	lv1 := slog.LevelInfo
	switch level {
	case "debug":
		lv1 = slog.LevelDebug
	case "warn":
		lv1 = slog.LevelWarn
	case "error":
		lv1 = slog.LevelError
	}

	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: lv1, AddSource: true}))
}
