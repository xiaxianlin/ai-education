package question

import (
	"context"
	"errors"
	"strings"
)

const (
	QuestionTypeCategoryAbilityPractice = "ability_practice"
	QuestionTypeCategoryUnitPractice    = "unit_practice"
	defaultPage                         = 1
	defaultSize                         = 10
	maxPageSize                         = 100
)

var (
	ErrNotFound                 = errors.New("not found")
	ErrInvalidArgument          = errors.New("invalid argument")
	ErrPromptStoreNotConfigured = errors.New("prompt store not configured")
	ErrInvalidPromptCode        = errors.New("invalid prompt code")
)

type Service struct {
	repository Repository
	prompts    PromptStore
	generator  QuestionGenerator
}

type ServiceOptions struct {
	PromptStore       PromptStore
	QuestionGenerator QuestionGenerator
}

func NewService(repository Repository, options ServiceOptions) *Service {
	return &Service{
		repository: repository,
		prompts:    options.PromptStore,
		generator:  options.QuestionGenerator,
	}
}

func (s *Service) SearchQuestions(ctx context.Context, params QuestionSearch) (SearchResult[Question], error) {
	if err := s.requireRepository(); err != nil {
		return SearchResult[Question]{}, err
	}
	params.Page, params.Size = normalizePage(params.Page, params.Size)

	questions, total, err := s.repository.SearchQuestions(ctx, params)
	if err != nil {
		return SearchResult[Question]{}, err
	}
	return SearchResult[Question]{Total: total, Data: questions}, nil
}

func (s *Service) GetQuestion(ctx context.Context, id string) (*Question, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, ErrInvalidArgument
	}

	question, err := s.repository.GetQuestion(ctx, id)
	if err != nil {
		return nil, err
	}
	if question == nil {
		return nil, ErrNotFound
	}
	return question, nil
}

func (s *Service) UpdateQuestion(ctx context.Context, id string, params QuestionUpdate) (*Question, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, ErrInvalidArgument
	}

	question, err := s.repository.UpdateQuestion(ctx, id, params)
	if err != nil {
		return nil, err
	}
	if question == nil {
		return nil, ErrNotFound
	}
	return question, nil
}

func (s *Service) DeleteQuestion(ctx context.Context, id string) error {
	if err := s.requireRepository(); err != nil {
		return err
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return ErrInvalidArgument
	}
	return s.repository.DeleteQuestion(ctx, id)
}

func (s *Service) SaveQuestionType(ctx context.Context, params QuestionTypeSave) (*QuestionType, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	if err := validateQuestionTypeSave(params); err != nil {
		return nil, err
	}
	if params.ID != nil {
		return s.repository.UpdateQuestionType(ctx, *params.ID, params)
	}
	return s.repository.CreateQuestionType(ctx, params)
}

func (s *Service) DeleteQuestionType(ctx context.Context, id int64) error {
	if err := s.requireRepository(); err != nil {
		return err
	}
	if id <= 0 {
		return ErrInvalidArgument
	}
	return s.repository.DeleteQuestionType(ctx, id)
}

func (s *Service) SearchUnitPracticeTypes(ctx context.Context) ([]QuestionType, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	return s.repository.SearchUnitPracticeTypes(ctx)
}

func (s *Service) SearchAbilityPracticeTypes(ctx context.Context, params AbilityPracticeSearch) ([]QuestionType, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(params.Subject) == "" || params.Grade < 1 || params.Grade > 12 {
		return nil, ErrInvalidArgument
	}
	return s.repository.SearchAbilityPracticeTypes(ctx, params)
}

func (s *Service) GetQuestionTypeByCode(ctx context.Context, code string) (*QuestionType, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	code = strings.TrimSpace(code)
	if code == "" {
		return nil, ErrInvalidArgument
	}

	questionType, err := s.repository.GetQuestionTypeByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	if questionType == nil {
		return nil, ErrNotFound
	}
	return questionType, nil
}

func (s *Service) ReadPrompt(ctx context.Context, code string) (string, error) {
	if s.prompts == nil {
		return "", ErrPromptStoreNotConfigured
	}
	return s.prompts.ReadPrompt(ctx, code)
}

func (s *Service) WritePrompt(ctx context.Context, code string, prompt string) error {
	if s.prompts == nil {
		return ErrPromptStoreNotConfigured
	}
	return s.prompts.WritePrompt(ctx, code, prompt)
}

func (s *Service) UpdateQuestionTypeConfigs(ctx context.Context, code string, configs JSONMap) (*QuestionType, error) {
	if err := s.requireRepository(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(code) == "" || configs == nil {
		return nil, ErrInvalidArgument
	}

	questionType, err := s.repository.UpdateQuestionTypeConfigs(ctx, code, configs)
	if err != nil {
		return nil, err
	}
	if questionType == nil {
		return nil, ErrNotFound
	}
	return questionType, nil
}

func (s *Service) QuestionGenerator() QuestionGenerator {
	return s.generator
}

func (s *Service) requireRepository() error {
	if s == nil || s.repository == nil {
		return ErrInvalidArgument
	}
	return nil
}

func validateQuestionTypeSave(params QuestionTypeSave) error {
	if strings.TrimSpace(params.Code) == "" || strings.TrimSpace(params.Name) == "" {
		return ErrInvalidArgument
	}
	switch params.Category {
	case QuestionTypeCategoryAbilityPractice, QuestionTypeCategoryUnitPractice:
		return nil
	default:
		return ErrInvalidArgument
	}
}

func normalizePage(page int, size int) (int, int) {
	if page <= 0 {
		page = defaultPage
	}
	if size <= 0 {
		size = defaultSize
	}
	if size > maxPageSize {
		size = maxPageSize
	}
	return page, size
}
