package student_test

import (
	"context"
	"errors"
	"testing"

	"ai-education/server-go/internal/student"
)

func TestServiceGetProfileAndUpdateSettings(t *testing.T) {
	repo := &fakeRepository{
		profile: &student.Profile{
			Name:      "小明",
			Phone:     "13800138000",
			Textbooks: []student.Textbook{{ID: 1, Subject: "数学", Version: "人教版", Grade: 4, Semester: "上学期"}},
		},
	}
	service := student.NewService(repo)

	profile, err := service.GetProfile(context.Background(), " student-1 ")
	if err != nil {
		t.Fatalf("GetProfile returned error: %v", err)
	}
	if profile.Name != "小明" || repo.profileStudentID != "student-1" {
		t.Fatalf("unexpected profile result=%+v studentID=%q", profile, repo.profileStudentID)
	}

	err = service.UpdateSettings(context.Background(), " student-1 ", student.UpdateSettingsRequest{
		Grade:    4,
		Semester: "下学期",
		Subject:  "数学",
	})
	if err != nil {
		t.Fatalf("UpdateSettings returned error: %v", err)
	}
	if repo.settingsStudentID != "student-1" || repo.settings.Subject != "数学" {
		t.Fatalf("unexpected settings update: studentID=%q settings=%+v", repo.settingsStudentID, repo.settings)
	}
}

func TestServiceUpdateSettingsValidation(t *testing.T) {
	service := student.NewService(&fakeRepository{})

	cases := []student.UpdateSettingsRequest{
		{Grade: 0, Semester: "上学期", Subject: "数学"},
		{Grade: 4, Semester: "暑假", Subject: "数学"},
		{Grade: 4, Semester: "上学期", Subject: "科学"},
	}

	for _, tc := range cases {
		err := service.UpdateSettings(context.Background(), "student-1", tc)
		if !errors.Is(err, student.ErrInvalidArgument) {
			t.Fatalf("UpdateSettings(%+v) error = %v, want %v", tc, err, student.ErrInvalidArgument)
		}
	}
}

type fakeRepository struct {
	profile *student.Profile

	profileStudentID  string
	settingsStudentID string
	settings          student.UpdateSettings
}

func (repo *fakeRepository) GetProfile(_ context.Context, studentID string) (*student.Profile, error) {
	repo.profileStudentID = studentID
	if repo.profile == nil {
		return nil, student.ErrStudentNotFound
	}
	return repo.profile, nil
}

func (repo *fakeRepository) UpdateSettings(_ context.Context, studentID string, settings student.UpdateSettings) error {
	repo.settingsStudentID = studentID
	repo.settings = settings
	return nil
}
