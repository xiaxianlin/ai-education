package ability_test

import (
	"context"
	"errors"
	"testing"

	"ai-education/server-go/internal/ability"
)

func TestCreateNormalizesAndChecksUniqueCode(t *testing.T) {
	repo := newFakeRepository()
	service := ability.NewService(repo)

	difficulty := 3
	id, err := service.Create(context.Background(), ability.CreateAbilityRequest{
		Subject:    " 数学 ",
		Grade:      1,
		Code:       " code-a ",
		Name:       " 运算能力 ",
		Difficulty: &difficulty,
	})
	if err != nil {
		t.Fatalf("Create returned error: %v", err)
	}
	if id != 1 {
		t.Fatalf("Create id = %d, want 1", id)
	}

	created := repo.abilities[id]
	if created.Subject != "数学" || created.Code != "code-a" || created.Name != "运算能力" {
		t.Fatalf("Create did not normalize fields: %+v", created)
	}
	if created.Difficulty != 3 {
		t.Fatalf("Create difficulty = %d, want 3", created.Difficulty)
	}

	_, err = service.Create(context.Background(), ability.CreateAbilityRequest{
		Subject: "数学",
		Grade:   1,
		Code:    "code-a",
		Name:    "重复代码",
	})
	if !errors.Is(err, ability.ErrDuplicateAbility) {
		t.Fatalf("Create duplicate error = %v, want %v", err, ability.ErrDuplicateAbility)
	}
}

func TestUpdateChecksSubjectGradeCodeUniqueness(t *testing.T) {
	repo := newFakeRepository()
	repo.seed(ability.Ability{ID: 1, Subject: "语文", Grade: 2, Code: "read", Name: "阅读", Difficulty: 1, IsActive: 1})
	repo.seed(ability.Ability{ID: 2, Subject: "语文", Grade: 2, Code: "write", Name: "写作", Difficulty: 1, IsActive: 1})

	service := ability.NewService(repo)
	code := " write "
	err := service.Update(context.Background(), 1, ability.UpdateAbilityRequest{
		Code: &code,
	})
	if !errors.Is(err, ability.ErrDuplicateAbility) {
		t.Fatalf("Update duplicate error = %v, want %v", err, ability.ErrDuplicateAbility)
	}
}

func TestStudentAtomicsFiltersInactiveAbilities(t *testing.T) {
	repo := newFakeRepository()
	repo.seed(ability.Ability{ID: 1, Subject: "英语", Grade: 3, Code: "word", Name: "词汇", Difficulty: 1, IsActive: 1})
	repo.seed(ability.Ability{ID: 2, Subject: "英语", Grade: 3, Code: "grammar", Name: "语法", Difficulty: 1, IsActive: 0})
	repo.seed(ability.Ability{ID: 3, Subject: "数学", Grade: 3, Code: "calc", Name: "计算", Difficulty: 1, IsActive: 1})

	service := ability.NewService(repo)
	items, err := service.StudentAtomics(context.Background(), "英语", 3)
	if err != nil {
		t.Fatalf("StudentAtomics returned error: %v", err)
	}

	if len(items) != 1 {
		t.Fatalf("StudentAtomics returned %d items, want 1: %+v", len(items), items)
	}
	if items[0].Code != "word" {
		t.Fatalf("StudentAtomics code = %s, want word", items[0].Code)
	}
}
