package ai_test

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"

	"ai-education/server-go/internal/ai"
)

func TestFilePromptLoaderLoadsPromptAndRejectsTraversal(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "choice.md"), []byte("学科：{subject}"), 0o644); err != nil {
		t.Fatalf("write prompt fixture: %v", err)
	}

	loader := ai.NewFilePromptLoader(dir)
	prompt, err := loader.LoadPrompt(context.Background(), "choice")
	if err != nil {
		t.Fatalf("LoadPrompt returned error: %v", err)
	}
	if prompt != "学科：{subject}" {
		t.Fatalf("unexpected prompt: %q", prompt)
	}

	if _, err := loader.LoadPrompt(context.Background(), "../choice"); !errors.Is(err, ai.ErrInvalidPromptCode) {
		t.Fatalf("expected ErrInvalidPromptCode, got %v", err)
	}
}

func TestRenderPromptReplacesParamsAndPreservesEscapedBraces(t *testing.T) {
	rendered, err := ai.RenderPrompt(`{{ "id": "A" }} 学科：{subject}，数量：{count}`, map[string]any{
		"subject": "数学",
		"count":   3,
	})
	if err != nil {
		t.Fatalf("RenderPrompt returned error: %v", err)
	}
	want := `{ "id": "A" } 学科：数学，数量：3`
	if rendered != want {
		t.Fatalf("unexpected rendered prompt:\nwant %q\ngot  %q", want, rendered)
	}
}

func TestDecodeGeneratedQuestionsAcceptsFencedWrappedJSON(t *testing.T) {
	raw := "模型输出：\n```json\n{\"questions\":[{\"question_type_code\":\"choice\",\"content\":{\"stem\":\"1+1=?\",\"options\":[{\"id\":\"A\",\"text\":\"1\"},{\"id\":\"B\",\"text\":\"2\"}]},\"answer\":{\"correct_value\":\"B\",\"analysis_mode\":\"objective\"},\"difficulty\":\"easy\"}]}\n```"

	questions, err := ai.DecodeGeneratedQuestions(raw)
	if err != nil {
		t.Fatalf("DecodeGeneratedQuestions returned error: %v", err)
	}
	if len(questions) != 1 {
		t.Fatalf("expected one question, got %d", len(questions))
	}
	if questions[0].Answer.CorrectValue != "B" {
		t.Fatalf("unexpected correct value: %#v", questions[0].Answer.CorrectValue)
	}
}

func TestDecodeJSONRejectsTrailingJSON(t *testing.T) {
	_, err := ai.DecodeJSON[map[string]any](`{"a":1} {"b":2}`)
	if !errors.Is(err, ai.ErrInvalidAIJSON) {
		t.Fatalf("expected ErrInvalidAIJSON, got %v", err)
	}
}
