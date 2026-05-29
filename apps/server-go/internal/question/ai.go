package question

import "context"

type GenerateQuestionRequest struct {
	Code   string  `json:"code"`
	Params JSONMap `json:"params"`
}

type GeneratedQuestion struct {
	QuestionTypeCode string          `json:"question_type_code"`
	Subject          string          `json:"subject"`
	Grade            int             `json:"grade"`
	Content          QuestionContent `json:"content"`
	Answer           QuestionAnswer  `json:"answer"`
	Difficulty       string          `json:"difficulty,omitempty"`
}

type QuestionGenerator interface {
	GenerateQuestions(ctx context.Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error)
}
