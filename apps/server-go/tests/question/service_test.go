package question_test

import (
	"context"
	"errors"
	"testing"

	"ai-education/server-go/internal/question"
)

func TestSearchQuestionsNormalizesPagination(t *testing.T) {
	repo := &fakeRepository{}
	service := question.NewService(repo, question.ServiceOptions{})

	result, err := service.SearchQuestions(context.Background(), question.QuestionSearch{
		Page: -1,
		Size: 999,
	})
	if err != nil {
		t.Fatalf("SearchQuestions returned error: %v", err)
	}

	if repo.lastQuestionSearch.Page != 1 {
		t.Fatalf("expected page 1, got %d", repo.lastQuestionSearch.Page)
	}
	if repo.lastQuestionSearch.Size != 100 {
		t.Fatalf("expected capped size 100, got %d", repo.lastQuestionSearch.Size)
	}
	if result.Total != 1 || len(result.Data) != 1 {
		t.Fatalf("unexpected search result: %+v", result)
	}
}

func TestGetQuestionReturnsNotFoundForNilRepositoryResult(t *testing.T) {
	service := question.NewService(&fakeRepository{}, question.ServiceOptions{})

	_, err := service.GetQuestion(context.Background(), "missing")
	if !errors.Is(err, question.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestSaveQuestionTypeChoosesCreateOrUpdate(t *testing.T) {
	repo := &fakeRepository{}
	service := question.NewService(repo, question.ServiceOptions{})

	_, err := service.SaveQuestionType(context.Background(), question.QuestionTypeSave{
		Code:     "choice",
		Name:     "选择题",
		Category: question.QuestionTypeCategoryUnitPractice,
	})
	if err != nil {
		t.Fatalf("create SaveQuestionType returned error: %v", err)
	}
	if !repo.createdQuestionType {
		t.Fatal("expected CreateQuestionType to be called")
	}

	id := int64(7)
	_, err = service.SaveQuestionType(context.Background(), question.QuestionTypeSave{
		ID:       &id,
		Code:     "choice",
		Name:     "选择题",
		Category: question.QuestionTypeCategoryUnitPractice,
	})
	if err != nil {
		t.Fatalf("update SaveQuestionType returned error: %v", err)
	}
	if repo.updatedQuestionTypeID != id {
		t.Fatalf("expected UpdateQuestionType id %d, got %d", id, repo.updatedQuestionTypeID)
	}
}

func TestServiceQuestionUpdateDeleteAndConfigs(t *testing.T) {
	repo := &fakeRepository{}
	service := question.NewService(repo, question.ServiceOptions{})
	explanation := "答案解析"

	updated, err := service.UpdateQuestion(context.Background(), "q1", question.QuestionUpdate{Explanation: &explanation})
	if err != nil {
		t.Fatalf("UpdateQuestion returned error: %v", err)
	}
	if updated.ID != "q1" || repo.updatedQuestionID != "q1" || repo.lastQuestionUpdate.Explanation == nil || *repo.lastQuestionUpdate.Explanation != explanation {
		t.Fatalf("unexpected update state: question=%+v repo=%+v", updated, repo)
	}

	if err := service.DeleteQuestion(context.Background(), "q1"); err != nil {
		t.Fatalf("DeleteQuestion returned error: %v", err)
	}
	if repo.deletedQuestionID != "q1" {
		t.Fatalf("expected DeleteQuestion id q1, got %q", repo.deletedQuestionID)
	}

	configs := question.JSONMap{"max_options": 4}
	questionType, err := service.UpdateQuestionTypeConfigs(context.Background(), "choice", configs)
	if err != nil {
		t.Fatalf("UpdateQuestionTypeConfigs returned error: %v", err)
	}
	if questionType.Configs["max_options"] != 4 {
		t.Fatalf("unexpected configs: %+v", questionType.Configs)
	}
}

func TestServiceSearchAbilityPracticeTypesValidatesRequiredFilters(t *testing.T) {
	service := question.NewService(&fakeRepository{}, question.ServiceOptions{})

	_, err := service.SearchAbilityPracticeTypes(context.Background(), question.AbilityPracticeSearch{Subject: "", Grade: 3})
	if !errors.Is(err, question.ErrInvalidArgument) {
		t.Fatalf("expected ErrInvalidArgument for empty subject, got %v", err)
	}

	_, err = service.SearchAbilityPracticeTypes(context.Background(), question.AbilityPracticeSearch{Subject: "数学", Grade: 13})
	if !errors.Is(err, question.ErrInvalidArgument) {
		t.Fatalf("expected ErrInvalidArgument for invalid grade, got %v", err)
	}
}

func TestPromptStoreRoundTrip(t *testing.T) {
	store := question.NewFilePromptStore(t.TempDir())

	err := store.WritePrompt(context.Background(), "choice", "生成一道选择题")
	if err != nil {
		t.Fatalf("WritePrompt returned error: %v", err)
	}

	prompt, err := store.ReadPrompt(context.Background(), "choice")
	if err != nil {
		t.Fatalf("ReadPrompt returned error: %v", err)
	}
	if prompt != "生成一道选择题" {
		t.Fatalf("unexpected prompt: %q", prompt)
	}
}

type fakeRepository struct {
	lastQuestionSearch    question.QuestionSearch
	lastQuestionUpdate    question.QuestionUpdate
	updatedQuestionID     string
	deletedQuestionID     string
	createdQuestionType   bool
	updatedQuestionTypeID int64
}

func (r *fakeRepository) SearchQuestions(_ context.Context, params question.QuestionSearch) ([]question.Question, int, error) {
	r.lastQuestionSearch = params
	return []question.Question{{ID: "q1"}}, 1, nil
}

func (r *fakeRepository) GetQuestion(_ context.Context, id string) (*question.Question, error) {
	if id == "q1" {
		return &question.Question{ID: id}, nil
	}
	return nil, nil
}

func (r *fakeRepository) UpdateQuestion(_ context.Context, id string, params question.QuestionUpdate) (*question.Question, error) {
	r.updatedQuestionID = id
	r.lastQuestionUpdate = params
	return &question.Question{ID: id}, nil
}

func (r *fakeRepository) DeleteQuestion(_ context.Context, id string) error {
	r.deletedQuestionID = id
	return nil
}

func (r *fakeRepository) CreateQuestionType(_ context.Context, params question.QuestionTypeSave) (*question.QuestionType, error) {
	r.createdQuestionType = true
	return &question.QuestionType{ID: 1, Code: params.Code, Name: params.Name, Category: params.Category}, nil
}

func (r *fakeRepository) UpdateQuestionType(_ context.Context, id int64, params question.QuestionTypeSave) (*question.QuestionType, error) {
	r.updatedQuestionTypeID = id
	return &question.QuestionType{ID: id, Code: params.Code, Name: params.Name, Category: params.Category}, nil
}

func (r *fakeRepository) DeleteQuestionType(_ context.Context, _ int64) error {
	return nil
}

func (r *fakeRepository) SearchUnitPracticeTypes(_ context.Context) ([]question.QuestionType, error) {
	return []question.QuestionType{{Code: "choice"}}, nil
}

func (r *fakeRepository) SearchAbilityPracticeTypes(_ context.Context, _ question.AbilityPracticeSearch) ([]question.QuestionType, error) {
	return []question.QuestionType{{Code: "choice"}}, nil
}

func (r *fakeRepository) GetQuestionTypeByCode(_ context.Context, code string) (*question.QuestionType, error) {
	return &question.QuestionType{Code: code}, nil
}

func (r *fakeRepository) UpdateQuestionTypeConfigs(_ context.Context, code string, configs question.JSONMap) (*question.QuestionType, error) {
	return &question.QuestionType{Code: code, Configs: configs}, nil
}
