package question

import "context"

type Repository interface {
	QuestionRepository
	QuestionTypeRepository
}

type QuestionRepository interface {
	SearchQuestions(ctx context.Context, params QuestionSearch) ([]Question, int, error)
	GetQuestion(ctx context.Context, id string) (*Question, error)
	UpdateQuestion(ctx context.Context, id string, params QuestionUpdate) (*Question, error)
	DeleteQuestion(ctx context.Context, id string) error
}

type QuestionTypeRepository interface {
	CreateQuestionType(ctx context.Context, params QuestionTypeSave) (*QuestionType, error)
	UpdateQuestionType(ctx context.Context, id int64, params QuestionTypeSave) (*QuestionType, error)
	DeleteQuestionType(ctx context.Context, id int64) error
	SearchUnitPracticeTypes(ctx context.Context) ([]QuestionType, error)
	SearchAbilityPracticeTypes(ctx context.Context, params AbilityPracticeSearch) ([]QuestionType, error)
	GetQuestionTypeByCode(ctx context.Context, code string) (*QuestionType, error)
	UpdateQuestionTypeConfigs(ctx context.Context, code string, configs JSONMap) (*QuestionType, error)
}

type PromptStore interface {
	ReadPrompt(ctx context.Context, code string) (string, error)
	WritePrompt(ctx context.Context, code string, prompt string) error
}
