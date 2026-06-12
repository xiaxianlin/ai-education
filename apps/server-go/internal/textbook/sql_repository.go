package textbook

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
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
	textbookColumns = "tb.id, tb.teacher_id, t.name AS teacher_name, tb.subject, tb.version, tb.grade, tb.semester"
	textbookFrom    = "ah_textbook tb LEFT JOIN ah_teacher t ON t.id = tb.teacher_id"
)

type textbookUnitJSON struct {
	ID        int64  `json:"id"`
	SortOrder int    `json:"sort_order,omitempty"`
	Name      string `json:"name"`
	Content   string `json:"content"`
}

func (r *SQLRepository) ListUnitsByTextbook(ctx context.Context, textbookID int64) ([]Unit, error) {
	return r.listUnits(ctx, textbookID)
}

func (r *SQLRepository) CreateTextbook(ctx context.Context, data SaveTextbookRequest) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	data = normalizeTextbook(data)
	if exists, err := r.textbookExistsByUnique(ctx, data, nil); err != nil {
		return 0, err
	} else if exists {
		return 0, ErrDuplicateTextbook
	}

	result, err := r.store.ExecContext(ctx,
		"INSERT INTO ah_textbook (teacher_id, subject, version, grade, semester) VALUES (?, ?, ?, ?, ?)",
		nullableStringArg(data.TeacherID), data.Subject, data.Version, data.Grade, data.Semester,
	)
	if err != nil {
		return 0, wrapDuplicateError("create textbook", err, ErrDuplicateTextbook)
	}
	return lastInsertID(result, "create textbook")
}

func (r *SQLRepository) UpdateTextbook(ctx context.Context, id int64, data SaveTextbookRequest) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetTextbook(ctx, id); err != nil {
		return err
	}
	data = normalizeTextbook(data)
	if exists, err := r.textbookExistsByUnique(ctx, data, &id); err != nil {
		return err
	} else if exists {
		return ErrDuplicateTextbook
	}

	result, err := r.store.ExecContext(ctx,
		"UPDATE ah_textbook SET teacher_id = ?, subject = ?, version = ?, grade = ?, semester = ? WHERE id = ?",
		nullableStringArg(data.TeacherID), data.Subject, data.Version, data.Grade, data.Semester, id,
	)
	if err != nil {
		return wrapDuplicateError("update textbook", err, ErrDuplicateTextbook)
	}
	return requireAffectedRow(result, ErrTextbookNotFound)
}

func (r *SQLRepository) DeleteTextbook(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetTextbook(ctx, id); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_textbook WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete textbook: %w", err)
	}
	return requireAffectedRow(result, ErrTextbookNotFound)
}

func (r *SQLRepository) GetTextbook(ctx context.Context, id int64) (*Textbook, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return scanTextbookRow(r.store.QueryRowContext(ctx, "SELECT "+textbookColumns+" FROM "+textbookFrom+" WHERE tb.id = ? LIMIT 1", id))
}

func (r *SQLRepository) SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) (SearchTextbookResult, error) {
	if err := r.ensureStore(); err != nil {
		return SearchTextbookResult{}, err
	}
	filter = normalizeSearchTextbook(filter)
	whereSQL, args := buildTextbookSearchWhere(filter)

	var total int
	if err := r.store.QueryRowContext(ctx, "SELECT COUNT(tb.id) FROM ah_textbook tb"+whereSQL, args...).Scan(&total); err != nil {
		return SearchTextbookResult{}, fmt.Errorf("count textbooks: %w", err)
	}

	query := "SELECT " + textbookColumns + " FROM " + textbookFrom + whereSQL + " ORDER BY tb.subject, tb.grade, tb.version, tb.semester, tb.id LIMIT ? OFFSET ?"
	listArgs := append([]any{}, args...)
	listArgs = append(listArgs, filter.Size, (filter.Page-1)*filter.Size)
	items, err := queryTextbooks(ctx, r.store, query, listArgs...)
	if err != nil {
		return SearchTextbookResult{}, err
	}
	return SearchTextbookResult{Total: total, Data: items}, nil
}

func buildTextbookSearchWhere(filter SearchTextbookRequest) (string, []any) {
	args := make([]any, 0, 5)
	conditions := make([]string, 0, 5)
	if filter.TeacherID != nil {
		conditions = append(conditions, "tb.teacher_id = ?")
		args = append(args, *filter.TeacherID)
	}
	if filter.Subject != "" {
		conditions = append(conditions, "tb.subject = ?")
		args = append(args, filter.Subject)
	}
	if filter.Version != "" {
		conditions = append(conditions, "tb.version = ?")
		args = append(args, filter.Version)
	}
	if filter.Grade != nil {
		conditions = append(conditions, "tb.grade = ?")
		args = append(args, *filter.Grade)
	}
	if filter.Semester != "" {
		conditions = append(conditions, "tb.semester = ?")
		args = append(args, filter.Semester)
	}
	if len(conditions) > 0 {
		return " WHERE " + strings.Join(conditions, " AND "), args
	}
	return "", args
}

func (r *SQLRepository) ListTextbookUnits(ctx context.Context, textbookID int64) ([]Unit, error) {
	return r.listUnits(ctx, textbookID)
}

func (r *SQLRepository) CreateUnit(ctx context.Context, data SaveUnitRequest) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	units, err := r.listUnits(ctx, data.TextbookID)
	if err != nil {
		return 0, err
	}
	nextID := nextUnitID(units)
	units = append(units, Unit{
		ID:         nextID,
		TextbookID: data.TextbookID,
		Name:       data.Name,
		Content:    data.Content,
	})
	err = r.saveTextbookUnits(ctx, data.TextbookID, units)
	if err != nil {
		return 0, fmt.Errorf("create unit: %w", err)
	}
	return nextID, nil
}

func (r *SQLRepository) UpdateUnit(ctx context.Context, id int64, data UpdateUnitRequest) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if data.Name == nil && data.Content == nil {
		_, _, err := r.findUnit(ctx, id)
		return err
	}
	textbookID, units, err := r.findUnit(ctx, id)
	if err != nil {
		return err
	}
	for index := range units {
		if units[index].ID != id {
			continue
		}
		if data.Name != nil {
			units[index].Name = *data.Name
		}
		if data.Content != nil {
			units[index].Content = *data.Content
		}
		return r.saveTextbookUnits(ctx, textbookID, units)
	}
	return ErrUnitNotFound
}

func (r *SQLRepository) DeleteUnit(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	textbookID, units, err := r.findUnit(ctx, id)
	if err != nil {
		return err
	}
	nextUnits := make([]Unit, 0, len(units))
	for _, unit := range units {
		if unit.ID != id {
			nextUnits = append(nextUnits, unit)
		}
	}
	if len(nextUnits) == len(units) {
		return ErrUnitNotFound
	}
	return r.saveTextbookUnits(ctx, textbookID, nextUnits)
}

func (r *SQLRepository) listUnits(ctx context.Context, textbookID int64) ([]Unit, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	var raw sql.NullString
	err := r.store.QueryRowContext(ctx, "SELECT units FROM ah_textbook WHERE id = ? LIMIT 1", textbookID).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTextbookNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("list textbook units: %w", err)
	}
	if !raw.Valid || strings.TrimSpace(raw.String) == "" {
		return []Unit{}, nil
	}
	return decodeTextbookUnits(textbookID, []byte(raw.String))
}

func (r *SQLRepository) findUnit(ctx context.Context, id int64) (int64, []Unit, error) {
	rows, err := r.store.QueryContext(ctx, "SELECT id, units FROM ah_textbook WHERE units IS NOT NULL AND JSON_LENGTH(units) > 0")
	if err != nil {
		return 0, nil, fmt.Errorf("find textbook unit: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var textbookID int64
		var raw sql.NullString
		if err := rows.Scan(&textbookID, &raw); err != nil {
			return 0, nil, fmt.Errorf("scan textbook units: %w", err)
		}
		if !raw.Valid || strings.TrimSpace(raw.String) == "" {
			continue
		}
		units, err := decodeTextbookUnits(textbookID, []byte(raw.String))
		if err != nil {
			return 0, nil, err
		}
		for _, unit := range units {
			if unit.ID == id {
				return textbookID, units, nil
			}
		}
	}
	if err := rows.Err(); err != nil {
		return 0, nil, fmt.Errorf("iterate textbook units: %w", err)
	}
	return 0, nil, ErrUnitNotFound
}

func (r *SQLRepository) saveTextbookUnits(ctx context.Context, textbookID int64, units []Unit) error {
	payload, err := json.Marshal(encodeTextbookUnits(textbookID, units))
	if err != nil {
		return fmt.Errorf("encode textbook units: %w", err)
	}
	result, err := r.store.ExecContext(ctx, "UPDATE ah_textbook SET units = ? WHERE id = ?", string(payload), textbookID)
	if err != nil {
		return fmt.Errorf("save textbook units: %w", err)
	}
	return requireAffectedRow(result, ErrTextbookNotFound)
}

func (r *SQLRepository) textbookExistsByUnique(ctx context.Context, data SaveTextbookRequest, excludeID *int64) (bool, error) {
	query := "SELECT id FROM ah_textbook WHERE ((teacher_id IS NULL AND ? IS NULL) OR teacher_id = ?) AND subject = ? AND version = ? AND grade = ? AND semester = ?"
	teacherID := nullableStringArg(data.TeacherID)
	args := []any{teacherID, teacherID, data.Subject, data.Version, data.Grade, data.Semester}
	if excludeID != nil {
		query += " AND id != ?"
		args = append(args, *excludeID)
	}
	query += " LIMIT 1"
	return rowExists(r.store.QueryRowContext(ctx, query, args...), "check textbook uniqueness")
}

func (r *SQLRepository) ensureStore() error {
	if r == nil || r.store == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

type scanner interface {
	Scan(dest ...any) error
}

func queryTextbooks(ctx context.Context, store Queryer, query string, args ...any) ([]Textbook, error) {
	rows, err := store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("search textbooks: %w", err)
	}
	defer rows.Close()
	items := make([]Textbook, 0)
	for rows.Next() {
		item, err := scanTextbook(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate textbooks: %w", err)
	}
	return items, nil
}

func scanTextbookRow(row scanner) (*Textbook, error) {
	item, err := scanTextbook(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTextbookNotFound
	}
	return item, err
}

func scanTextbook(s scanner) (*Textbook, error) {
	var item Textbook
	var teacherID sql.NullString
	var teacherName sql.NullString
	if err := s.Scan(&item.ID, &teacherID, &teacherName, &item.Subject, &item.Version, &item.Grade, &item.Semester); err != nil {
		return nil, err
	}
	item.TeacherID = stringPointer(teacherID)
	item.TeacherName = stringPointer(teacherName)
	return &item, nil
}

func scanUnit(s scanner) (*Unit, error) {
	var item Unit
	if err := s.Scan(&item.ID, &item.TextbookID, &item.Name, &item.Content); err != nil {
		return nil, err
	}
	return &item, nil
}

func decodeTextbookUnits(textbookID int64, raw []byte) ([]Unit, error) {
	var payload []textbookUnitJSON
	if err := json.Unmarshal(raw, &payload); err != nil {
		return nil, fmt.Errorf("decode textbook units: %w", err)
	}
	units := make([]Unit, 0, len(payload))
	for index, item := range payload {
		id := item.ID
		if id == 0 {
			id = int64(index + 1)
		}
		units = append(units, Unit{
			ID:         id,
			TextbookID: textbookID,
			Name:       item.Name,
			Content:    item.Content,
		})
	}
	return units, nil
}

func encodeTextbookUnits(_ int64, units []Unit) []textbookUnitJSON {
	payload := make([]textbookUnitJSON, 0, len(units))
	for index, unit := range units {
		payload = append(payload, textbookUnitJSON{
			ID:        unit.ID,
			SortOrder: index + 1,
			Name:      unit.Name,
			Content:   unit.Content,
		})
	}
	return payload
}

func nextUnitID(units []Unit) int64 {
	var maxID int64
	for _, unit := range units {
		if unit.ID > maxID {
			maxID = unit.ID
		}
	}
	return maxID + 1
}

func requireAffectedRow(result sql.Result, notFound error) error {
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("read affected rows: %w", err)
	}
	if rows == 0 {
		return notFound
	}
	return nil
}

func lastInsertID(result sql.Result, operation string) (int64, error) {
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("%s last insert id: %w", operation, err)
	}
	return id, nil
}

func rowExists(row scanner, operation string) (bool, error) {
	var id int64
	if err := row.Scan(&id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("%s: %w", operation, err)
	}
	return true, nil
}

func normalizeTextbook(data SaveTextbookRequest) SaveTextbookRequest {
	data.TeacherID = normalizeOptionalString(data.TeacherID)
	data.Subject = strings.TrimSpace(data.Subject)
	data.Version = strings.TrimSpace(data.Version)
	data.Semester = strings.TrimSpace(data.Semester)
	return data
}

func normalizeSearchTextbook(filter SearchTextbookRequest) SearchTextbookRequest {
	filter.TeacherID = normalizeOptionalString(filter.TeacherID)
	filter.Subject = strings.TrimSpace(filter.Subject)
	filter.Version = strings.TrimSpace(filter.Version)
	filter.Semester = strings.TrimSpace(filter.Semester)
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Size <= 0 {
		filter.Size = 20
	}
	if filter.Size > 100 {
		filter.Size = 100
	}
	return filter
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

func nullableStringArg(value *string) any {
	if value == nil {
		return nil
	}
	return *value
}

func stringPointer(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}

func wrapDuplicateError(operation string, err error, duplicate error) error {
	if isDuplicateError(err) {
		return duplicate
	}
	return fmt.Errorf("%s: %w", operation, err)
}

func isDuplicateError(err error) bool {
	if err == nil {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "1062") ||
		strings.Contains(message, "duplicate") ||
		strings.Contains(message, "unique constraint")
}
