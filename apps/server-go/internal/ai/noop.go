package ai

import "errors"

var ErrNotConfigured = errors.New("ai provider is not configured")

type NoopProvider struct{}

func (NoopProvider) GenerateQuestions(ctx Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error) {
	return nil, ErrNotConfigured
}

func (NoopProvider) EvaluateAnswer(ctx Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error) {
	return EvaluateAnswerResult{}, ErrNotConfigured
}

func (NoopProvider) GenerateReport(ctx Context, req GenerateReportRequest) (PracticeReportDraft, error) {
	return PracticeReportDraft{}, ErrNotConfigured
}

type StubProvider struct {
	Questions  []GeneratedQuestion
	Evaluation EvaluateAnswerResult
	Report     PracticeReportDraft
}

func (p StubProvider) GenerateQuestions(ctx Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error) {
	return p.Questions, nil
}

func (p StubProvider) EvaluateAnswer(ctx Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error) {
	return p.Evaluation, nil
}

func (p StubProvider) GenerateReport(ctx Context, req GenerateReportRequest) (PracticeReportDraft, error) {
	return p.Report, nil
}
