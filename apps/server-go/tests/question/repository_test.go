package question_test

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"testing"

	"ai-education/server-go/internal/question"
)

func TestSQLRepositoryQuestionTypeFlow(t *testing.T) {
	store := newQuestionSQLStore()
	repo := question.NewSQLRepository(openQuestionTestDB(t, store))
	ctx := context.Background()

	description := "选择正确答案"
	subject := "数学"
	created, err := repo.CreateQuestionType(ctx, question.QuestionTypeSave{
		Code:        "choice",
		Name:        "选择题",
		Category:    question.QuestionTypeCategoryUnitPractice,
		Description: &description,
		Subject:     &subject,
	})
	if err != nil {
		t.Fatalf("CreateQuestionType returned error: %v", err)
	}
	if created.ID != 1 || created.Configs == nil {
		t.Fatalf("unexpected created question type: %+v", created)
	}

	unitTypes, err := repo.SearchUnitPracticeTypes(ctx)
	if err != nil {
		t.Fatalf("SearchUnitPracticeTypes returned error: %v", err)
	}
	if len(unitTypes) != 1 || unitTypes[0].Code != "choice" {
		t.Fatalf("unexpected unit types: %+v", unitTypes)
	}

	newDescription := "更新后的题型"
	updated, err := repo.UpdateQuestionType(ctx, created.ID, question.QuestionTypeSave{
		Code:        "choice_v2",
		Name:        "选择题 V2",
		Category:    question.QuestionTypeCategoryUnitPractice,
		Description: &newDescription,
	})
	if err != nil {
		t.Fatalf("UpdateQuestionType returned error: %v", err)
	}
	if updated.Code != "choice_v2" || updated.Description != newDescription {
		t.Fatalf("unexpected updated question type: %+v", updated)
	}

	configured, err := repo.UpdateQuestionTypeConfigs(ctx, "choice_v2", question.JSONMap{"max_options": float64(4)})
	if err != nil {
		t.Fatalf("UpdateQuestionTypeConfigs returned error: %v", err)
	}
	if configured.Configs["max_options"] != float64(4) {
		t.Fatalf("unexpected configs: %+v", configured.Configs)
	}

	if err := repo.DeleteQuestionType(ctx, created.ID); err != nil {
		t.Fatalf("DeleteQuestionType returned error: %v", err)
	}
	if found, err := repo.GetQuestionTypeByCode(ctx, "choice_v2"); err != nil || found != nil {
		t.Fatalf("GetQuestionTypeByCode after delete = %+v, %v; want nil, nil", found, err)
	}
}

func TestSQLRepositoryQuestionSearchUpdateDelete(t *testing.T) {
	store := newQuestionSQLStore()
	store.questions["q1"] = question.Question{
		ID:               "q1",
		QuestionTypeCode: "choice",
		Subject:          "数学",
		Grade:            3,
		Content:          question.QuestionContent{Stem: "1+1=?"},
		Answer:           question.QuestionAnswer{Value: nil, CorrectValue: "2", AnalysisMode: "objective"},
		Difficulty:       "easy",
		CreateTime:       10,
		UpdateTime:       10,
	}
	store.questions["q2"] = question.Question{
		ID:               "q2",
		QuestionTypeCode: "fill",
		Subject:          "语文",
		Grade:            3,
		Content:          question.QuestionContent{Stem: "填空"},
		Answer:           question.QuestionAnswer{Value: nil, CorrectValue: "春", AnalysisMode: "objective"},
		CreateTime:       20,
		UpdateTime:       20,
	}
	repo := question.NewSQLRepository(openQuestionTestDB(t, store))
	ctx := context.Background()

	items, total, err := repo.SearchQuestions(ctx, question.QuestionSearch{Subject: "数学", Grade: 3, Page: 1, Size: 10})
	if err != nil {
		t.Fatalf("SearchQuestions returned error: %v", err)
	}
	if total != 1 || len(items) != 1 || items[0].ID != "q1" {
		t.Fatalf("unexpected search result total=%d items=%+v", total, items)
	}

	explanation := "因为 1 加 1 等于 2"
	updated, err := repo.UpdateQuestion(ctx, "q1", question.QuestionUpdate{Explanation: &explanation})
	if err != nil {
		t.Fatalf("UpdateQuestion returned error: %v", err)
	}
	if updated.Answer.Explanation != explanation {
		t.Fatalf("explanation was not persisted: %+v", updated.Answer)
	}

	if err := repo.DeleteQuestion(ctx, "q1"); err != nil {
		t.Fatalf("DeleteQuestion returned error: %v", err)
	}
	if found, err := repo.GetQuestion(ctx, "q1"); err != nil || found != nil {
		t.Fatalf("GetQuestion after delete = %+v, %v; want nil, nil", found, err)
	}
}

var questionDriverSeq uint64

func openQuestionTestDB(t *testing.T, store *questionSQLStore) *sql.DB {
	t.Helper()
	name := fmt.Sprintf("question_repo_test_%d", atomic.AddUint64(&questionDriverSeq, 1))
	sql.Register(name, &questionTestDriver{store: store})
	db, err := sql.Open(name, "")
	if err != nil {
		t.Fatalf("sql.Open returned error: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

type questionSQLStore struct {
	mu        sync.Mutex
	nextID    int64
	types     map[int64]question.QuestionType
	questions map[string]question.Question
	abilities map[string]abilityRecord
}

type abilityRecord struct {
	Code    string
	Subject string
	Grade   int
}

func newQuestionSQLStore() *questionSQLStore {
	return &questionSQLStore{
		nextID:    1,
		types:     make(map[int64]question.QuestionType),
		questions: make(map[string]question.Question),
		abilities: make(map[string]abilityRecord),
	}
}

type questionTestDriver struct{ store *questionSQLStore }

func (d *questionTestDriver) Open(_ string) (driver.Conn, error) {
	return &questionTestConn{store: d.store}, nil
}

type questionTestConn struct{ store *questionSQLStore }

func (c *questionTestConn) Prepare(_ string) (driver.Stmt, error) {
	return nil, fmt.Errorf("prepare is not implemented")
}
func (c *questionTestConn) Close() error { return nil }
func (c *questionTestConn) Begin() (driver.Tx, error) {
	return nil, fmt.Errorf("begin is not implemented")
}

func (c *questionTestConn) ExecContext(_ context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()
	lowerQuery := normalizeSQL(query)
	switch {
	case strings.HasPrefix(lowerQuery, "insert into ah_question_type"):
		id := c.store.nextID
		c.store.nextID++
		now := namedInt64(args, 7)
		c.store.types[id] = question.QuestionType{
			ID:          id,
			Name:        namedString(args, 0),
			Code:        namedString(args, 1),
			Category:    namedString(args, 2),
			Description: namedNullableString(args, 3),
			Subject:     namedNullableString(args, 4),
			AbilityCode: namedNullableString(args, 5),
			Configs:     question.JSONMap{},
			CreateTime:  now,
			UpdateTime:  now,
		}
		return questionResult{id: id, rows: 1}, nil
	case strings.HasPrefix(lowerQuery, "update ah_question_type set name"):
		id := namedInt64(args, 7)
		item, ok := c.store.types[id]
		if !ok {
			return driver.RowsAffected(0), nil
		}
		item.Name = namedString(args, 0)
		item.Code = namedString(args, 1)
		item.Category = namedString(args, 2)
		item.Description = namedNullableString(args, 3)
		item.Subject = namedNullableString(args, 4)
		item.AbilityCode = namedNullableString(args, 5)
		item.UpdateTime = namedInt64(args, 6)
		c.store.types[id] = item
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "update ah_question_type set configs"):
		code := namedString(args, 2)
		for id, item := range c.store.types {
			if item.Code == code {
				item.Configs = decodeJSONMap(namedBytes(args, 0))
				item.UpdateTime = namedInt64(args, 1)
				c.store.types[id] = item
				return driver.RowsAffected(1), nil
			}
		}
		return driver.RowsAffected(0), nil
	case strings.HasPrefix(lowerQuery, "delete from ah_question_type"):
		id := namedInt64(args, 0)
		if _, ok := c.store.types[id]; !ok {
			return driver.RowsAffected(0), nil
		}
		delete(c.store.types, id)
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "update ah_question set content"):
		id := namedString(args, 3)
		item, ok := c.store.questions[id]
		if !ok {
			return driver.RowsAffected(0), nil
		}
		_ = json.Unmarshal(namedBytes(args, 0), &item.Content)
		_ = json.Unmarshal(namedBytes(args, 1), &item.Answer)
		item.UpdateTime = namedInt64(args, 2)
		c.store.questions[id] = item
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "delete from ah_question"):
		id := namedString(args, 0)
		if _, ok := c.store.questions[id]; !ok {
			return driver.RowsAffected(0), nil
		}
		delete(c.store.questions, id)
		return driver.RowsAffected(1), nil
	default:
		return nil, fmt.Errorf("unexpected exec: %s", query)
	}
}

func (c *questionTestConn) QueryContext(_ context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()
	lowerQuery := normalizeSQL(query)
	switch {
	case strings.HasPrefix(lowerQuery, "select count(id) from ah_question"):
		return &questionRows{columns: []string{"count"}, values: [][]driver.Value{{int64(len(c.filterQuestions(lowerQuery, args)))}}}, nil
	case strings.Contains(lowerQuery, "from ah_question where id"):
		id := namedString(args, 0)
		item, ok := c.store.questions[id]
		if !ok {
			return emptyQuestionRows(questionColumns()), nil
		}
		return &questionRows{columns: questionColumns(), values: [][]driver.Value{questionValues(item)}}, nil
	case strings.HasPrefix(lowerQuery, "select id, question_type_code"):
		items := c.filterQuestions(lowerQuery, args)
		sort.Slice(items, func(i, j int) bool { return items[i].CreateTime > items[j].CreateTime })
		values := make([][]driver.Value, 0, len(items))
		for _, item := range items {
			values = append(values, questionValues(item))
		}
		return &questionRows{columns: questionColumns(), values: values}, nil
	case strings.Contains(lowerQuery, "from ah_question_type where id"):
		id := namedInt64(args, 0)
		item, ok := c.store.types[id]
		if !ok {
			return emptyQuestionRows(questionTypeColumns()), nil
		}
		return &questionRows{columns: questionTypeColumns(), values: [][]driver.Value{questionTypeValues(item)}}, nil
	case strings.Contains(lowerQuery, "from ah_question_type where code"):
		code := namedString(args, 0)
		for _, item := range c.store.types {
			if item.Code == code {
				return &questionRows{columns: questionTypeColumns(), values: [][]driver.Value{questionTypeValues(item)}}, nil
			}
		}
		return emptyQuestionRows(questionTypeColumns()), nil
	case strings.Contains(lowerQuery, "from ah_question_type where category"):
		category := namedString(args, 0)
		values := make([][]driver.Value, 0)
		for _, item := range c.store.types {
			if item.Category == category {
				values = append(values, questionTypeValues(item))
			}
		}
		return &questionRows{columns: questionTypeColumns(), values: values}, nil
	case strings.Contains(lowerQuery, "join ah_ability"):
		subject := namedString(args, 1)
		grade := int(namedInt64(args, 2))
		values := make([][]driver.Value, 0)
		for _, item := range c.store.types {
			ability, ok := c.store.abilities[item.AbilityCode]
			if item.Category == question.QuestionTypeCategoryAbilityPractice && item.Subject == subject && ok && ability.Subject == subject && ability.Grade == grade {
				values = append(values, questionTypeValues(item))
			}
		}
		return &questionRows{columns: questionTypeColumns(), values: values}, nil
	default:
		return nil, fmt.Errorf("unexpected query: %s", query)
	}
}

func (c *questionTestConn) filterQuestions(query string, args []driver.NamedValue) []question.Question {
	items := make([]question.Question, 0)
	for _, item := range c.store.questions {
		index := 0
		if strings.Contains(query, "id = ?") {
			if item.ID != namedString(args, index) {
				continue
			}
			index++
		}
		if strings.Contains(query, "question_type_code = ?") {
			if item.QuestionTypeCode != namedString(args, index) {
				continue
			}
			index++
		}
		if strings.Contains(query, "subject = ?") {
			if item.Subject != namedString(args, index) {
				continue
			}
			index++
		}
		if strings.Contains(query, "grade = ?") {
			if item.Grade != int(namedInt64(args, index)) {
				continue
			}
		}
		items = append(items, item)
	}
	return items
}

type questionRows struct {
	columns []string
	values  [][]driver.Value
	index   int
}

type questionResult struct {
	id   int64
	rows int64
}

func (r questionResult) LastInsertId() (int64, error) { return r.id, nil }
func (r questionResult) RowsAffected() (int64, error) { return r.rows, nil }

func (r *questionRows) Columns() []string { return r.columns }
func (r *questionRows) Close() error      { return nil }
func (r *questionRows) Next(dest []driver.Value) error {
	if r.index >= len(r.values) {
		return io.EOF
	}
	copy(dest, r.values[r.index])
	r.index++
	return nil
}

func emptyQuestionRows(columns []string) driver.Rows {
	return &questionRows{columns: columns}
}

func questionColumns() []string {
	return []string{"id", "question_type_code", "subject", "grade", "content", "answer", "difficulty", "create_time", "update_time"}
}

func questionTypeColumns() []string {
	return []string{"id", "code", "name", "category", "description", "subject", "ability_code", "configs", "create_time", "update_time"}
}

func questionValues(item question.Question) []driver.Value {
	content, _ := json.Marshal(item.Content)
	answer, _ := json.Marshal(item.Answer)
	return []driver.Value{item.ID, item.QuestionTypeCode, item.Subject, int64(item.Grade), string(content), string(answer), nullableStringValue(item.Difficulty), item.CreateTime, item.UpdateTime}
}

func questionTypeValues(item question.QuestionType) []driver.Value {
	configs, _ := json.Marshal(item.Configs)
	return []driver.Value{item.ID, item.Code, item.Name, item.Category, nullableStringValue(item.Description), nullableStringValue(item.Subject), nullableStringValue(item.AbilityCode), string(configs), item.CreateTime, item.UpdateTime}
}

func normalizeSQL(query string) string {
	return strings.Join(strings.Fields(strings.ToLower(query)), " ")
}

func namedString(args []driver.NamedValue, index int) string {
	value, _ := args[index].Value.(string)
	return value
}

func namedNullableString(args []driver.NamedValue, index int) string {
	if args[index].Value == nil {
		return ""
	}
	return namedString(args, index)
}

func namedInt64(args []driver.NamedValue, index int) int64 {
	switch value := args[index].Value.(type) {
	case int64:
		return value
	case int:
		return int64(value)
	default:
		return 0
	}
}

func namedBytes(args []driver.NamedValue, index int) []byte {
	switch value := args[index].Value.(type) {
	case []byte:
		return value
	case string:
		return []byte(value)
	default:
		return nil
	}
}

func nullableStringValue(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func decodeJSONMap(data []byte) question.JSONMap {
	var result question.JSONMap
	_ = json.Unmarshal(data, &result)
	return result
}
