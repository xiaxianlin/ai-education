package question_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"ai-education/server-go/internal/question"
	"ai-education/server-go/internal/response"
)

func TestHandlerSearchQuestionsParsesQuery(t *testing.T) {
	repo := &fakeRepository{}
	service := question.NewService(repo, question.ServiceOptions{})
	mux := http.NewServeMux()
	question.RegisterRoutes(mux, service)

	request := httptest.NewRequest(http.MethodGet, "/api/admin/question/search?subject=数学&grade=3&page=2&size=20&question_type_code=choice", nil)
	recorder := httptest.NewRecorder()
	mux.ServeHTTP(recorder, request)

	envelope := decodeEnvelope(t, recorder)
	if envelope.Status != 0 {
		t.Fatalf("unexpected response envelope: %+v", envelope)
	}
	if repo.lastQuestionSearch.Subject != "数学" || repo.lastQuestionSearch.Grade != 3 || repo.lastQuestionSearch.Page != 2 || repo.lastQuestionSearch.Size != 20 || repo.lastQuestionSearch.QuestionTypeCode != "choice" {
		t.Fatalf("handler parsed unexpected search params: %+v", repo.lastQuestionSearch)
	}
}

func TestHandlerQuestionTypePromptRoundTrip(t *testing.T) {
	store := &memoryPromptStore{prompts: make(map[string]string)}
	service := question.NewService(&fakeRepository{}, question.ServiceOptions{PromptStore: store})
	mux := http.NewServeMux()
	question.RegisterRoutes(mux, service)

	updateBody := bytes.NewBufferString(`{"prompt":"请生成一道选择题"}`)
	updateRequest := httptest.NewRequest(http.MethodPatch, "/api/admin/question/type/choice/prompt", updateBody)
	updateRecorder := httptest.NewRecorder()
	mux.ServeHTTP(updateRecorder, updateRequest)
	if envelope := decodeEnvelope(t, updateRecorder); envelope.Status != 0 {
		t.Fatalf("unexpected update response: %+v", envelope)
	}

	getRequest := httptest.NewRequest(http.MethodGet, "/api/admin/question/type/choice/prompt", nil)
	getRecorder := httptest.NewRecorder()
	mux.ServeHTTP(getRecorder, getRequest)
	envelope := decodeEnvelope(t, getRecorder)
	if envelope.Status != 0 {
		t.Fatalf("unexpected get response: %+v", envelope)
	}
	data, ok := envelope.Data.(map[string]any)
	if !ok || data["prompt"] != "请生成一道选择题" {
		t.Fatalf("unexpected prompt data: %+v", envelope.Data)
	}
}

func TestHandlerInvalidAbilityGradeReturnsBadRequestEnvelope(t *testing.T) {
	service := question.NewService(&fakeRepository{}, question.ServiceOptions{})
	mux := http.NewServeMux()
	question.RegisterRoutes(mux, service)

	request := httptest.NewRequest(http.MethodGet, "/api/admin/question/type/abilities?subject=数学&grade=bad", nil)
	recorder := httptest.NewRecorder()
	mux.ServeHTTP(recorder, request)

	envelope := decodeEnvelope(t, recorder)
	if envelope.Status != 400 {
		t.Fatalf("expected status 400 envelope, got %+v", envelope)
	}
}

type memoryPromptStore struct {
	prompts map[string]string
}

func (s *memoryPromptStore) ReadPrompt(_ context.Context, code string) (string, error) {
	return s.prompts[code], nil
}

func (s *memoryPromptStore) WritePrompt(_ context.Context, code string, prompt string) error {
	s.prompts[code] = prompt
	return nil
}

func decodeEnvelope(t *testing.T, recorder *httptest.ResponseRecorder) response.Envelope {
	t.Helper()
	var envelope response.Envelope
	if err := json.Unmarshal(recorder.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response body %q: %v", recorder.Body.String(), err)
	}
	return envelope
}
