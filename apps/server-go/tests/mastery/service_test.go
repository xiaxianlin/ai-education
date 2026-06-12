package mastery_test

import (
	"context"
	"reflect"
	"testing"
	"time"

	"ai-education/server-go/internal/mastery"
)

type fakeRepository struct {
	listFilter       mastery.MasteryFilter
	weakThreshold    float64
	weakLimit        int
	statisticsStarts []*int64
}

func (f *fakeRepository) ListMastery(ctx context.Context, studentID string, filter mastery.MasteryFilter) ([]mastery.MasteryWithInfo, error) {
	f.listFilter = filter
	return []mastery.MasteryWithInfo{
		{Mastery: mastery.Mastery{ID: 1, StudentID: studentID, AbilityCode: "MATH-1", MasteryScore: 55, MasteryLevel: mastery.MasteryLevelBeginner}},
	}, nil
}

func (f *fakeRepository) ListWeakMastery(ctx context.Context, studentID string, threshold float64, limit int) ([]mastery.Mastery, error) {
	f.weakThreshold = threshold
	f.weakLimit = limit
	return []mastery.Mastery{{ID: 2, StudentID: studentID, AbilityCode: "MATH-2", MasteryScore: 40}}, nil
}

func (f *fakeRepository) GetSummary(ctx context.Context, studentID string) (mastery.Summary, error) {
	return mastery.Summary{
		TotalAbilities:     2,
		PracticedAbilities: 2,
		AvgMasteryScore:    62.5,
		LevelDistribution:  map[string]int{"beginner": 1, "proficient": 1},
	}, nil
}

func (f *fakeRepository) GetPracticeStatistics(ctx context.Context, studentID string, startTime *int64) (mastery.Statistics, error) {
	f.statisticsStarts = append(f.statisticsStarts, startTime)
	return mastery.Statistics{TotalPractices: len(f.statisticsStarts)}, nil
}

func TestServiceDelegatesMasteryListFilter(t *testing.T) {
	repo := &fakeRepository{}
	service := mastery.NewService(repo)
	subject := " 数学 "
	grade := 4

	items, err := service.ListMastery(context.Background(), "student-1", mastery.MasteryFilter{
		Subject: &subject,
		Grade:   &grade,
	})
	if err != nil {
		t.Fatalf("ListMastery error: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("items len = %d, want 1", len(items))
	}

	wantSubject := "数学"
	want := mastery.MasteryFilter{Subject: &wantSubject, Grade: &grade}
	if !reflect.DeepEqual(repo.listFilter, want) {
		t.Fatalf("filter = %#v, want %#v", repo.listFilter, want)
	}
}

func TestServiceBuildsPracticeStatisticsWindows(t *testing.T) {
	repo := &fakeRepository{}
	now := time.Unix(1_700_000_000, 0)
	service := mastery.NewService(repo).WithClock(func() time.Time { return now })

	result, err := service.GetPracticeStatistics(context.Background(), "student-1")
	if err != nil {
		t.Fatalf("GetPracticeStatistics error: %v", err)
	}
	if result.AllTime.TotalPractices != 1 || result.Recent30Days.TotalPractices != 2 {
		t.Fatalf("unexpected statistics: %+v", result)
	}
	if len(repo.statisticsStarts) != 2 {
		t.Fatalf("statistics calls = %d, want 2", len(repo.statisticsStarts))
	}
	if repo.statisticsStarts[0] != nil {
		t.Fatalf("all-time start = %v, want nil", repo.statisticsStarts[0])
	}

	wantRecent := now.AddDate(0, 0, -30).Unix()
	if repo.statisticsStarts[1] == nil || *repo.statisticsStarts[1] != wantRecent {
		t.Fatalf("recent start = %v, want %d", repo.statisticsStarts[1], wantRecent)
	}
}

func TestWeakLimitValidation(t *testing.T) {
	service := mastery.NewService(&fakeRepository{})

	if _, err := service.ListWeakMastery(context.Background(), "student-1", 60, 21); err == nil {
		t.Fatal("ListWeakMastery error = nil, want validation error")
	}
}
