package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"
)

func DecodeJSON[T any](raw string) (T, error) {
	var out T
	data, err := ExtractJSON(raw)
	if err != nil {
		return out, err
	}
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.UseNumber()
	if err := decoder.Decode(&out); err != nil {
		return out, fmt.Errorf("%w: %v", ErrInvalidAIJSON, err)
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		return out, fmt.Errorf("%w: multiple json values", ErrInvalidAIJSON)
	}
	return out, nil
}

func DecodeGeneratedQuestions(raw string) ([]GeneratedQuestion, error) {
	var wrapped struct {
		Questions []GeneratedQuestion `json:"questions"`
	}
	if err := decodeInto(raw, &wrapped); err == nil && wrapped.Questions != nil {
		return wrapped.Questions, nil
	}

	var structured struct {
		StructuredResponse struct {
			Questions []GeneratedQuestion `json:"questions"`
		} `json:"structured_response"`
	}
	if err := decodeInto(raw, &structured); err == nil && structured.StructuredResponse.Questions != nil {
		return structured.StructuredResponse.Questions, nil
	}

	var questions []GeneratedQuestion
	if err := decodeInto(raw, &questions); err == nil {
		return questions, nil
	}

	var question GeneratedQuestion
	if err := decodeInto(raw, &question); err != nil {
		return nil, err
	}
	return []GeneratedQuestion{question}, nil
}

func ExtractJSON(raw string) ([]byte, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, fmt.Errorf("%w: empty response", ErrInvalidAIJSON)
	}
	if fenced, ok := extractFencedJSON(raw); ok {
		raw = strings.TrimSpace(fenced)
	}
	start := strings.IndexAny(raw, "{[")
	if start < 0 {
		return nil, fmt.Errorf("%w: no json object or array", ErrInvalidAIJSON)
	}
	end, err := matchingJSONEnd(raw[start:])
	if err != nil {
		return nil, err
	}
	trailing := strings.TrimSpace(raw[start+end:])
	if strings.HasPrefix(trailing, "{") || strings.HasPrefix(trailing, "[") {
		return nil, fmt.Errorf("%w: multiple json values", ErrInvalidAIJSON)
	}
	return []byte(raw[start : start+end]), nil
}

func decodeInto(raw string, out any) error {
	data, err := ExtractJSON(raw)
	if err != nil {
		return err
	}
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.UseNumber()
	if err := decoder.Decode(out); err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidAIJSON, err)
	}
	return nil
}

func extractFencedJSON(raw string) (string, bool) {
	start := strings.Index(raw, "```")
	if start < 0 {
		return "", false
	}
	rest := raw[start+3:]
	newline := strings.IndexByte(rest, '\n')
	if newline < 0 {
		return "", false
	}
	lang := strings.TrimSpace(rest[:newline])
	if lang != "" && !strings.EqualFold(lang, "json") {
		return "", false
	}
	rest = rest[newline+1:]
	end := strings.Index(rest, "```")
	if end < 0 {
		return "", false
	}
	return rest[:end], true
}

func matchingJSONEnd(s string) (int, error) {
	var stack []byte
	inString := false
	escaped := false
	for i := 0; i < len(s); i++ {
		c := s[i]
		if inString {
			if escaped {
				escaped = false
				continue
			}
			switch c {
			case '\\':
				escaped = true
			case '"':
				inString = false
			}
			continue
		}
		switch c {
		case '"':
			inString = true
		case '{':
			stack = append(stack, '}')
		case '[':
			stack = append(stack, ']')
		case '}', ']':
			if len(stack) == 0 || stack[len(stack)-1] != c {
				return 0, fmt.Errorf("%w: unbalanced json delimiters", ErrInvalidAIJSON)
			}
			stack = stack[:len(stack)-1]
			if len(stack) == 0 {
				return i + 1, nil
			}
		}
	}
	return 0, fmt.Errorf("%w: incomplete json", ErrInvalidAIJSON)
}
