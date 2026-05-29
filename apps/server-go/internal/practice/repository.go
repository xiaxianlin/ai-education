package practice

import (
	"context"
	"sort"
	"sync"

	"ai-education/server-go/internal/ai"
)

type Repository interface {
	CreatePractice(ctx context.Context, session Practice) (Practice, error)
	GetOpenPractice(ctx context.Context, studentID string, practiceType string, abilityCode string, unitID int64) (*Practice, error)
	GetPractice(ctx context.Context, studentID string, sessionID string) (*Practice, error)
	GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error)
	ListPractices(ctx context.Context, params PracticeListParams) (PracticeListResult, error)
	UpdatePractice(ctx context.Context, session Practice) error
	PersistGeneratedPractice(ctx context.Context, sessionID string, questions []ai.GeneratedQuestion, generateTime *int) (Practice, error)
	GetPracticeData(ctx context.Context, studentID string, sessionID string) (PracticeData, error)
	GetAnswer(ctx context.Context, studentID string, sessionID string, questionID string) (*PracticeAnswer, error)
	UpdateAnswer(ctx context.Context, answer PracticeAnswer) error
	CreateReport(ctx context.Context, report PracticeReport) (PracticeReport, error)
}

type MemoryRepository struct {
	mu           sync.Mutex
	practices    map[string]Practice
	questions    map[string]PracticeQuestion
	answers      map[string]PracticeAnswer
	reports      map[string]PracticeReport
	nextAnswerID int64
	nextReportID int64
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		practices: make(map[string]Practice),
		questions: make(map[string]PracticeQuestion),
		answers:   make(map[string]PracticeAnswer),
		reports:   make(map[string]PracticeReport),
	}
}

func (repo *MemoryRepository) CreatePractice(ctx context.Context, session Practice) (Practice, error) {
	if err := ctx.Err(); err != nil {
		return Practice{}, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	repo.practices[session.ID] = session
	return session, nil
}

func (repo *MemoryRepository) GetOpenPractice(ctx context.Context, studentID string, practiceType string, abilityCode string, unitID int64) (*Practice, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	var latest *Practice
	for _, item := range repo.practices {
		if item.StudentID != studentID || item.PracticeType != practiceType || item.Status == PracticeStatusCompleted {
			continue
		}
		if practiceType == PracticeTypeAbility && item.AbilityCode != abilityCode {
			continue
		}
		if practiceType == PracticeTypeUnit && item.UnitID != unitID {
			continue
		}
		copy := item
		if latest == nil || copy.CreateTime > latest.CreateTime {
			latest = &copy
		}
	}
	return latest, nil
}

func (repo *MemoryRepository) GetPractice(ctx context.Context, studentID string, sessionID string) (*Practice, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	session, ok := repo.practices[sessionID]
	if !ok {
		return nil, ErrNotFound
	}
	if session.StudentID != studentID {
		return nil, ErrForbidden
	}
	return &session, nil
}

func (repo *MemoryRepository) GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	session, ok := repo.practices[sessionID]
	if !ok {
		return nil, ErrNotFound
	}
	return &session, nil
}

func (repo *MemoryRepository) ListPractices(ctx context.Context, params PracticeListParams) (PracticeListResult, error) {
	if err := ctx.Err(); err != nil {
		return PracticeListResult{}, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	items := make([]Practice, 0, len(repo.practices))
	for _, item := range repo.practices {
		if item.StudentID != params.StudentID {
			continue
		}
		if params.PracticeType != "" && item.PracticeType != params.PracticeType {
			continue
		}
		if params.Subject != "" && item.Subject != params.Subject {
			continue
		}
		if params.Grade != 0 && item.Grade != params.Grade {
			continue
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreateTime > items[j].CreateTime
	})

	page := params.Page
	if page <= 0 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize <= 0 {
		pageSize = 20
	}
	start := (page - 1) * pageSize
	if start > len(items) {
		start = len(items)
	}
	end := start + pageSize
	if end > len(items) {
		end = len(items)
	}

	return PracticeListResult{
		Data:     append([]Practice(nil), items[start:end]...),
		Total:    len(items),
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (repo *MemoryRepository) UpdatePractice(ctx context.Context, session Practice) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	if _, ok := repo.practices[session.ID]; !ok {
		return ErrNotFound
	}
	repo.practices[session.ID] = session
	return nil
}

func (repo *MemoryRepository) PersistGeneratedPractice(ctx context.Context, sessionID string, questions []ai.GeneratedQuestion, generateTime *int) (Practice, error) {
	if err := ctx.Err(); err != nil {
		return Practice{}, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	session, ok := repo.practices[sessionID]
	if !ok {
		return Practice{}, ErrNotFound
	}

	for key, answer := range repo.answers {
		if answer.SessionID == sessionID {
			delete(repo.answers, key)
		}
	}

	now := unixNow()
	for index, question := range questions {
		practiceQuestion := PracticeQuestion{
			ID:               question.ID,
			QuestionTypeCode: question.QuestionTypeCode,
			Subject:          question.Subject,
			Grade:            question.Grade,
			Content:          question.Content,
			Answer:           question.Answer,
			Difficulty:       question.Difficulty,
			CreateTime:       now,
			UpdateTime:       now,
		}
		repo.questions[practiceQuestion.ID] = practiceQuestion

		repo.nextAnswerID++
		answer := PracticeAnswer{
			ID:            repo.nextAnswerID,
			SessionID:     session.ID,
			QuestionID:    practiceQuestion.ID,
			StudentID:     session.StudentID,
			QuestionOrder: index + 1,
			Status:        AnswerStatusUnanswered,
			CreateTime:    now,
			UpdateTime:    now,
		}
		repo.answers[answerKey(session.ID, practiceQuestion.ID)] = answer
	}

	session.QuestionCount = len(questions)
	session.GenerateStatus = GenerateStatusCompleted
	session.GenerateTime = generateTime
	session.UpdateTime = now
	repo.practices[session.ID] = session
	return session, nil
}

func (repo *MemoryRepository) GetPracticeData(ctx context.Context, studentID string, sessionID string) (PracticeData, error) {
	if err := ctx.Err(); err != nil {
		return PracticeData{}, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	session, ok := repo.practices[sessionID]
	if !ok {
		return PracticeData{}, ErrNotFound
	}
	if session.StudentID != studentID {
		return PracticeData{}, ErrForbidden
	}

	answers := make([]PracticeAnswer, 0)
	for _, answer := range repo.answers {
		if answer.SessionID != sessionID {
			continue
		}
		if question, ok := repo.questions[answer.QuestionID]; ok {
			answer.Question = &question
		}
		answers = append(answers, answer)
	}
	sort.Slice(answers, func(i, j int) bool {
		return answers[i].QuestionOrder < answers[j].QuestionOrder
	})
	questions := make([]PracticeQuestion, 0, len(answers))
	for _, answer := range answers {
		if answer.Question != nil {
			questions = append(questions, *answer.Question)
		}
	}

	var report *PracticeReport
	if stored, ok := repo.reports[sessionID]; ok {
		copy := stored
		report = &copy
	}

	return PracticeData{
		Session:   session,
		Questions: questions,
		Answers:   answers,
		Report:    report,
	}, nil
}

func (repo *MemoryRepository) GetAnswer(ctx context.Context, studentID string, sessionID string, questionID string) (*PracticeAnswer, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	session, ok := repo.practices[sessionID]
	if !ok {
		return nil, ErrNotFound
	}
	if session.StudentID != studentID {
		return nil, ErrForbidden
	}

	key := answerKey(sessionID, questionID)
	answer, ok := repo.answers[key]
	if !ok {
		return nil, ErrNotFound
	}
	if question, ok := repo.questions[questionID]; ok {
		answer.Question = &question
	}
	return &answer, nil
}

func (repo *MemoryRepository) UpdateAnswer(ctx context.Context, answer PracticeAnswer) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	key := answerKey(answer.SessionID, answer.QuestionID)
	if _, ok := repo.answers[key]; !ok {
		return ErrNotFound
	}
	repo.answers[key] = answer
	return nil
}

func (repo *MemoryRepository) CreateReport(ctx context.Context, report PracticeReport) (PracticeReport, error) {
	if err := ctx.Err(); err != nil {
		return PracticeReport{}, err
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()

	if stored, ok := repo.reports[report.SessionID]; ok {
		return stored, nil
	}
	repo.nextReportID++
	report.ID = repo.nextReportID
	repo.reports[report.SessionID] = report
	return report, nil
}

func (repo *MemoryRepository) SeedQuestion(question PracticeQuestion) {
	repo.mu.Lock()
	defer repo.mu.Unlock()
	repo.questions[question.ID] = question
}

func (repo *MemoryRepository) SeedAnswer(answer PracticeAnswer) {
	repo.mu.Lock()
	defer repo.mu.Unlock()
	if answer.ID == 0 {
		repo.nextAnswerID++
		answer.ID = repo.nextAnswerID
	}
	repo.answers[answerKey(answer.SessionID, answer.QuestionID)] = answer
}

func answerKey(sessionID string, questionID string) string {
	return sessionID + "\x00" + questionID
}
