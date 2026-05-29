package textbook

import (
	"context"
	"database/sql"
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
	textbookColumns        = "id, subject, version, grade, semester, file, index_file_id, is_parsed"
	unitColumns            = "id, textbook_id, name, content"
	textbookVersionColumns = "id, subject, name, revision_year, is_enabled, create_time, update_time"
	teacherBookColumns     = "id, subject, version, grade, semester, file, index_file_id"
)

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
		"INSERT INTO ah_textbook (subject, version, grade, semester, is_parsed) VALUES (?, ?, ?, ?, ?)",
		data.Subject, data.Version, data.Grade, data.Semester, 0,
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
		"UPDATE ah_textbook SET subject = ?, version = ?, grade = ?, semester = ? WHERE id = ?",
		data.Subject, data.Version, data.Grade, data.Semester, id,
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
	if _, err := r.store.ExecContext(ctx, "DELETE FROM ah_unit WHERE textbook_id = ?", id); err != nil {
		return fmt.Errorf("delete textbook units: %w", err)
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
	return scanTextbookRow(r.store.QueryRowContext(ctx, "SELECT "+textbookColumns+" FROM ah_textbook WHERE id = ? LIMIT 1", id))
}

func (r *SQLRepository) SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) ([]Textbook, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	query := "SELECT " + textbookColumns + " FROM ah_textbook"
	args := make([]any, 0, 4)
	conditions := make([]string, 0, 4)
	if filter.Subject != "" {
		conditions = append(conditions, "subject = ?")
		args = append(args, filter.Subject)
	}
	if filter.Version != "" {
		conditions = append(conditions, "version = ?")
		args = append(args, filter.Version)
	}
	if filter.Grade != nil {
		conditions = append(conditions, "grade = ?")
		args = append(args, *filter.Grade)
	}
	if filter.Semester != "" {
		conditions = append(conditions, "semester = ?")
		args = append(args, filter.Semester)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY subject, grade, version, semester"
	return queryTextbooks(ctx, r.store, query, args...)
}

func (r *SQLRepository) ListTextbookUnits(ctx context.Context, textbookID int64) ([]Unit, error) {
	return r.listUnits(ctx, textbookID)
}

func (r *SQLRepository) CreateUnit(ctx context.Context, data SaveUnitRequest) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	if _, err := r.GetTextbook(ctx, data.TextbookID); err != nil {
		return 0, err
	}
	result, err := r.store.ExecContext(ctx,
		"INSERT INTO ah_unit (textbook_id, name, content) VALUES (?, ?, ?)",
		data.TextbookID, data.Name, data.Content,
	)
	if err != nil {
		return 0, fmt.Errorf("create unit: %w", err)
	}
	return lastInsertID(result, "create unit")
}

func (r *SQLRepository) UpdateUnit(ctx context.Context, id int64, data UpdateUnitRequest) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	sets := make([]string, 0, 2)
	args := make([]any, 0, 3)
	if data.Name != nil {
		sets = append(sets, "name = ?")
		args = append(args, *data.Name)
	}
	if data.Content != nil {
		sets = append(sets, "content = ?")
		args = append(args, *data.Content)
	}
	if len(sets) == 0 {
		_, err := r.getUnit(ctx, id)
		return err
	}
	args = append(args, id)
	result, err := r.store.ExecContext(ctx, "UPDATE ah_unit SET "+strings.Join(sets, ", ")+" WHERE id = ?", args...)
	if err != nil {
		return fmt.Errorf("update unit: %w", err)
	}
	return requireAffectedRow(result, ErrUnitNotFound)
}

func (r *SQLRepository) DeleteUnit(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_unit WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete unit: %w", err)
	}
	return requireAffectedRow(result, ErrUnitNotFound)
}

func (r *SQLRepository) CreateTextbookVersion(ctx context.Context, data SaveTextbookVersionRequest) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	if exists, err := r.textbookVersionExistsByUnique(ctx, data, nil); err != nil {
		return 0, err
	} else if exists {
		return 0, ErrDuplicateTextbookVersion
	}
	now := time.Now().Unix()
	result, err := r.store.ExecContext(ctx,
		"INSERT INTO ah_textbook_version (subject, name, revision_year, is_enabled, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?)",
		data.Subject, data.Name, data.RevisionYear, 1, now, now,
	)
	if err != nil {
		return 0, wrapDuplicateError("create textbook version", err, ErrDuplicateTextbookVersion)
	}
	return lastInsertID(result, "create textbook version")
}

func (r *SQLRepository) UpdateTextbookVersion(ctx context.Context, id int64, data SaveTextbookVersionRequest) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetTextbookVersion(ctx, id); err != nil {
		return err
	}
	if exists, err := r.textbookVersionExistsByUnique(ctx, data, &id); err != nil {
		return err
	} else if exists {
		return ErrDuplicateTextbookVersion
	}
	result, err := r.store.ExecContext(ctx,
		"UPDATE ah_textbook_version SET subject = ?, name = ?, revision_year = ?, update_time = ? WHERE id = ?",
		data.Subject, data.Name, data.RevisionYear, time.Now().Unix(), id,
	)
	if err != nil {
		return wrapDuplicateError("update textbook version", err, ErrDuplicateTextbookVersion)
	}
	return requireAffectedRow(result, ErrTextbookVersionNotFound)
}

func (r *SQLRepository) DeleteTextbookVersion(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	version, err := r.GetTextbookVersion(ctx, id)
	if err != nil {
		return err
	}
	versionName := fmt.Sprintf("%s(%d)", version.Name, version.RevisionYear)
	if used, err := r.versionInUse(ctx, versionName); err != nil {
		return err
	} else if used {
		return ErrTextbookVersionInUse
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_textbook_version WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete textbook version: %w", err)
	}
	return requireAffectedRow(result, ErrTextbookVersionNotFound)
}

func (r *SQLRepository) SetTextbookVersionEnabled(ctx context.Context, id int64, enabled bool) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	isEnabled := 0
	if enabled {
		isEnabled = 1
	}
	result, err := r.store.ExecContext(ctx,
		"UPDATE ah_textbook_version SET is_enabled = ?, update_time = ? WHERE id = ?",
		isEnabled, time.Now().Unix(), id,
	)
	if err != nil {
		return fmt.Errorf("set textbook version enabled: %w", err)
	}
	return requireAffectedRow(result, ErrTextbookVersionNotFound)
}

func (r *SQLRepository) GetTextbookVersion(ctx context.Context, id int64) (*TextbookVersion, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return scanTextbookVersionRow(r.store.QueryRowContext(ctx, "SELECT "+textbookVersionColumns+" FROM ah_textbook_version WHERE id = ? LIMIT 1", id))
}

func (r *SQLRepository) SearchTextbookVersions(ctx context.Context, filter SearchTextbookVersionRequest) ([]TextbookVersion, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	query := "SELECT " + textbookVersionColumns + " FROM ah_textbook_version"
	args := make([]any, 0, 1)
	if filter.Subject != "" {
		query += " WHERE subject = ?"
		args = append(args, filter.Subject)
	}
	query += " ORDER BY create_time DESC"
	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("search textbook versions: %w", err)
	}
	defer rows.Close()
	items := make([]TextbookVersion, 0)
	for rows.Next() {
		item, err := scanTextbookVersion(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate textbook versions: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) CreateTeacherBook(ctx context.Context, data SaveTeacherBookRequest) (int64, error) {
	if err := r.ensureStore(); err != nil {
		return 0, err
	}
	data = normalizeTeacherBook(data)
	if exists, err := r.teacherBookExistsByUnique(ctx, data, nil); err != nil {
		return 0, err
	} else if exists {
		return 0, ErrDuplicateTeacherBook
	}
	result, err := r.store.ExecContext(ctx,
		"INSERT INTO ah_teacher_book (subject, version, grade, semester) VALUES (?, ?, ?, ?)",
		data.Subject, data.Version, data.Grade, data.Semester,
	)
	if err != nil {
		return 0, wrapDuplicateError("create teacher book", err, ErrDuplicateTeacherBook)
	}
	return lastInsertID(result, "create teacher book")
}

func (r *SQLRepository) UpdateTeacherBook(ctx context.Context, id int64, data SaveTeacherBookRequest) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetTeacherBook(ctx, id); err != nil {
		return err
	}
	data = normalizeTeacherBook(data)
	if exists, err := r.teacherBookExistsByUnique(ctx, data, &id); err != nil {
		return err
	} else if exists {
		return ErrDuplicateTeacherBook
	}
	result, err := r.store.ExecContext(ctx,
		"UPDATE ah_teacher_book SET subject = ?, version = ?, grade = ?, semester = ? WHERE id = ?",
		data.Subject, data.Version, data.Grade, data.Semester, id,
	)
	if err != nil {
		return wrapDuplicateError("update teacher book", err, ErrDuplicateTeacherBook)
	}
	return requireAffectedRow(result, ErrTeacherBookNotFound)
}

func (r *SQLRepository) DeleteTeacherBook(ctx context.Context, id int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_teacher_book WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete teacher book: %w", err)
	}
	return requireAffectedRow(result, ErrTeacherBookNotFound)
}

func (r *SQLRepository) GetTeacherBook(ctx context.Context, id int64) (*TeacherBook, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return scanTeacherBookRow(r.store.QueryRowContext(ctx, "SELECT "+teacherBookColumns+" FROM ah_teacher_book WHERE id = ? LIMIT 1", id))
}

func (r *SQLRepository) SearchTeacherBooks(ctx context.Context, filter SearchTeacherBookRequest) ([]TeacherBook, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	rows, err := r.store.QueryContext(ctx,
		"SELECT "+teacherBookColumns+" FROM ah_teacher_book WHERE subject = ? AND grade = ? ORDER BY id",
		filter.Subject, filter.Grade,
	)
	if err != nil {
		return nil, fmt.Errorf("search teacher books: %w", err)
	}
	defer rows.Close()
	items := make([]TeacherBook, 0)
	for rows.Next() {
		item, err := scanTeacherBook(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate teacher books: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) listUnits(ctx context.Context, textbookID int64) ([]Unit, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	rows, err := r.store.QueryContext(ctx, "SELECT "+unitColumns+" FROM ah_unit WHERE textbook_id = ? ORDER BY id", textbookID)
	if err != nil {
		return nil, fmt.Errorf("list textbook units: %w", err)
	}
	defer rows.Close()
	items := make([]Unit, 0)
	for rows.Next() {
		item, err := scanUnit(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate textbook units: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) getUnit(ctx context.Context, id int64) (*Unit, error) {
	item, err := scanUnit(r.store.QueryRowContext(ctx, "SELECT "+unitColumns+" FROM ah_unit WHERE id = ? LIMIT 1", id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUnitNotFound
	}
	return item, err
}

func (r *SQLRepository) textbookExistsByUnique(ctx context.Context, data SaveTextbookRequest, excludeID *int64) (bool, error) {
	query := "SELECT id FROM ah_textbook WHERE subject = ? AND version = ? AND grade = ? AND semester = ?"
	args := []any{data.Subject, data.Version, data.Grade, data.Semester}
	if excludeID != nil {
		query += " AND id != ?"
		args = append(args, *excludeID)
	}
	query += " LIMIT 1"
	return rowExists(r.store.QueryRowContext(ctx, query, args...), "check textbook uniqueness")
}

func (r *SQLRepository) textbookVersionExistsByUnique(ctx context.Context, data SaveTextbookVersionRequest, excludeID *int64) (bool, error) {
	query := "SELECT id FROM ah_textbook_version WHERE subject = ? AND name = ? AND revision_year = ?"
	args := []any{data.Subject, data.Name, data.RevisionYear}
	if excludeID != nil {
		query += " AND id != ?"
		args = append(args, *excludeID)
	}
	query += " LIMIT 1"
	return rowExists(r.store.QueryRowContext(ctx, query, args...), "check textbook version uniqueness")
}

func (r *SQLRepository) teacherBookExistsByUnique(ctx context.Context, data SaveTeacherBookRequest, excludeID *int64) (bool, error) {
	query := "SELECT id FROM ah_teacher_book WHERE subject = ? AND version = ? AND grade = ? AND semester = ?"
	args := []any{data.Subject, data.Version, data.Grade, data.Semester}
	if excludeID != nil {
		query += " AND id != ?"
		args = append(args, *excludeID)
	}
	query += " LIMIT 1"
	return rowExists(r.store.QueryRowContext(ctx, query, args...), "check teacher book uniqueness")
}

func (r *SQLRepository) versionInUse(ctx context.Context, version string) (bool, error) {
	if exists, err := rowExists(r.store.QueryRowContext(ctx, "SELECT id FROM ah_textbook WHERE version = ? LIMIT 1", version), "check textbook version usage"); err != nil || exists {
		return exists, err
	}
	return rowExists(r.store.QueryRowContext(ctx, "SELECT id FROM ah_teacher_book WHERE version = ? LIMIT 1", version), "check teacher book version usage")
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
	var file sql.NullString
	var indexFileID sql.NullString
	if err := s.Scan(&item.ID, &item.Subject, &item.Version, &item.Grade, &item.Semester, &file, &indexFileID, &item.IsParsed); err != nil {
		return nil, err
	}
	item.File = stringPointer(file)
	item.IndexFileID = stringPointer(indexFileID)
	return &item, nil
}

func scanUnit(s scanner) (*Unit, error) {
	var item Unit
	if err := s.Scan(&item.ID, &item.TextbookID, &item.Name, &item.Content); err != nil {
		return nil, err
	}
	return &item, nil
}

func scanTextbookVersionRow(row scanner) (*TextbookVersion, error) {
	item, err := scanTextbookVersion(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTextbookVersionNotFound
	}
	return item, err
}

func scanTextbookVersion(s scanner) (*TextbookVersion, error) {
	var item TextbookVersion
	if err := s.Scan(&item.ID, &item.Subject, &item.Name, &item.RevisionYear, &item.IsEnabled, &item.CreateTime, &item.UpdateTime); err != nil {
		return nil, err
	}
	return &item, nil
}

func scanTeacherBookRow(row scanner) (*TeacherBook, error) {
	item, err := scanTeacherBook(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTeacherBookNotFound
	}
	return item, err
}

func scanTeacherBook(s scanner) (*TeacherBook, error) {
	var item TeacherBook
	var file sql.NullString
	var indexFileID sql.NullString
	if err := s.Scan(&item.ID, &item.Subject, &item.Version, &item.Grade, &item.Semester, &file, &indexFileID); err != nil {
		return nil, err
	}
	item.File = stringPointer(file)
	item.IndexFileID = stringPointer(indexFileID)
	return &item, nil
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
	data.Subject = strings.TrimSpace(data.Subject)
	data.Version = strings.TrimSpace(data.Version)
	data.Semester = strings.TrimSpace(data.Semester)
	return data
}

func normalizeTeacherBook(data SaveTeacherBookRequest) SaveTeacherBookRequest {
	data.Subject = strings.TrimSpace(data.Subject)
	data.Version = strings.TrimSpace(data.Version)
	data.Semester = strings.TrimSpace(data.Semester)
	return data
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
