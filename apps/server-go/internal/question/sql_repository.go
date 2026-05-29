package question

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Queryer interface {
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type Execer interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}

type QueryExecer interface {
	Queryer
	Execer
}

type SQLRepository struct {
	store QueryExecer
}

func NewSQLRepository(store QueryExecer) *SQLRepository {
	return &SQLRepository{store: store}
}

const (
	questionColumns     = "id, question_type_code, subject, grade, content, answer, difficulty, create_time, update_time"
	questionTypeColumns = "id, code, name, category, description, subject, ability_code, configs, create_time, update_time"
)

func (r *SQLRepository) SearchQuestions(ctx context.Context, params QuestionSearch) ([]Question, int, error) {
	if err := r.ensureStore(); err != nil {
		return nil, 0, err
	}

	where, args := buildQuestionWhere(params)
	var total int
	if err := r.store.QueryRowContext(ctx, "SELECT COUNT(id) FROM ah_question "+where, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count questions: %w", err)
	}

	limit := params.Size
	if limit <= 0 {
		limit = defaultSize
	}
	page := params.Page
	if page <= 0 {
		page = defaultPage
	}
	offset := (page - 1) * limit
	listArgs := append(append([]any(nil), args...), limit, offset)
	rows, err := r.store.QueryContext(ctx, "SELECT "+questionColumns+" FROM ah_question "+where+" ORDER BY create_time DESC LIMIT ? OFFSET ?", listArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("search questions: %w", err)
	}
	defer rows.Close()

	questions := make([]Question, 0)
	for rows.Next() {
		item, err := scanQuestion(rows)
		if err != nil {
			return nil, 0, err
		}
		questions = append(questions, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate questions: %w", err)
	}
	return questions, total, nil
}

func (r *SQLRepository) GetQuestion(ctx context.Context, id string) (*Question, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	question, err := scanQuestionRow(r.store.QueryRowContext(ctx, "SELECT "+questionColumns+" FROM ah_question WHERE id = ? LIMIT 1", id))
	if errors.Is(err, ErrNotFound) {
		return nil, nil
	}
	return question, err
}

func (r *SQLRepository) UpdateQuestion(ctx context.Context, id string, params QuestionUpdate) (*Question, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}

	current, err := r.GetQuestion(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, nil
	}

	content := current.Content
	if params.Content != nil {
		content = *params.Content
	}
	answer := current.Answer
	if params.Answer != nil {
		answer = *params.Answer
	}
	if params.Explanation != nil {
		answer.Explanation = *params.Explanation
	}

	contentJSON, err := marshalJSON(content)
	if err != nil {
		return nil, err
	}
	answerJSON, err := marshalJSON(answer)
	if err != nil {
		return nil, err
	}

	now := time.Now().Unix()
	result, err := r.store.ExecContext(ctx, "UPDATE ah_question SET content = ?, answer = ?, update_time = ? WHERE id = ?", contentJSON, answerJSON, now, id)
	if err != nil {
		return nil, fmt.Errorf("update question: %w", err)
	}
	if affectedRows(result) == 0 {
		return nil, nil
	}
	return r.GetQuestion(ctx, id)
}

func (r *SQLRepository) DeleteQuestion(ctx context.Context, id string) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_question WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete question: %w", err)
	}
	return requireAffectedRow(result, ErrNotFound)
}

func (r *SQLRepository) CreateQuestionType(ctx context.Context, params QuestionTypeSave) (*QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	now := time.Now().Unix()
	result, err := r.store.ExecContext(ctx, `
INSERT INTO ah_question_type (name, code, category, description, subject, ability_code, configs, create_time, update_time)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		params.Name,
		params.Code,
		params.Category,
		nullableString(params.Description),
		nullableString(params.Subject),
		nullableString(params.AbilityCode),
		[]byte("{}"),
		now,
		now,
	)
	if err != nil {
		return nil, fmt.Errorf("create question type: %w", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("create question type last insert id: %w", err)
	}
	return &QuestionType{
		ID:          id,
		Code:        params.Code,
		Name:        params.Name,
		Category:    params.Category,
		Description: derefString(params.Description),
		Subject:     derefString(params.Subject),
		AbilityCode: derefString(params.AbilityCode),
		Configs:     JSONMap{},
		CreateTime:  now,
		UpdateTime:  now,
	}, nil
}

func (r *SQLRepository) UpdateQuestionType(ctx context.Context, id int64, params QuestionTypeSave) (*QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	current, err := r.getQuestionTypeByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, nil
	}

	description := current.Description
	if params.Description != nil {
		description = *params.Description
	}
	subject := current.Subject
	if params.Subject != nil {
		subject = *params.Subject
	}
	abilityCode := current.AbilityCode
	if params.AbilityCode != nil {
		abilityCode = *params.AbilityCode
	}

	result, err := r.store.ExecContext(ctx, `
UPDATE ah_question_type
SET name = ?, code = ?, category = ?, description = ?, subject = ?, ability_code = ?, update_time = ?
WHERE id = ?`,
		params.Name,
		params.Code,
		params.Category,
		nullableStringValue(description),
		nullableStringValue(subject),
		nullableStringValue(abilityCode),
		time.Now().Unix(),
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("update question type: %w", err)
	}
	if affectedRows(result) == 0 {
		return nil, nil
	}
	return r.getQuestionTypeByID(ctx, id)
}

func (r *SQLRepository) DeleteQuestionType(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_question_type WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete question type: %w", err)
	}
	return requireAffectedRow(result, ErrNotFound)
}

func (r *SQLRepository) SearchUnitPracticeTypes(ctx context.Context) ([]QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return queryQuestionTypes(ctx, r.store, "SELECT "+questionTypeColumns+" FROM ah_question_type WHERE category = ? ORDER BY id", QuestionTypeCategoryUnitPractice)
}

func (r *SQLRepository) SearchAbilityPracticeTypes(ctx context.Context, params AbilityPracticeSearch) ([]QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return queryQuestionTypes(ctx, r.store, `
SELECT qt.`+strings.ReplaceAll(questionTypeColumns, ", ", ", qt.")+`
FROM ah_question_type qt
JOIN ah_ability a ON a.code = qt.ability_code
WHERE qt.category = ?
  AND qt.subject = ?
  AND a.grade = ?
  AND a.subject = ?
ORDER BY qt.ability_code, qt.id`,
		QuestionTypeCategoryAbilityPractice,
		params.Subject,
		params.Grade,
		params.Subject,
	)
}

func (r *SQLRepository) GetQuestionTypeByCode(ctx context.Context, code string) (*QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	item, err := scanQuestionTypeRow(r.store.QueryRowContext(ctx, "SELECT "+questionTypeColumns+" FROM ah_question_type WHERE code = ? LIMIT 1", code))
	if errors.Is(err, ErrNotFound) {
		return nil, nil
	}
	return item, err
}

func (r *SQLRepository) UpdateQuestionTypeConfigs(ctx context.Context, code string, configs JSONMap) (*QuestionType, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	configsJSON, err := marshalJSON(configs)
	if err != nil {
		return nil, err
	}
	result, err := r.store.ExecContext(ctx, "UPDATE ah_question_type SET configs = ?, update_time = ? WHERE code = ?", configsJSON, time.Now().Unix(), code)
	if err != nil {
		return nil, fmt.Errorf("update question type configs: %w", err)
	}
	if affectedRows(result) == 0 {
		return nil, nil
	}
	return r.GetQuestionTypeByCode(ctx, code)
}

func (r *SQLRepository) getQuestionTypeByID(ctx context.Context, id int64) (*QuestionType, error) {
	item, err := scanQuestionTypeRow(r.store.QueryRowContext(ctx, "SELECT "+questionTypeColumns+" FROM ah_question_type WHERE id = ? LIMIT 1", id))
	if errors.Is(err, ErrNotFound) {
		return nil, nil
	}
	return item, err
}

func (r *SQLRepository) ensureStore() error {
	if r == nil || r.store == nil {
		return ErrInvalidArgument
	}
	return nil
}

func buildQuestionWhere(params QuestionSearch) (string, []any) {
	conditions := make([]string, 0, 4)
	args := make([]any, 0, 4)
	if strings.TrimSpace(params.ID) != "" {
		conditions = append(conditions, "id = ?")
		args = append(args, strings.TrimSpace(params.ID))
	}
	if strings.TrimSpace(params.QuestionTypeCode) != "" {
		conditions = append(conditions, "question_type_code = ?")
		args = append(args, strings.TrimSpace(params.QuestionTypeCode))
	}
	if strings.TrimSpace(params.Subject) != "" {
		conditions = append(conditions, "subject = ?")
		args = append(args, strings.TrimSpace(params.Subject))
	}
	if params.Grade > 0 {
		conditions = append(conditions, "grade = ?")
		args = append(args, params.Grade)
	}
	if len(conditions) == 0 {
		return "", args
	}
	return "WHERE " + strings.Join(conditions, " AND "), args
}

func queryQuestionTypes(ctx context.Context, store QueryExecer, query string, args ...any) ([]QuestionType, error) {
	rows, err := store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query question types: %w", err)
	}
	defer rows.Close()

	items := make([]QuestionType, 0)
	for rows.Next() {
		item, err := scanQuestionType(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate question types: %w", err)
	}
	return items, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanQuestionRow(row scanner) (*Question, error) {
	item, err := scanQuestion(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return item, err
}

func scanQuestion(scanner scanner) (*Question, error) {
	var item Question
	var contentRaw []byte
	var answerRaw []byte
	var difficulty sql.NullString
	if err := scanner.Scan(
		&item.ID,
		&item.QuestionTypeCode,
		&item.Subject,
		&item.Grade,
		&contentRaw,
		&answerRaw,
		&difficulty,
		&item.CreateTime,
		&item.UpdateTime,
	); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(contentRaw, &item.Content); err != nil {
		return nil, fmt.Errorf("decode question content: %w", err)
	}
	if err := json.Unmarshal(answerRaw, &item.Answer); err != nil {
		return nil, fmt.Errorf("decode question answer: %w", err)
	}
	if difficulty.Valid {
		item.Difficulty = difficulty.String
	}
	return &item, nil
}

func scanQuestionTypeRow(row scanner) (*QuestionType, error) {
	item, err := scanQuestionType(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return item, err
}

func scanQuestionType(scanner scanner) (*QuestionType, error) {
	var item QuestionType
	var description sql.NullString
	var subject sql.NullString
	var abilityCode sql.NullString
	var configsRaw []byte
	if err := scanner.Scan(
		&item.ID,
		&item.Code,
		&item.Name,
		&item.Category,
		&description,
		&subject,
		&abilityCode,
		&configsRaw,
		&item.CreateTime,
		&item.UpdateTime,
	); err != nil {
		return nil, err
	}
	if description.Valid {
		item.Description = description.String
	}
	if subject.Valid {
		item.Subject = subject.String
	}
	if abilityCode.Valid {
		item.AbilityCode = abilityCode.String
	}
	if len(configsRaw) > 0 {
		if err := json.Unmarshal(configsRaw, &item.Configs); err != nil {
			return nil, fmt.Errorf("decode question type configs: %w", err)
		}
	}
	return &item, nil
}

func marshalJSON(value any) ([]byte, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return nil, fmt.Errorf("encode json: %w", err)
	}
	return data, nil
}

func requireAffectedRow(result sql.Result, notFound error) error {
	if affectedRows(result) == 0 {
		return notFound
	}
	return nil
}

func affectedRows(result sql.Result) int64 {
	rows, err := result.RowsAffected()
	if err != nil {
		return 0
	}
	return rows
}

func nullableString(value *string) any {
	if value == nil {
		return nil
	}
	return *value
}

func nullableStringValue(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
