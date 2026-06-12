package ability

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var allowedSubjects = map[string]struct{}{
	"语文": {},
	"数学": {},
	"英语": {},
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, req CreateAbilityRequest) (int64, error) {
	if err := s.ensureRepository(); err != nil {
		return 0, err
	}

	data, err := normalizeCreateRequest(req)
	if err != nil {
		return 0, err
	}

	existing, err := s.repo.FindByUnique(ctx, data.Subject, data.Grade, data.Code)
	if err != nil {
		return 0, err
	}
	if existing != nil {
		return 0, ErrDuplicateAbility
	}

	return s.repo.Create(ctx, data)
}

func (s *Service) Update(ctx context.Context, id int64, req UpdateAbilityRequest) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	if id <= 0 {
		return newValidationError("能力 ID 不合法")
	}

	current, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return ErrAbilityNotFound
	}

	patch, err := normalizeUpdateRequest(req)
	if err != nil {
		return err
	}

	if patch.Code != nil && *patch.Code != current.Code {
		existing, err := s.repo.FindByUnique(ctx, current.Subject, current.Grade, *patch.Code)
		if err != nil {
			return err
		}
		if existing != nil && existing.ID != id {
			return ErrDuplicateAbility
		}
	}

	return s.repo.Update(ctx, id, patch)
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	if id <= 0 {
		return newValidationError("能力 ID 不合法")
	}
	return s.repo.Delete(ctx, id)
}

func (s *Service) BatchDelete(ctx context.Context, ids []int64) (int, error) {
	if err := s.ensureRepository(); err != nil {
		return 0, err
	}
	if len(ids) == 0 {
		return 0, newValidationError("ids 不能为空")
	}
	for _, id := range ids {
		if id <= 0 {
			return 0, newValidationError("能力 ID 不合法")
		}
	}
	return s.repo.BatchDelete(ctx, ids)
}

func (s *Service) Get(ctx context.Context, id int64) (*Ability, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	if id <= 0 {
		return nil, newValidationError("能力 ID 不合法")
	}
	return s.repo.Get(ctx, id)
}

func (s *Service) Search(ctx context.Context, params SearchAbilityParams) (SearchAbilitiesResult, error) {
	if err := s.ensureRepository(); err != nil {
		return SearchAbilitiesResult{}, err
	}

	normalized, err := normalizeSearchParams(params)
	if err != nil {
		return SearchAbilitiesResult{}, err
	}
	return s.repo.List(ctx, normalized)
}

func (s *Service) StudentAtomics(ctx context.Context, subject string, grade int) ([]Ability, error) {
	subject = strings.TrimSpace(subject)
	if err := validateSubject(subject); err != nil {
		return nil, err
	}
	if err := validateGrade(grade); err != nil {
		return nil, err
	}

	result, err := s.Search(ctx, SearchAbilityParams{
		Subject: &subject,
		Grade:   &grade,
		Unpaged: true,
	})
	if err != nil {
		return nil, err
	}

	activeAbilities := make([]Ability, 0, len(result.Data))
	for _, item := range result.Data {
		if item.IsActive == 1 && item.Subject == subject {
			activeAbilities = append(activeAbilities, item)
		}
	}
	return activeAbilities, nil
}

func (s *Service) ExportBySubjectGrade(ctx context.Context, subject string, grade int) ([]CreateAbility, error) {
	subject = strings.TrimSpace(subject)
	if err := validateSubject(subject); err != nil {
		return nil, err
	}
	if err := validateGrade(grade); err != nil {
		return nil, err
	}

	result, err := s.Search(ctx, SearchAbilityParams{
		Subject: &subject,
		Grade:   &grade,
		Unpaged: true,
	})
	if err != nil {
		return nil, err
	}

	items := make([]CreateAbility, 0, len(result.Data))
	for _, item := range result.Data {
		items = append(items, CreateAbility{
			Subject:     item.Subject,
			Grade:       item.Grade,
			Code:        item.Code,
			Name:        item.Name,
			Description: item.Description,
			Difficulty:  item.Difficulty,
		})
	}
	return items, nil
}

func (s *Service) ImportBySubjectGrade(ctx context.Context, subject string, grade int, reqs []CreateAbilityRequest) (ImportAbilitiesResult, error) {
	if err := s.ensureRepository(); err != nil {
		return ImportAbilitiesResult{}, err
	}

	subject = strings.TrimSpace(subject)
	if err := validateSubject(subject); err != nil {
		return ImportAbilitiesResult{}, err
	}
	if err := validateGrade(grade); err != nil {
		return ImportAbilitiesResult{}, err
	}

	items := make([]CreateAbility, 0, len(reqs))
	seenCodes := make(map[string]struct{}, len(reqs))
	for _, req := range reqs {
		item, err := normalizeCreateRequest(req)
		if err != nil {
			return ImportAbilitiesResult{}, err
		}
		if item.Subject != subject {
			return ImportAbilitiesResult{}, newValidationError(fmt.Sprintf("数据项中的 subject (%s) 与请求参数 (%s) 不一致", item.Subject, subject))
		}
		if item.Grade != grade {
			return ImportAbilitiesResult{}, newValidationError(fmt.Sprintf("数据项中的 grade (%d) 与请求参数 (%d) 不一致", item.Grade, grade))
		}
		if _, ok := seenCodes[item.Code]; ok {
			return ImportAbilitiesResult{}, ErrDuplicateAbility
		}
		seenCodes[item.Code] = struct{}{}
		items = append(items, item)
	}

	deletedCount, err := s.repo.DeleteBySubjectGrade(ctx, subject, grade)
	if err != nil {
		return ImportAbilitiesResult{}, err
	}

	created, err := s.repo.BatchCreate(ctx, items)
	if err != nil {
		return ImportAbilitiesResult{}, err
	}

	return ImportAbilitiesResult{
		DeletedCount: deletedCount,
		CreatedCount: len(created),
	}, nil
}

func (s *Service) ensureRepository() error {
	if s == nil || s.repo == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

func normalizeCreateRequest(req CreateAbilityRequest) (CreateAbility, error) {
	subject := strings.TrimSpace(req.Subject)
	if err := validateSubject(subject); err != nil {
		return CreateAbility{}, err
	}
	if err := validateGrade(req.Grade); err != nil {
		return CreateAbility{}, err
	}

	code := strings.TrimSpace(req.Code)
	if code == "" {
		return CreateAbility{}, newValidationError("能力代码不能为空")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return CreateAbility{}, newValidationError("能力名称不能为空")
	}

	difficulty := 1
	if req.Difficulty != nil {
		difficulty = *req.Difficulty
	}
	if err := validateDifficulty(difficulty); err != nil {
		return CreateAbility{}, err
	}

	return CreateAbility{
		Subject:     subject,
		Grade:       req.Grade,
		Code:        code,
		Name:        name,
		Description: normalizeOptionalString(req.Description),
		Difficulty:  difficulty,
	}, nil
}

func normalizeUpdateRequest(req UpdateAbilityRequest) (UpdateAbilityPatch, error) {
	var patch UpdateAbilityPatch

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			return UpdateAbilityPatch{}, newValidationError("能力名称不能为空")
		}
		patch.Name = &name
	}

	if req.Code != nil {
		code := strings.TrimSpace(*req.Code)
		if code == "" {
			return UpdateAbilityPatch{}, newValidationError("能力代码不能为空")
		}
		patch.Code = &code
	}

	if req.Description != nil {
		patch.Description.Set = true
		patch.Description.Value = normalizeOptionalString(req.Description)
	}

	if req.Difficulty != nil {
		if err := validateDifficulty(*req.Difficulty); err != nil {
			return UpdateAbilityPatch{}, err
		}
		patch.Difficulty = req.Difficulty
	}

	if req.IsActive != nil {
		if *req.IsActive != 0 && *req.IsActive != 1 {
			return UpdateAbilityPatch{}, newValidationError("is_active 只能是 0 或 1")
		}
		patch.IsActive = req.IsActive
	}

	return patch, nil
}

func normalizeSearchParams(params SearchAbilityParams) (SearchAbilityParams, error) {
	normalized := SearchAbilityParams{Unpaged: params.Unpaged}

	if params.Subject != nil {
		subject := strings.TrimSpace(*params.Subject)
		if subject != "" {
			if err := validateSubject(subject); err != nil {
				return SearchAbilityParams{}, err
			}
			normalized.Subject = &subject
		}
	}

	if params.Grade != nil {
		if err := validateGrade(*params.Grade); err != nil {
			return SearchAbilityParams{}, err
		}
		grade := *params.Grade
		normalized.Grade = &grade
	}
	if !normalized.Unpaged {
		normalized.Page = params.Page
		normalized.Size = params.Size
		if normalized.Page <= 0 {
			normalized.Page = 1
		}
		if normalized.Size <= 0 {
			normalized.Size = 20
		}
		if normalized.Size > 100 {
			normalized.Size = 100
		}
	}

	return normalized, nil
}

func normalizeOptionalString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func validateSubject(subject string) error {
	if subject == "" {
		return newValidationError("科目不能为空")
	}
	if _, ok := allowedSubjects[subject]; !ok {
		return newValidationError("科目只能选择语文、数学、英语")
	}
	return nil
}

func validateGrade(grade int) error {
	if grade < 1 || grade > 6 {
		return newValidationError("年级必须在 1 到 6 之间")
	}
	return nil
}

func validateDifficulty(difficulty int) error {
	if difficulty < 1 || difficulty > 5 {
		return newValidationError("难度必须在 1 到 5 之间")
	}
	return nil
}

func IsNotFoundError(err error) bool {
	return errors.Is(err, ErrAbilityNotFound)
}

func IsDuplicateError(err error) bool {
	return errors.Is(err, ErrDuplicateAbility)
}
