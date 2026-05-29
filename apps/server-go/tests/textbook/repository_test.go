package textbook_test

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
	"strings"
	"sync"
	"sync/atomic"
	"testing"

	"ai-education/server-go/internal/textbook"
)

func TestSQLRepositoryTextbookUnitAndVersionFlow(t *testing.T) {
	store := newTextbookSQLStore()
	repo := textbook.NewSQLRepository(openTextbookTestDB(t, store))
	ctx := context.Background()

	textbookID, err := repo.CreateTextbook(ctx, textbook.SaveTextbookRequest{
		Subject:  " 数学 ",
		Version:  "人教版",
		Grade:    3,
		Semester: " 上学期 ",
	})
	if err != nil {
		t.Fatalf("CreateTextbook returned error: %v", err)
	}
	if textbookID != 1 {
		t.Fatalf("CreateTextbook id = %d, want 1", textbookID)
	}

	_, err = repo.CreateTextbook(ctx, textbook.SaveTextbookRequest{Subject: "数学", Version: "人教版", Grade: 3, Semester: "上学期"})
	if !errors.Is(err, textbook.ErrDuplicateTextbook) {
		t.Fatalf("duplicate CreateTextbook error = %v, want %v", err, textbook.ErrDuplicateTextbook)
	}

	unitID, err := repo.CreateUnit(ctx, textbook.SaveUnitRequest{TextbookID: textbookID, Name: "第一单元", Content: "数与运算"})
	if err != nil {
		t.Fatalf("CreateUnit returned error: %v", err)
	}
	newContent := "整数运算"
	if err := repo.UpdateUnit(ctx, unitID, textbook.UpdateUnitRequest{Content: &newContent}); err != nil {
		t.Fatalf("UpdateUnit returned error: %v", err)
	}

	units, err := repo.ListUnitsByTextbook(ctx, textbookID)
	if err != nil {
		t.Fatalf("ListUnitsByTextbook returned error: %v", err)
	}
	if len(units) != 1 || units[0].Content != newContent {
		t.Fatalf("unexpected units: %+v", units)
	}

	versionID, err := repo.CreateTextbookVersion(ctx, textbook.SaveTextbookVersionRequest{Subject: "数学", Name: "人教版", RevisionYear: 2024})
	if err != nil {
		t.Fatalf("CreateTextbookVersion returned error: %v", err)
	}
	store.teacherBooks[1] = textbook.TeacherBook{ID: 1, Subject: "数学", Version: "人教版(2024)", Grade: 3, Semester: "上学期"}
	err = repo.DeleteTextbookVersion(ctx, versionID)
	if !errors.Is(err, textbook.ErrTextbookVersionInUse) {
		t.Fatalf("DeleteTextbookVersion in use error = %v, want %v", err, textbook.ErrTextbookVersionInUse)
	}

	if err := repo.DeleteTextbook(ctx, textbookID); err != nil {
		t.Fatalf("DeleteTextbook returned error: %v", err)
	}
	if len(store.units) != 0 {
		t.Fatalf("DeleteTextbook did not delete units: %+v", store.units)
	}
}

func TestSQLRepositorySearchTeacherBooks(t *testing.T) {
	store := newTextbookSQLStore()
	store.teacherBooks[1] = textbook.TeacherBook{ID: 1, Subject: "数学", Version: "人教版", Grade: 3, Semester: "上学期"}
	store.teacherBooks[2] = textbook.TeacherBook{ID: 2, Subject: "语文", Version: "统编版", Grade: 3, Semester: "上学期"}
	repo := textbook.NewSQLRepository(openTextbookTestDB(t, store))

	items, err := repo.SearchTeacherBooks(context.Background(), textbook.SearchTeacherBookRequest{Subject: "数学", Grade: 3})
	if err != nil {
		t.Fatalf("SearchTeacherBooks returned error: %v", err)
	}
	if len(items) != 1 || items[0].Subject != "数学" {
		t.Fatalf("unexpected teacher books: %+v", items)
	}
}

var textbookDriverSeq uint64

func openTextbookTestDB(t *testing.T, store *textbookSQLStore) *sql.DB {
	t.Helper()
	name := fmt.Sprintf("textbook_repo_test_%d", atomic.AddUint64(&textbookDriverSeq, 1))
	sql.Register(name, &textbookTestDriver{store: store})
	db, err := sql.Open(name, "")
	if err != nil {
		t.Fatalf("sql.Open returned error: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

type textbookSQLStore struct {
	mu           sync.Mutex
	nextID       int64
	textbooks    map[int64]textbook.Textbook
	units        map[int64]textbook.Unit
	versions     map[int64]textbook.TextbookVersion
	teacherBooks map[int64]textbook.TeacherBook
}

func newTextbookSQLStore() *textbookSQLStore {
	return &textbookSQLStore{
		nextID:       1,
		textbooks:    make(map[int64]textbook.Textbook),
		units:        make(map[int64]textbook.Unit),
		versions:     make(map[int64]textbook.TextbookVersion),
		teacherBooks: make(map[int64]textbook.TeacherBook),
	}
}

type textbookTestDriver struct{ store *textbookSQLStore }

func (d *textbookTestDriver) Open(_ string) (driver.Conn, error) {
	return &textbookTestConn{store: d.store}, nil
}

type textbookTestConn struct{ store *textbookSQLStore }

func (c *textbookTestConn) Prepare(_ string) (driver.Stmt, error) {
	return nil, fmt.Errorf("prepare is not implemented")
}
func (c *textbookTestConn) Close() error { return nil }
func (c *textbookTestConn) Begin() (driver.Tx, error) {
	return nil, fmt.Errorf("begin is not implemented")
}

func (c *textbookTestConn) ExecContext(_ context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()
	lowerQuery := strings.ToLower(query)
	switch {
	case strings.HasPrefix(lowerQuery, "insert into ah_textbook "):
		id := c.nextID()
		c.store.textbooks[id] = textbook.Textbook{ID: id, Subject: namedString(args, 0), Version: namedString(args, 1), Grade: int(namedInt64(args, 2)), Semester: namedString(args, 3), IsParsed: int(namedInt64(args, 4))}
		return textbookResult{id: id, rows: 1}, nil
	case strings.HasPrefix(lowerQuery, "delete from ah_unit where textbook_id"):
		textbookID := namedInt64(args, 0)
		count := int64(0)
		for id, item := range c.store.units {
			if item.TextbookID == textbookID {
				delete(c.store.units, id)
				count++
			}
		}
		return driver.RowsAffected(count), nil
	case strings.HasPrefix(lowerQuery, "delete from ah_textbook"):
		id := namedInt64(args, 0)
		if _, ok := c.store.textbooks[id]; !ok {
			return driver.RowsAffected(0), nil
		}
		delete(c.store.textbooks, id)
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "insert into ah_unit"):
		id := c.nextID()
		c.store.units[id] = textbook.Unit{ID: id, TextbookID: namedInt64(args, 0), Name: namedString(args, 1), Content: namedString(args, 2)}
		return textbookResult{id: id, rows: 1}, nil
	case strings.HasPrefix(lowerQuery, "update ah_unit set"):
		id := namedInt64(args, len(args)-1)
		item, ok := c.store.units[id]
		if !ok {
			return driver.RowsAffected(0), nil
		}
		if strings.Contains(lowerQuery, "content = ?") {
			item.Content = namedString(args, 0)
		}
		c.store.units[id] = item
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "insert into ah_textbook_version"):
		id := c.nextID()
		c.store.versions[id] = textbook.TextbookVersion{ID: id, Subject: namedString(args, 0), Name: namedString(args, 1), RevisionYear: int(namedInt64(args, 2)), IsEnabled: int(namedInt64(args, 3)), CreateTime: namedInt64(args, 4), UpdateTime: namedInt64(args, 5)}
		return textbookResult{id: id, rows: 1}, nil
	case strings.HasPrefix(lowerQuery, "delete from ah_textbook_version"):
		id := namedInt64(args, 0)
		if _, ok := c.store.versions[id]; !ok {
			return driver.RowsAffected(0), nil
		}
		delete(c.store.versions, id)
		return driver.RowsAffected(1), nil
	default:
		return nil, fmt.Errorf("unexpected exec: %s", query)
	}
}

func (c *textbookTestConn) QueryContext(_ context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()
	lowerQuery := strings.ToLower(query)
	switch {
	case strings.HasPrefix(lowerQuery, "select id from ah_textbook where subject"):
		return singleIDRows(c.findTextbookUnique(args)), nil
	case strings.HasPrefix(lowerQuery, "select id from ah_textbook where version"):
		return singleIDRows(c.findTextbookByVersion(namedString(args, 0))), nil
	case strings.HasPrefix(lowerQuery, "select id from ah_teacher_book where version"):
		return singleIDRows(c.findTeacherBookByVersion(namedString(args, 0))), nil
	case strings.Contains(lowerQuery, "from ah_textbook where id"):
		id := namedInt64(args, 0)
		item, ok := c.store.textbooks[id]
		if !ok {
			return emptyRows(textbookColumns()), nil
		}
		return &textbookRows{columns: textbookColumns(), values: [][]driver.Value{textbookValues(item)}}, nil
	case strings.Contains(lowerQuery, "from ah_unit where textbook_id"):
		textbookID := namedInt64(args, 0)
		values := make([][]driver.Value, 0)
		for _, item := range c.store.units {
			if item.TextbookID == textbookID {
				values = append(values, []driver.Value{item.ID, item.TextbookID, item.Name, item.Content})
			}
		}
		return &textbookRows{columns: []string{"id", "textbook_id", "name", "content"}, values: values}, nil
	case strings.HasPrefix(lowerQuery, "select id from ah_textbook_version where subject"):
		return singleIDRows(c.findVersionUnique(args)), nil
	case strings.Contains(lowerQuery, "from ah_textbook_version where id"):
		id := namedInt64(args, 0)
		item, ok := c.store.versions[id]
		if !ok {
			return emptyRows(versionColumns()), nil
		}
		return &textbookRows{columns: versionColumns(), values: [][]driver.Value{{item.ID, item.Subject, item.Name, int64(item.RevisionYear), int64(item.IsEnabled), item.CreateTime, item.UpdateTime}}}, nil
	case strings.Contains(lowerQuery, "from ah_teacher_book where subject"):
		subject := namedString(args, 0)
		grade := int(namedInt64(args, 1))
		values := make([][]driver.Value, 0)
		for _, item := range c.store.teacherBooks {
			if item.Subject == subject && item.Grade == grade {
				values = append(values, teacherBookValues(item))
			}
		}
		return &textbookRows{columns: teacherBookColumns(), values: values}, nil
	default:
		return nil, fmt.Errorf("unexpected query: %s", query)
	}
}

func (c *textbookTestConn) nextID() int64 {
	id := c.store.nextID
	c.store.nextID++
	return id
}

func (c *textbookTestConn) findTextbookUnique(args []driver.NamedValue) *int64 {
	for id, item := range c.store.textbooks {
		if item.Subject == namedString(args, 0) && item.Version == namedString(args, 1) && item.Grade == int(namedInt64(args, 2)) && item.Semester == namedString(args, 3) {
			return &id
		}
	}
	return nil
}

func (c *textbookTestConn) findVersionUnique(args []driver.NamedValue) *int64 {
	for id, item := range c.store.versions {
		if item.Subject == namedString(args, 0) && item.Name == namedString(args, 1) && item.RevisionYear == int(namedInt64(args, 2)) {
			return &id
		}
	}
	return nil
}

func (c *textbookTestConn) findTextbookByVersion(version string) *int64 {
	for id, item := range c.store.textbooks {
		if item.Version == version {
			return &id
		}
	}
	return nil
}

func (c *textbookTestConn) findTeacherBookByVersion(version string) *int64 {
	for id, item := range c.store.teacherBooks {
		if item.Version == version {
			return &id
		}
	}
	return nil
}

type textbookRows struct {
	columns []string
	values  [][]driver.Value
	index   int
}

type textbookResult struct {
	id   int64
	rows int64
}

func (r textbookResult) LastInsertId() (int64, error) { return r.id, nil }
func (r textbookResult) RowsAffected() (int64, error) { return r.rows, nil }

func (r *textbookRows) Columns() []string { return r.columns }
func (r *textbookRows) Close() error      { return nil }
func (r *textbookRows) Next(dest []driver.Value) error {
	if r.index >= len(r.values) {
		return io.EOF
	}
	copy(dest, r.values[r.index])
	r.index++
	return nil
}

func singleIDRows(id *int64) driver.Rows {
	if id == nil {
		return emptyRows([]string{"id"})
	}
	return &textbookRows{columns: []string{"id"}, values: [][]driver.Value{{*id}}}
}

func emptyRows(columns []string) driver.Rows {
	return &textbookRows{columns: columns}
}

func textbookColumns() []string {
	return []string{"id", "subject", "version", "grade", "semester", "file", "index_file_id", "is_parsed"}
}

func versionColumns() []string {
	return []string{"id", "subject", "name", "revision_year", "is_enabled", "create_time", "update_time"}
}

func teacherBookColumns() []string {
	return []string{"id", "subject", "version", "grade", "semester", "file", "index_file_id"}
}

func textbookValues(item textbook.Textbook) []driver.Value {
	return []driver.Value{item.ID, item.Subject, item.Version, int64(item.Grade), item.Semester, nullableString(item.File), nullableString(item.IndexFileID), int64(item.IsParsed)}
}

func teacherBookValues(item textbook.TeacherBook) []driver.Value {
	return []driver.Value{item.ID, item.Subject, item.Version, int64(item.Grade), item.Semester, nullableString(item.File), nullableString(item.IndexFileID)}
}

func namedString(args []driver.NamedValue, index int) string {
	value, _ := args[index].Value.(string)
	return value
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

func nullableString(value *string) driver.Value {
	if value == nil {
		return nil
	}
	return *value
}
