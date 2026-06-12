package ability_test

import (
	"context"

	"ai-education/server-go/internal/ability"
)

type fakeRepository struct {
	nextID    int64
	abilities map[int64]ability.Ability
}

func newFakeRepository() *fakeRepository {
	return &fakeRepository{
		nextID:    1,
		abilities: make(map[int64]ability.Ability),
	}
}

func (r *fakeRepository) seed(item ability.Ability) {
	if item.ID >= r.nextID {
		r.nextID = item.ID + 1
	}
	r.abilities[item.ID] = item
}

func (r *fakeRepository) Create(_ context.Context, data ability.CreateAbility) (int64, error) {
	id := r.nextID
	r.nextID++

	r.abilities[id] = ability.Ability{
		ID:          id,
		Subject:     data.Subject,
		Grade:       data.Grade,
		Code:        data.Code,
		Name:        data.Name,
		Description: data.Description,
		Difficulty:  data.Difficulty,
		IsActive:    1,
		CreateTime:  1,
		UpdateTime:  1,
	}

	return id, nil
}

func (r *fakeRepository) BatchCreate(ctx context.Context, items []ability.CreateAbility) ([]ability.Ability, error) {
	created := make([]ability.Ability, 0, len(items))
	for _, item := range items {
		id, err := r.Create(ctx, item)
		if err != nil {
			return nil, err
		}
		created = append(created, r.abilities[id])
	}
	return created, nil
}

func (r *fakeRepository) Get(_ context.Context, id int64) (*ability.Ability, error) {
	item, ok := r.abilities[id]
	if !ok {
		return nil, ability.ErrAbilityNotFound
	}
	return &item, nil
}

func (r *fakeRepository) FindByUnique(_ context.Context, subject string, grade int, code string) (*ability.Ability, error) {
	for _, item := range r.abilities {
		if item.Subject == subject && item.Grade == grade && item.Code == code {
			found := item
			return &found, nil
		}
	}
	return nil, nil
}

func (r *fakeRepository) List(_ context.Context, params ability.SearchAbilityParams) (ability.SearchAbilitiesResult, error) {
	items := make([]ability.Ability, 0, len(r.abilities))
	for _, item := range r.abilities {
		if params.Subject != nil && item.Subject != *params.Subject {
			continue
		}
		if params.Grade != nil && item.Grade != *params.Grade {
			continue
		}
		items = append(items, item)
	}
	total := len(items)
	if !params.Unpaged {
		page := params.Page
		if page <= 0 {
			page = 1
		}
		size := params.Size
		if size <= 0 {
			size = 20
		}
		offset := (page - 1) * size
		if offset >= len(items) {
			items = []ability.Ability{}
		} else {
			end := offset + size
			if end > len(items) {
				end = len(items)
			}
			items = items[offset:end]
		}
	}
	return ability.SearchAbilitiesResult{Total: total, Data: items}, nil
}

func (r *fakeRepository) Update(_ context.Context, id int64, patch ability.UpdateAbilityPatch) error {
	item, ok := r.abilities[id]
	if !ok {
		return ability.ErrAbilityNotFound
	}

	if patch.Name != nil {
		item.Name = *patch.Name
	}
	if patch.Code != nil {
		item.Code = *patch.Code
	}
	if patch.Description.Set {
		item.Description = patch.Description.Value
	}
	if patch.Difficulty != nil {
		item.Difficulty = *patch.Difficulty
	}
	if patch.IsActive != nil {
		item.IsActive = *patch.IsActive
	}

	r.abilities[id] = item
	return nil
}

func (r *fakeRepository) Delete(_ context.Context, id int64) error {
	if _, ok := r.abilities[id]; !ok {
		return ability.ErrAbilityNotFound
	}
	delete(r.abilities, id)
	return nil
}

func (r *fakeRepository) BatchDelete(_ context.Context, ids []int64) (int, error) {
	deletedCount := 0
	for _, id := range ids {
		if _, ok := r.abilities[id]; ok {
			delete(r.abilities, id)
			deletedCount++
		}
	}
	return deletedCount, nil
}

func (r *fakeRepository) DeleteBySubjectGrade(_ context.Context, subject string, grade int) (int, error) {
	deletedCount := 0
	for id, item := range r.abilities {
		if item.Subject == subject && item.Grade == grade {
			delete(r.abilities, id)
			deletedCount++
		}
	}
	return deletedCount, nil
}
