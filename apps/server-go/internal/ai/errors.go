package ai

import "errors"

var (
	ErrInvalidPromptCode = errors.New("invalid prompt code")
	ErrPromptNotFound    = errors.New("prompt not found")
	ErrInvalidAIJSON     = errors.New("invalid ai json")
	ErrInvalidSchema     = errors.New("invalid generated question schema")
	ErrRequiresAI        = errors.New("answer requires ai evaluation")
)
