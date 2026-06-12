package mastery

import (
	"context"
	"sync"
	"testing"
	"time"
)

// --- In-memory mock repository for testing ---

type mockRepo struct {
	mu        sync.Mutex
	masteries map[string]*Mastery // key: studentID + "|" + abilityCode
}

func newMockRepo() *mockRepo {
	return &mockRepo{masteries: make(map[string]*Mastery)}
}

func mockKey(studentID, abilityCode string) string {
	return studentID + "|" + abilityCode
}

func (r *mockRepo) GetMastery(_ context.Context, studentID, abilityCode string) (*Mastery, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	m, ok := r.masteries[mockKey(studentID, abilityCode)]
	if !ok {
		return nil, nil
	}
	cp := *m
	return &cp, nil
}

func (r *mockRepo) UpsertMastery(_ context.Context, m *Mastery) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.masteries[mockKey(m.StudentID, m.AbilityCode)] = m
	return nil
}

func (r *mockRepo) BatchUpsertMastery(_ context.Context, masteries []*Mastery) error {
	for _, m := range masteries {
		if err := r.UpsertMastery(nil, m); err != nil {
			return err
		}
	}
	return nil
}

// Stubs for unused interface methods
func (r *mockRepo) ListMastery(_ context.Context, _ string, _ MasteryFilter) ([]MasteryWithInfo, error) {
	return nil, nil
}
func (r *mockRepo) ListWeakMastery(_ context.Context, _ string, _ float64, _ int) ([]Mastery, error) {
	return nil, nil
}
func (r *mockRepo) GetSummary(_ context.Context, _ string) (Summary, error) {
	return Summary{}, nil
}
func (r *mockRepo) GetPracticeStatistics(_ context.Context, _ string, _ *int64) (Statistics, error) {
	return Statistics{}, nil
}

// --- Tests ---

func TestUpdateAfterPractice_FirstTime(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)

	ctx := context.Background()
	answers := []AnswerMasteryInput{
		{AbilityCode: "addition", IsCorrect: true},
		{AbilityCode: "addition", IsCorrect: false},
		{AbilityCode: "addition", IsCorrect: true},
	}

	err := svc.UpdateAfterPractice(ctx, "student-1", answers)
	if err != nil {
		t.Fatalf("UpdateAfterPractice returned error: %v", err)
	}

	m, err := repo.GetMastery(ctx, "student-1", "addition")
	if err != nil {
		t.Fatalf("GetMastery returned error: %v", err)
	}
	if m == nil {
		t.Fatal("expected mastery record to be created, got nil")
	}

	// 2/3 correct = 66.67%
	if m.MasteryScore < 66 || m.MasteryScore > 67 {
		t.Errorf("expected mastery_score ~66.67, got %.2f", m.MasteryScore)
	}
	if m.CorrectCount != 2 {
		t.Errorf("expected correct_count=2, got %d", m.CorrectCount)
	}
	if m.WrongCount != 1 {
		t.Errorf("expected wrong_count=1, got %d", m.WrongCount)
	}
	if m.MasteryLevel != MasteryLevelProficient {
		t.Errorf("expected mastery_level=proficient, got %s", m.MasteryLevel)
	}
}

func TestUpdateAfterPractice_CumulativeWeighted(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)

	ctx := context.Background()

	// 第一次练习: 2/2 correct = 100%
	err := svc.UpdateAfterPractice(ctx, "student-1", []AnswerMasteryInput{
		{AbilityCode: "addition", IsCorrect: true},
		{AbilityCode: "addition", IsCorrect: true},
	})
	if err != nil {
		t.Fatalf("first update: %v", err)
	}

	// 第二次练习: 0/2 correct = 0%
	// 累积: (100*2 + 0*2) / 4 = 50
	err = svc.UpdateAfterPractice(ctx, "student-1", []AnswerMasteryInput{
		{AbilityCode: "addition", IsCorrect: false},
		{AbilityCode: "addition", IsCorrect: false},
	})
	if err != nil {
		t.Fatalf("second update: %v", err)
	}

	m, _ := repo.GetMastery(ctx, "student-1", "addition")
	if m == nil {
		t.Fatal("expected mastery record, got nil")
	}

	if m.MasteryScore != 50 {
		t.Errorf("expected mastery_score=50 after cumulative, got %.2f", m.MasteryScore)
	}
	if m.CorrectCount != 2 {
		t.Errorf("expected correct_count=2, got %d", m.CorrectCount)
	}
	if m.WrongCount != 2 {
		t.Errorf("expected wrong_count=2, got %d", m.WrongCount)
	}
	if m.MasteryLevel != MasteryLevelBeginner {
		t.Errorf("expected mastery_level=beginner (40-59), got %s", m.MasteryLevel)
	}
}

func TestUpdateAfterPractice_MultipleAbilities(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)

	ctx := context.Background()
	answers := []AnswerMasteryInput{
		{AbilityCode: "addition", IsCorrect: true},
		{AbilityCode: "addition", IsCorrect: true},
		{AbilityCode: "subtraction", IsCorrect: false},
		{AbilityCode: "subtraction", IsCorrect: false},
	}

	err := svc.UpdateAfterPractice(ctx, "student-1", answers)
	if err != nil {
		t.Fatalf("UpdateAfterPractice: %v", err)
	}

	addition, _ := repo.GetMastery(ctx, "student-1", "addition")
	if addition == nil || addition.MasteryScore != 100 {
		t.Errorf("expected addition mastery=100, got %v", addition)
	}

	subtraction, _ := repo.GetMastery(ctx, "student-1", "subtraction")
	if subtraction == nil || subtraction.MasteryScore != 0 {
		t.Errorf("expected subtraction mastery=0, got %v", subtraction)
	}
}

func TestUpdateAfterPractice_EmptyAnswers(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)

	err := svc.UpdateAfterPractice(context.Background(), "student-1", nil)
	if err != nil {
		t.Errorf("expected nil error for empty answers, got: %v", err)
	}
}

func TestUpdateAfterPractice_UpdatesLastPracticeTime(t *testing.T) {
	repo := newMockRepo()
	fixedTime := time.Date(2026, 6, 12, 10, 0, 0, 0, time.UTC)
	svc := NewService(repo).WithClock(func() time.Time { return fixedTime })

	ctx := context.Background()
	err := svc.UpdateAfterPractice(ctx, "student-1", []AnswerMasteryInput{
		{AbilityCode: "addition", IsCorrect: true},
	})
	if err != nil {
		t.Fatalf("UpdateAfterPractice: %v", err)
	}

	m, _ := repo.GetMastery(ctx, "student-1", "addition")
	if m == nil {
		t.Fatal("expected mastery record")
	}
	if m.LastPracticeTime == nil {
		t.Fatal("expected last_practice_time to be set")
	}
	if *m.LastPracticeTime != fixedTime.Unix() {
		t.Errorf("expected last_practice_time=%d, got %d", fixedTime.Unix(), *m.LastPracticeTime)
	}
}

func TestCalculateMasteryLevel(t *testing.T) {
	tests := []struct {
		score    float64
		expected MasteryLevel
	}{
		{90, MasteryLevelMastered},
		{80, MasteryLevelMastered},
		{79.9, MasteryLevelProficient},
		{60, MasteryLevelProficient},
		{59.9, MasteryLevelBeginner},
		{40, MasteryLevelBeginner},
		{39.9, MasteryLevelUnlearned},
		{0, MasteryLevelUnlearned},
	}
	for _, tt := range tests {
		got := CalculateMasteryLevel(tt.score)
		if got != tt.expected {
			t.Errorf("CalculateMasteryLevel(%.1f) = %s, want %s", tt.score, got, tt.expected)
		}
	}
}

func TestUpdateAfterPractice_ThreeWayCumulative(t *testing.T) {
	repo := newMockRepo()
	svc := NewService(repo)
	ctx := context.Background()

	// 第1次: 4/4 = 100%, total=4
	svc.UpdateAfterPractice(ctx, "s1", []AnswerMasteryInput{
		{"multiplication", true}, {"multiplication", true},
		{"multiplication", true}, {"multiplication", true},
	})
	// 第2次: 1/4 = 25%, total=8 → (100*4 + 25*4)/8 = 62.5
	svc.UpdateAfterPractice(ctx, "s1", []AnswerMasteryInput{
		{"multiplication", false}, {"multiplication", false},
		{"multiplication", false}, {"multiplication", true},
	})
	// 第3次: 3/4 = 75%, total=12 → (62.5*8 + 75*4)/12 = 66.67
	svc.UpdateAfterPractice(ctx, "s1", []AnswerMasteryInput{
		{"multiplication", true}, {"multiplication", true},
		{"multiplication", true}, {"multiplication", false},
	})

	m, _ := repo.GetMastery(ctx, "s1", "multiplication")
	if m == nil {
		t.Fatal("expected mastery record")
	}

	expected := (62.5*8 + 75*4) / 12
	if m.MasteryScore < expected-0.5 || m.MasteryScore > expected+0.5 {
		t.Errorf("expected mastery_score ~%.2f, got %.2f", expected, m.MasteryScore)
	}
	if m.CorrectCount != 8 {
		t.Errorf("expected correct_count=8, got %d", m.CorrectCount)
	}
	if m.WrongCount != 4 {
		t.Errorf("expected wrong_count=4, got %d", m.WrongCount)
	}
}
