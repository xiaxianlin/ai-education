package question

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type FilePromptStore struct {
	Dir string
}

func NewFilePromptStore(dir string) FilePromptStore {
	return FilePromptStore{Dir: dir}
}

func (s FilePromptStore) ReadPrompt(_ context.Context, code string) (string, error) {
	path, err := s.promptPath(code)
	if err != nil {
		return "", err
	}

	content, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func (s FilePromptStore) WritePrompt(_ context.Context, code string, prompt string) error {
	path, err := s.promptPath(code)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, []byte(prompt), 0o644)
}

func (s FilePromptStore) promptPath(code string) (string, error) {
	if strings.TrimSpace(s.Dir) == "" {
		return "", ErrPromptStoreNotConfigured
	}
	code = strings.TrimSpace(code)
	if code == "" || strings.Contains(code, "/") || strings.Contains(code, "\\") || code == "." || code == ".." {
		return "", ErrInvalidPromptCode
	}
	return filepath.Join(s.Dir, code+".md"), nil
}
