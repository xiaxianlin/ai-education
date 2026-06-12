package ability

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

var (
	ErrAbilityNotFound       = errors.New("能力不存在")
	ErrDuplicateAbility      = errors.New("该科目、年级下已存在相同代码的能力")
	ErrRepositoryUnavailable = errors.New("ability repository is not configured")
)

type Repository interface {
	Create(ctx context.Context, data CreateAbility) (int64, error)
	BatchCreate(ctx context.Context, items []CreateAbility) ([]Ability, error)
	Get(ctx context.Context, id int64) (*Ability, error)
	FindByUnique(ctx context.Context, subject string, grade int, code string) (*Ability, error)
	List(ctx context.Context, params SearchAbilityParams) (SearchAbilitiesResult, error)
	Update(ctx context.Context, id int64, patch UpdateAbilityPatch) error
	Delete(ctx context.Context, id int64) error
	BatchDelete(ctx context.Context, ids []int64) (int, error)
	DeleteBySubjectGrade(ctx context.Context, subject string, grade int) (int, error)
}

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

type txBeginner interface {
	BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)
}

type SQLRepository struct {
	store QueryExecer
}

func NewSQLRepository(store QueryExecer) *SQLRepository {
	return &SQLRepository{store: store}
}

const abilityColumns = "id, subject, grade, code, name, description, difficulty, is_active, create_time, update_time"

func (r *SQLRepository) Create(ctx context.Context, data CreateAbility) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	return createAbility(ctx, r.store, data, time.Now().Unix())
}

func (r *SQLRepository) BatchCreate(ctx context.Context, items []CreateAbility) ([]Ability, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return []Ability{}, nil
	}

	if beginner, ok := r.store.(txBeginner); ok {
		tx, err := beginner.BeginTx(ctx, nil)
		if err != nil {
			return nil, fmt.Errorf("begin ability batch create: %w", err)
		}

		created, err := batchCreateAbilities(ctx, tx, items)
		if err != nil {
			_ = tx.Rollback()
			return nil, err
		}
		if err := tx.Commit(); err != nil {
			return nil, fmt.Errorf("commit ability batch create: %w", err)
		}
		return created, nil
	}

	return batchCreateAbilities(ctx, r.store, items)
}

func (r *SQLRepository) Get(ctx context.Context, id int64) (*Ability, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}

	row := r.store.QueryRowContext(ctx, "SELECT "+abilityColumns+" FROM ah_ability WHERE id = ? LIMIT 1", id)
	item, err := scanAbilityRow(row)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *SQLRepository) FindByUnique(ctx context.Context, subject string, grade int, code string) (*Ability, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}

	row := r.store.QueryRowContext(
		ctx,
		"SELECT "+abilityColumns+" FROM ah_ability WHERE subject = ? AND grade = ? AND code = ? LIMIT 1",
		subject,
		grade,
		code,
	)
	item, err := scanAbilityRow(row)
	if errors.Is(err, ErrAbilityNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *SQLRepository) List(ctx context.Context, params SearchAbilityParams) (SearchAbilitiesResult, error) {
	if err := r.ensureStore(); err != nil {
		return SearchAbilitiesResult{}, err
	}

	whereSQL, args := buildAbilitySearchWhere(params)
	var total int
	if err := r.store.QueryRowContext(ctx, "SELECT COUNT(id) FROM ah_ability"+whereSQL, args...).Scan(&total); err != nil {
		return SearchAbilitiesResult{}, fmt.Errorf("count abilities: %w", err)
	}

	query := "SELECT " + abilityColumns + " FROM ah_ability" + whereSQL + " ORDER BY id"
	listArgs := append([]any{}, args...)
	if !params.Unpaged {
		query += " LIMIT ? OFFSET ?"
		offset := (params.Page - 1) * params.Size
		listArgs = append(listArgs, params.Size, offset)
	}

	rows, err := r.store.QueryContext(ctx, query, listArgs...)
	if err != nil {
		return SearchAbilitiesResult{}, fmt.Errorf("list abilities: %w", err)
	}
	defer rows.Close()

	items := make([]Ability, 0)
	for rows.Next() {
		item, err := scanAbility(rows)
		if err != nil {
			return SearchAbilitiesResult{}, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return SearchAbilitiesResult{}, fmt.Errorf("iterate abilities: %w", err)
	}
	return SearchAbilitiesResult{Total: total, Data: items}, nil
}

func (r *SQLRepository) Update(ctx context.Context, id int64, patch UpdateAbilityPatch) error {
	if err := r.ensureStore(); err != nil {
		return err
	}

	sets := make([]string, 0, 6)
	args := make([]any, 0, 7)
	if patch.Name != nil {
		sets = append(sets, "name = ?")
		args = append(args, *patch.Name)
	}
	if patch.Code != nil {
		sets = append(sets, "code = ?")
		args = append(args, *patch.Code)
	}
	if patch.Description.Set {
		sets = append(sets, "description = ?")
		args = append(args, nullableStringValue(patch.Description.Value))
	}
	if patch.Difficulty != nil {
		sets = append(sets, "difficulty = ?")
		args = append(args, *patch.Difficulty)
	}
	if patch.IsActive != nil {
		sets = append(sets, "is_active = ?")
		args = append(args, *patch.IsActive)
	}
	sets = append(sets, "update_time = ?")
	args = append(args, time.Now().Unix(), id)

	result, err := r.store.ExecContext(ctx, "UPDATE ah_ability SET "+strings.Join(sets, ", ")+" WHERE id = ?", args...)
	if err != nil {
		return wrapAbilityWriteError("update ability", err)
	}
	return requireAffectedRow(result, ErrAbilityNotFound)
}

func (r *SQLRepository) Delete(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}

	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_ability WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete ability: %w", err)
	}
	return requireAffectedRow(result, ErrAbilityNotFound)
}

func (r *SQLRepository) BatchDelete(ctx context.Context, ids []int64) (int, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	if len(ids) == 0 {
		return 0, nil
	}

	placeholders := makePlaceholders(len(ids))
	args := make([]any, 0, len(ids))
	for _, id := range ids {
		args = append(args, id)
	}

	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_ability WHERE id IN ("+placeholders+")", args...)
	if err != nil {
		return 0, fmt.Errorf("batch delete abilities: %w", err)
	}
	return affectedRows(result), nil
}

func (r *SQLRepository) DeleteBySubjectGrade(ctx context.Context, subject string, grade int) (int, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}

	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_ability WHERE subject = ? AND grade = ?", subject, grade)
	if err != nil {
		return 0, fmt.Errorf("delete abilities by subject grade: %w", err)
	}
	return affectedRows(result), nil
}

func (r *SQLRepository) ensureStore() error {
	if r == nil || r.store == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

func batchCreateAbilities(ctx context.Context, store QueryExecer, items []CreateAbility) ([]Ability, error) {
	created := make([]Ability, 0, len(items))
	now := time.Now().Unix()
	for _, item := range items {
		id, err := createAbility(ctx, store, item, now)
		if err != nil {
			return nil, err
		}
		created = append(created, Ability{
			ID:          id,
			Subject:     item.Subject,
			Grade:       item.Grade,
			Code:        item.Code,
			Name:        item.Name,
			Description: item.Description,
			Difficulty:  item.Difficulty,
			IsActive:    1,
			CreateTime:  now,
			UpdateTime:  now,
		})
	}
	return created, nil
}

func createAbility(ctx context.Context, store QueryExecer, data CreateAbility, now int64) (int64, error) {
	result, err := store.ExecContext(
		ctx,
		`INSERT INTO ah_ability (subject, grade, code, name, description, difficulty, is_active, create_time, update_time)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		data.Subject,
		data.Grade,
		data.Code,
		data.Name,
		nullableStringValue(data.Description),
		data.Difficulty,
		1,
		now,
		now,
	)
	if err != nil {
		return 0, wrapAbilityWriteError("create ability", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("create ability last insert id: %w", err)
	}
	return id, nil
}

type abilityScanner interface {
	Scan(dest ...any) error
}

func scanAbilityRow(row abilityScanner) (*Ability, error) {
	item, err := scanAbility(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrAbilityNotFound
	}
	return item, err
}

func scanAbility(scanner abilityScanner) (*Ability, error) {
	var item Ability
	var description sql.NullString
	if err := scanner.Scan(
		&item.ID,
		&item.Subject,
		&item.Grade,
		&item.Code,
		&item.Name,
		&description,
		&item.Difficulty,
		&item.IsActive,
		&item.CreateTime,
		&item.UpdateTime,
	); err != nil {
		return nil, err
	}
	if description.Valid {
		item.Description = &description.String
	}
	return &item, nil
}

func requireAffectedRow(result sql.Result, notFound error) error {
	rows := affectedRows(result)
	if rows == 0 {
		return notFound
	}
	return nil
}

func affectedRows(result sql.Result) int {
	rows, err := result.RowsAffected()
	if err != nil {
		return 0
	}
	return int(rows)
}

func makePlaceholders(count int) string {
	placeholders := make([]string, count)
	for i := range placeholders {
		placeholders[i] = "?"
	}
	return strings.Join(placeholders, ", ")
}

func buildAbilitySearchWhere(params SearchAbilityParams) (string, []any) {
	args := make([]any, 0, 2)
	conditions := make([]string, 0, 2)
	if params.Subject != nil {
		conditions = append(conditions, "subject = ?")
		args = append(args, *params.Subject)
	}
	if params.Grade != nil {
		conditions = append(conditions, "grade = ?")
		args = append(args, *params.Grade)
	}
	if len(conditions) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conditions, " AND "), args
}

func nullableStringValue(value *string) any {
	if value == nil {
		return nil
	}
	return *value
}

func wrapAbilityWriteError(operation string, err error) error {
	if isDuplicateAbilityError(err) {
		return ErrDuplicateAbility
	}
	return fmt.Errorf("%s: %w", operation, err)
}

func isDuplicateAbilityError(err error) bool {
	if err == nil {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "1062") ||
		strings.Contains(message, "duplicate") ||
		strings.Contains(message, "unique constraint") ||
		strings.Contains(message, "uk_ability")
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func newValidationError(message string) error {
	return &ValidationError{Message: message}
}

func IsValidationError(err error) bool {
	var validationErr *ValidationError
	return errors.As(err, &validationErr)
}
