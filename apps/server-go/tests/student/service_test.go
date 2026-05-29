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

func TestAdminServiceCreateStudentNormalizesAndHashesPassword(t *testing.T) {
	repo := &fakeAdminRepository{}
	service := student.NewAdminServiceWithOptions(
		repo,
		fakePasswordHasher{},
		func() int64 { return 123 },
		func() string { return "student-new" },
		func() (string, error) { return "plain-pass", nil },
	)

	password, err := service.CreateStudent(context.Background(), student.SaveStudentRequest{
		Name:  " 小明 ",
		Phone: " 13800138000 ",
		Grade: 4,
	})
	if err != nil {
		t.Fatalf("CreateStudent returned error: %v", err)
	}
	if password != "plain-pass" {
		t.Fatalf("password = %q, want plain-pass", password)
	}
	if repo.created.ID != "student-new" || repo.created.Name != "小明" || repo.created.PasswordHash != "hashed:plain-pass" || repo.created.Status != 1 {
		t.Fatalf("unexpected created record: %+v", repo.created)
	}
}

func TestAdminServiceRejectsDuplicateTextbookConfigs(t *testing.T) {
	repo := &fakeAdminRepository{}
	service := student.NewAdminServiceWithOptions(repo, fakePasswordHasher{}, nil, nil, nil)

	err := service.SetTextbookConfigs(context.Background(), " student-1 ", student.SetStudentTextbookConfigsRequest{
		Configs: []student.SaveStudentTextbookConfigRequest{
			{TextbookID: 7},
			{TextbookID: 7},
			{TextbookID: 8},
		},
	})
	if err != nil {
		t.Fatalf("SetTextbookConfigs returned error: %v", err)
	}
	if repo.setConfigsStudentID != "student-1" || len(repo.setConfigsTextbookIDs) != 2 {
		t.Fatalf("unexpected set configs: studentID=%q ids=%v", repo.setConfigsStudentID, repo.setConfigsTextbookIDs)
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

type fakePasswordHasher struct{}

func (fakePasswordHasher) Hash(plain string) (string, error) {
	return "hashed:" + plain, nil
}

type fakeAdminRepository struct {
	created               student.CreateStudentRecord
	setConfigsStudentID   string
	setConfigsTextbookIDs []int64
}

func (repo *fakeAdminRepository) GetAdminStudent(_ context.Context, studentID string) (*student.AdminStudent, error) {
	return &student.AdminStudent{ID: studentID, Name: "小明", Phone: "13800138000", Grade: 4, Status: 1}, nil
}

func (repo *fakeAdminRepository) SearchStudents(_ context.Context, _ student.SearchStudentsRequest) (student.SearchStudentsResult, error) {
	return student.SearchStudentsResult{}, nil
}

func (repo *fakeAdminRepository) PhoneExists(_ context.Context, _ string, _ string) (bool, error) {
	return false, nil
}

func (repo *fakeAdminRepository) CreateStudent(_ context.Context, record student.CreateStudentRecord) error {
	repo.created = record
	return nil
}

func (repo *fakeAdminRepository) UpdateStudent(_ context.Context, _ string, _ student.UpdateStudentRecord) error {
	return nil
}

func (repo *fakeAdminRepository) DeleteStudent(_ context.Context, _ string) error {
	return nil
}

func (repo *fakeAdminRepository) ResetStudentPassword(_ context.Context, _ string, _ string, _ int64) error {
	return nil
}

func (repo *fakeAdminRepository) ListUnusedTextbooks(_ context.Context, _ string) ([]student.Textbook, error) {
	return nil, nil
}

func (repo *fakeAdminRepository) CreateStudentTextbookConfig(_ context.Context, studentID string, textbookID int64, _ int64) (*student.StudentTextbookConfig, error) {
	return &student.StudentTextbookConfig{ID: 1, StudentID: studentID, TextbookID: textbookID}, nil
}

func (repo *fakeAdminRepository) UpdateStudentTextbookConfig(_ context.Context, studentID string, configID int64, textbookID int64, _ int64) (*student.StudentTextbookConfig, error) {
	return &student.StudentTextbookConfig{ID: configID, StudentID: studentID, TextbookID: textbookID}, nil
}

func (repo *fakeAdminRepository) DeleteStudentTextbookConfig(_ context.Context, _ string, _ int64) (bool, error) {
	return true, nil
}

func (repo *fakeAdminRepository) ListStudentTextbookConfigs(_ context.Context, _ string, req student.ListStudentTextbookConfigsRequest) (student.ListStudentTextbookConfigsResult, error) {
	return student.ListStudentTextbookConfigsResult{Page: req.Page, PageSize: req.Size}, nil
}

func (repo *fakeAdminRepository) SetStudentTextbookConfigs(_ context.Context, studentID string, textbookIDs []int64, _ int64) error {
	repo.setConfigsStudentID = studentID
	repo.setConfigsTextbookIDs = textbookIDs
	return nil
}

func (repo *fakeAdminRepository) ListStudentMastery(_ context.Context, _ string, _ string) ([]student.StudentMastery, error) {
	return []student.StudentMastery{{ID: 1, AbilityCode: "MATH-1"}}, nil
}

func (repo *fakeAdminRepository) GetStudentMasterySummary(_ context.Context, _ string) (student.StudentMasterySummary, error) {
	return student.StudentMasterySummary{TotalAbilities: 1, AvgMasteryScore: 88.12, LevelDistribution: map[string]int{"mastered": 1}}, nil
}
