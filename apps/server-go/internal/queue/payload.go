package queue

import (
	"encoding/json"
	"errors"
)

const DefaultPracticeGenerateCount = 15

type PracticeGeneratePayload struct {
	SessionID     string `json:"session_id"`
	GenerateCount int    `json:"generate_count"`
}

type QuestionGeneratePayload struct {
	RequestID string          `json:"request_id,omitempty"`
	Code      string          `json:"code"`
	Params    json.RawMessage `json:"params,omitempty"`
}

type AnswerEvaluatePayload struct {
	SessionID  string          `json:"session_id"`
	QuestionID string          `json:"question_id"`
	StudentID  string          `json:"student_id,omitempty"`
	Answer     json.RawMessage `json:"answer"`
	TimeSpent  int             `json:"time_spent,omitempty"`
	AudioURL   string          `json:"audio_url,omitempty"`
}

type ReportGeneratePayload struct {
	SessionID string `json:"session_id"`
	StudentID string `json:"student_id,omitempty"`
}

func NewPracticeGenerateTask(payload PracticeGeneratePayload, opts ...TaskOption) (Task, error) {
	if payload.SessionID == "" {
		return Task{}, errors.New("practice generate payload requires session_id")
	}
	if payload.GenerateCount == 0 {
		payload.GenerateCount = DefaultPracticeGenerateCount
	}
	return NewTask(TaskPracticeGenerate, payload, opts...)
}

func NewQuestionGenerateTask(payload QuestionGeneratePayload, opts ...TaskOption) (Task, error) {
	if payload.Code == "" {
		return Task{}, errors.New("question generate payload requires code")
	}
	return NewTask(TaskQuestionGenerate, payload, opts...)
}

func NewAnswerEvaluateTask(payload AnswerEvaluatePayload, opts ...TaskOption) (Task, error) {
	if payload.SessionID == "" {
		return Task{}, errors.New("answer evaluate payload requires session_id")
	}
	if payload.QuestionID == "" {
		return Task{}, errors.New("answer evaluate payload requires question_id")
	}
	if len(payload.Answer) == 0 {
		return Task{}, errors.New("answer evaluate payload requires answer")
	}
	return NewTask(TaskAnswerEvaluate, payload, opts...)
}

func NewReportGenerateTask(payload ReportGeneratePayload, opts ...TaskOption) (Task, error) {
	if payload.SessionID == "" {
		return Task{}, errors.New("report generate payload requires session_id")
	}
	if payload.StudentID == "" {
		return Task{}, errors.New("report generate payload requires student_id")
	}
	return NewTask(TaskReportGenerate, payload, opts...)
}
