package ability_test

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"testing"

	"ai-education/server-go/internal/ability"
)

func TestSQLRepositoryCreateFindListUpdateDelete(t *testing.T) {
	db := openAbilityTestDB(t)
	repo := ability.NewSQLRepository(db)
	ctx := context.Background()

	description := "整数四则混合运算"
	id, err := repo.Create(ctx, ability.CreateAbility{
		Subject:     "数学",
		Grade:       3,
		Code:        "calc",
		Name:        "计算能力",
		Description: &description,
		Difficulty:  2,
	})
	if err != nil {
		t.Fatalf("Create returned error: %v", err)
	}
	if id != 1 {
		t.Fatalf("Create id = %d, want 1", id)
	}

	found, err := repo.FindByUnique(ctx, "数学", 3, "calc")
	if err != nil {
		t.Fatalf("FindByUnique returned error: %v", err)
	}
	if found == nil || found.ID != id || found.Description == nil || *found.Description != description {
		t.Fatalf("FindByUnique returned unexpected ability: %+v", found)
	}

	result, err := repo.List(ctx, ability.SearchAbilityParams{Subject: stringPtr("数学"), Grade: intPtr(3), Page: 1, Size: 20})
	if err != nil {
		t.Fatalf("List returned error: %v", err)
	}
	if result.Total != 1 || len(result.Data) != 1 || result.Data[0].Code != "calc" {
		t.Fatalf("List returned unexpected result: %+v", result)
	}

	newName := "口算能力"
	newCode := "mental-calc"
	inactive := 0
	err = repo.Update(ctx, id, ability.UpdateAbilityPatch{
		Name:        &newName,
		Code:        &newCode,
		Description: ability.NullableString{Set: true, Value: nil},
		IsActive:    &inactive,
	})
	if err != nil {
		t.Fatalf("Update returned error: %v", err)
	}

	updated, err := repo.Get(ctx, id)
	if err != nil {
		t.Fatalf("Get returned error: %v", err)
	}
	if updated.Name != newName || updated.Code != newCode || updated.Description != nil || updated.IsActive != 0 {
		t.Fatalf("Update persisted unexpected ability: %+v", updated)
	}

	if err := repo.Delete(ctx, id); err != nil {
		t.Fatalf("Delete returned error: %v", err)
	}
	_, err = repo.Get(ctx, id)
	if !errors.Is(err, ability.ErrAbilityNotFound) {
		t.Fatalf("Get after Delete error = %v, want %v", err, ability.ErrAbilityNotFound)
	}
}

func TestSQLRepositoryPreservesUniqueSubjectGradeCode(t *testing.T) {
	db := openAbilityTestDB(t)
	repo := ability.NewSQLRepository(db)
	ctx := context.Background()

	firstID, err := repo.Create(ctx, ability.CreateAbility{
		Subject:    "语文",
		Grade:      4,
		Code:       "read",
		Name:       "阅读",
		Difficulty: 1,
	})
	if err != nil {
		t.Fatalf("Create first returned error: %v", err)
	}
	secondID, err := repo.Create(ctx, ability.CreateAbility{
		Subject:    "语文",
		Grade:      4,
		Code:       "write",
		Name:       "写作",
		Difficulty: 1,
	})
	if err != nil {
		t.Fatalf("Create second returned error: %v", err)
	}

	_, err = repo.Create(ctx, ability.CreateAbility{
		Subject:    "语文",
		Grade:      4,
		Code:       "read",
		Name:       "重复阅读",
		Difficulty: 1,
	})
	if !errors.Is(err, ability.ErrDuplicateAbility) {
		t.Fatalf("Create duplicate error = %v, want %v", err, ability.ErrDuplicateAbility)
	}

	code := "write"
	err = repo.Update(ctx, firstID, ability.UpdateAbilityPatch{Code: &code})
	if !errors.Is(err, ability.ErrDuplicateAbility) {
		t.Fatalf("Update duplicate error = %v, want %v", err, ability.ErrDuplicateAbility)
	}

	_, err = repo.Get(ctx, secondID)
	if err != nil {
		t.Fatalf("Get second after duplicate update returned error: %v", err)
	}
}

func TestSQLRepositoryBatchCreateAndBulkDeletes(t *testing.T) {
	db := openAbilityTestDB(t)
	repo := ability.NewSQLRepository(db)
	ctx := context.Background()

	created, err := repo.BatchCreate(ctx, []ability.CreateAbility{
		{Subject: "英语", Grade: 2, Code: "word", Name: "词汇", Difficulty: 1},
		{Subject: "英语", Grade: 2, Code: "sentence", Name: "句子", Difficulty: 2},
		{Subject: "英语", Grade: 3, Code: "listen", Name: "听力", Difficulty: 1},
	})
	if err != nil {
		t.Fatalf("BatchCreate returned error: %v", err)
	}
	if len(created) != 3 || created[0].ID == 0 || created[0].IsActive != 1 {
		t.Fatalf("BatchCreate returned unexpected items: %+v", created)
	}

	deletedCount, err := repo.DeleteBySubjectGrade(ctx, "英语", 2)
	if err != nil {
		t.Fatalf("DeleteBySubjectGrade returned error: %v", err)
	}
	if deletedCount != 2 {
		t.Fatalf("DeleteBySubjectGrade count = %d, want 2", deletedCount)
	}

	created, err = repo.BatchCreate(ctx, []ability.CreateAbility{
		{Subject: "数学", Grade: 1, Code: "count", Name: "数数", Difficulty: 1},
		{Subject: "数学", Grade: 1, Code: "shape", Name: "图形", Difficulty: 1},
	})
	if err != nil {
		t.Fatalf("second BatchCreate returned error: %v", err)
	}

	deletedCount, err = repo.BatchDelete(ctx, []int64{created[0].ID, created[1].ID, 999})
	if err != nil {
		t.Fatalf("BatchDelete returned error: %v", err)
	}
	if deletedCount != 2 {
		t.Fatalf("BatchDelete count = %d, want 2", deletedCount)
	}
}

func TestSQLRepositoryFindByUniqueMissingReturnsNil(t *testing.T) {
	db := openAbilityTestDB(t)
	repo := ability.NewSQLRepository(db)

	item, err := repo.FindByUnique(context.Background(), "数学", 1, "missing")
	if err != nil {
		t.Fatalf("FindByUnique returned error: %v", err)
	}
	if item != nil {
		t.Fatalf("FindByUnique item = %+v, want nil", item)
	}
}

func TestSQLRepositoryListPagination(t *testing.T) {
	db := openAbilityTestDB(t)
	repo := ability.NewSQLRepository(db)
	ctx := context.Background()

	for _, item := range []ability.CreateAbility{
		{Subject: "数学", Grade: 1, Code: "count", Name: "数数", Difficulty: 1},
		{Subject: "数学", Grade: 1, Code: "shape", Name: "图形", Difficulty: 1},
		{Subject: "数学", Grade: 1, Code: "compare", Name: "比较", Difficulty: 1},
		{Subject: "英语", Grade: 1, Code: "word", Name: "单词", Difficulty: 1},
	} {
		if _, err := repo.Create(ctx, item); err != nil {
			t.Fatalf("Create returned error: %v", err)
		}
	}

	result, err := repo.List(ctx, ability.SearchAbilityParams{
		Subject: stringPtr("数学"),
		Grade:   intPtr(1),
		Page:    2,
		Size:    2,
	})
	if err != nil {
		t.Fatalf("List returned error: %v", err)
	}
	if result.Total != 3 {
		t.Fatalf("total = %d, want 3", result.Total)
	}
	if len(result.Data) != 1 || result.Data[0].Code != "compare" {
		t.Fatalf("unexpected page data: %+v", result.Data)
	}
}

var abilityDriverSeq uint64

func openAbilityTestDB(t *testing.T) *sql.DB {
	t.Helper()

	name := fmt.Sprintf("ability_repo_test_%d", atomic.AddUint64(&abilityDriverSeq, 1))
	sql.Register(name, &abilityTestDriver{store: newAbilitySQLStore()})

	db, err := sql.Open(name, "")
	if err != nil {
		t.Fatalf("sql.Open returned error: %v", err)
	}
	t.Cleanup(func() {
		if err := db.Close(); err != nil {
			t.Fatalf("db.Close returned error: %v", err)
		}
	})
	return db
}

type abilitySQLStore struct {
	mu     sync.Mutex
	nextID int64
	items  map[int64]ability.Ability
}

func newAbilitySQLStore() *abilitySQLStore {
	return &abilitySQLStore{
		nextID: 1,
		items:  make(map[int64]ability.Ability),
	}
}

type abilityTestDriver struct {
	store *abilitySQLStore
}

func (d *abilityTestDriver) Open(_ string) (driver.Conn, error) {
	return &abilityTestConn{store: d.store}, nil
}

type abilityTestConn struct {
	store *abilitySQLStore
}

func (c *abilityTestConn) Prepare(_ string) (driver.Stmt, error) {
	return nil, errors.New("prepared statements are not implemented")
}

func (c *abilityTestConn) Close() error {
	return nil
}

func (c *abilityTestConn) Begin() (driver.Tx, error) {
	return abilityTestTx{}, nil
}

func (c *abilityTestConn) BeginTx(_ context.Context, _ driver.TxOptions) (driver.Tx, error) {
	return abilityTestTx{}, nil
}

func (c *abilityTestConn) ExecContext(_ context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	upperQuery := strings.ToUpper(query)
	switch {
	case strings.HasPrefix(upperQuery, "INSERT INTO AH_ABILITY"):
		return c.insertAbility(args)
	case strings.HasPrefix(upperQuery, "UPDATE AH_ABILITY SET"):
		return c.updateAbility(query, args)
	case strings.HasPrefix(upperQuery, "DELETE FROM AH_ABILITY WHERE ID IN"):
		return c.batchDelete(args)
	case strings.HasPrefix(upperQuery, "DELETE FROM AH_ABILITY WHERE ID ="):
		return c.deleteByID(args)
	case strings.HasPrefix(upperQuery, "DELETE FROM AH_ABILITY WHERE SUBJECT ="):
		return c.deleteBySubjectGrade(args)
	default:
		return nil, fmt.Errorf("unexpected exec query: %s", query)
	}
}

func (c *abilityTestConn) QueryContext(_ context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	upperQuery := strings.ToUpper(query)
	items := make([]ability.Ability, 0, len(c.store.items))
	isCountQuery := strings.Contains(upperQuery, "COUNT(ID)")
	switch {
	case strings.Contains(upperQuery, "WHERE ID = ?"):
		id := int64Arg(args, 0)
		if item, ok := c.store.items[id]; ok {
			items = append(items, item)
		}
	case strings.Contains(upperQuery, "WHERE SUBJECT = ? AND GRADE = ? AND CODE = ?"):
		subject := stringArg(args, 0)
		grade := intArg(args, 1)
		code := stringArg(args, 2)
		for _, item := range c.store.items {
			if item.Subject == subject && item.Grade == grade && item.Code == code {
				items = append(items, item)
			}
		}
	case strings.Contains(upperQuery, "WHERE SUBJECT = ? AND GRADE = ?"):
		subject := stringArg(args, 0)
		grade := intArg(args, 1)
		for _, item := range c.store.items {
			if item.Subject == subject && item.Grade == grade {
				items = append(items, item)
			}
		}
	case strings.Contains(upperQuery, "WHERE SUBJECT = ?"):
		subject := stringArg(args, 0)
		for _, item := range c.store.items {
			if item.Subject == subject {
				items = append(items, item)
			}
		}
	case strings.Contains(upperQuery, "WHERE GRADE = ?"):
		grade := intArg(args, 0)
		for _, item := range c.store.items {
			if item.Grade == grade {
				items = append(items, item)
			}
		}
	default:
		for _, item := range c.store.items {
			items = append(items, item)
		}
	}

	sort.Slice(items, func(i int, j int) bool {
		return items[i].ID < items[j].ID
	})
	if isCountQuery {
		return newAbilityCountRows(len(items)), nil
	}
	if strings.Contains(upperQuery, "LIMIT ? OFFSET ?") && len(args) >= 2 {
		limit := intArg(args, len(args)-2)
		offset := intArg(args, len(args)-1)
		if offset >= len(items) {
			items = []ability.Ability{}
		} else {
			end := offset + limit
			if limit <= 0 || end > len(items) {
				end = len(items)
			}
			items = items[offset:end]
		}
	}
	return newAbilityRows(items), nil
}

func (c *abilityTestConn) insertAbility(args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	subject := stringArg(args, 0)
	grade := intArg(args, 1)
	code := stringArg(args, 2)
	if c.hasUnique(subject, grade, code, 0) {
		return nil, duplicateAbilityDriverError()
	}

	id := c.store.nextID
	c.store.nextID++
	c.store.items[id] = ability.Ability{
		ID:          id,
		Subject:     subject,
		Grade:       grade,
		Code:        code,
		Name:        stringArg(args, 3),
		Description: nullableStringArg(args, 4),
		Difficulty:  intArg(args, 5),
		IsActive:    intArg(args, 6),
		CreateTime:  int64Arg(args, 7),
		UpdateTime:  int64Arg(args, 8),
	}
	return abilityResult{lastInsertID: id, rowsAffected: 1}, nil
}

func (c *abilityTestConn) updateAbility(query string, args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	id := int64Arg(args, len(args)-1)
	item, ok := c.store.items[id]
	if !ok {
		return abilityResult{rowsAffected: 0}, nil
	}

	setClause := strings.TrimPrefix(query, "UPDATE ah_ability SET ")
	setClause = strings.TrimSuffix(setClause, " WHERE id = ?")
	assignments := strings.Split(setClause, ", ")
	for i, assignment := range assignments {
		switch assignment {
		case "name = ?":
			item.Name = stringArg(args, i)
		case "code = ?":
			code := stringArg(args, i)
			if c.hasUnique(item.Subject, item.Grade, code, id) {
				return nil, duplicateAbilityDriverError()
			}
			item.Code = code
		case "description = ?":
			item.Description = nullableStringArg(args, i)
		case "difficulty = ?":
			item.Difficulty = intArg(args, i)
		case "is_active = ?":
			item.IsActive = intArg(args, i)
		case "update_time = ?":
			item.UpdateTime = int64Arg(args, i)
		default:
			return nil, fmt.Errorf("unexpected assignment: %s", assignment)
		}
	}

	c.store.items[id] = item
	return abilityResult{rowsAffected: 1}, nil
}

func (c *abilityTestConn) batchDelete(args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	var count int64
	for _, arg := range args {
		id := asInt64(arg.Value)
		if _, ok := c.store.items[id]; ok {
			delete(c.store.items, id)
			count++
		}
	}
	return abilityResult{rowsAffected: count}, nil
}

func (c *abilityTestConn) deleteByID(args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	id := int64Arg(args, 0)
	if _, ok := c.store.items[id]; !ok {
		return abilityResult{rowsAffected: 0}, nil
	}
	delete(c.store.items, id)
	return abilityResult{rowsAffected: 1}, nil
}

func (c *abilityTestConn) deleteBySubjectGrade(args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	subject := stringArg(args, 0)
	grade := intArg(args, 1)
	var count int64
	for id, item := range c.store.items {
		if item.Subject == subject && item.Grade == grade {
			delete(c.store.items, id)
			count++
		}
	}
	return abilityResult{rowsAffected: count}, nil
}

func (c *abilityTestConn) hasUnique(subject string, grade int, code string, exceptID int64) bool {
	for id, item := range c.store.items {
		if id != exceptID && item.Subject == subject && item.Grade == grade && item.Code == code {
			return true
		}
	}
	return false
}

type abilityTestTx struct{}

func (abilityTestTx) Commit() error {
	return nil
}

func (abilityTestTx) Rollback() error {
	return nil
}

type abilityRows struct {
	items []ability.Ability
	index int
}

type abilityCountRows struct {
	value int64
	read  bool
}

func newAbilityCountRows(value int) *abilityCountRows {
	return &abilityCountRows{value: int64(value)}
}

func (r *abilityCountRows) Columns() []string {
	return []string{"count"}
}

func (r *abilityCountRows) Close() error {
	return nil
}

func (r *abilityCountRows) Next(dest []driver.Value) error {
	if r.read {
		return io.EOF
	}
	dest[0] = r.value
	r.read = true
	return nil
}

func newAbilityRows(items []ability.Ability) *abilityRows {
	return &abilityRows{items: items}
}

func (r *abilityRows) Columns() []string {
	return []string{"id", "subject", "grade", "code", "name", "description", "difficulty", "is_active", "create_time", "update_time"}
}

func (r *abilityRows) Close() error {
	return nil
}

func (r *abilityRows) Next(dest []driver.Value) error {
	if r.index >= len(r.items) {
		return io.EOF
	}
	item := r.items[r.index]
	r.index++

	var description any
	if item.Description != nil {
		description = *item.Description
	}

	values := []driver.Value{
		item.ID,
		item.Subject,
		int64(item.Grade),
		item.Code,
		item.Name,
		description,
		int64(item.Difficulty),
		int64(item.IsActive),
		item.CreateTime,
		item.UpdateTime,
	}
	copy(dest, values)
	return nil
}

type abilityResult struct {
	lastInsertID int64
	rowsAffected int64
}

func (r abilityResult) LastInsertId() (int64, error) {
	return r.lastInsertID, nil
}

func (r abilityResult) RowsAffected() (int64, error) {
	return r.rowsAffected, nil
}

func duplicateAbilityDriverError() error {
	return errors.New("Error 1062: Duplicate entry for key 'uk_ability'")
}

func stringArg(args []driver.NamedValue, index int) string {
	value, _ := args[index].Value.(string)
	return value
}

func nullableStringArg(args []driver.NamedValue, index int) *string {
	if args[index].Value == nil {
		return nil
	}
	value := stringArg(args, index)
	return &value
}

func intArg(args []driver.NamedValue, index int) int {
	return int(asInt64(args[index].Value))
}

func int64Arg(args []driver.NamedValue, index int) int64 {
	return asInt64(args[index].Value)
}

func asInt64(value any) int64 {
	switch v := value.(type) {
	case int64:
		return v
	case int:
		return int64(v)
	default:
		return 0
	}
}

func stringPtr(value string) *string {
	return &value
}

func intPtr(value int) *int {
	return &value
}
