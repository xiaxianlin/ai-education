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

func TestSQLRepositoryTextbookUnitFlow(t *testing.T) {
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

	if err := repo.DeleteUnit(ctx, unitID); err != nil {
		t.Fatalf("DeleteUnit returned error: %v", err)
	}
	units, err = repo.ListUnitsByTextbook(ctx, textbookID)
	if err != nil {
		t.Fatalf("ListUnitsByTextbook after delete returned error: %v", err)
	}
	if len(units) != 0 {
		t.Fatalf("DeleteUnit did not remove unit: %+v", units)
	}

	if err := repo.DeleteTextbook(ctx, textbookID); err != nil {
		t.Fatalf("DeleteTextbook returned error: %v", err)
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
	textbookUnit map[int64]string
}

func newTextbookSQLStore() *textbookSQLStore {
	return &textbookSQLStore{
		nextID:       1,
		textbooks:    make(map[int64]textbook.Textbook),
		textbookUnit: make(map[int64]string),
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
	case strings.HasPrefix(lowerQuery, "update ah_textbook set units"):
		textbookID := namedInt64(args, 1)
		if _, ok := c.store.textbooks[textbookID]; !ok {
			return driver.RowsAffected(0), nil
		}
		c.store.textbookUnit[textbookID] = namedString(args, 0)
		return driver.RowsAffected(1), nil
	case strings.HasPrefix(lowerQuery, "delete from ah_textbook"):
		id := namedInt64(args, 0)
		if _, ok := c.store.textbooks[id]; !ok {
			return driver.RowsAffected(0), nil
		}
		delete(c.store.textbooks, id)
		delete(c.store.textbookUnit, id)
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
	case strings.HasPrefix(lowerQuery, "select id, units from ah_textbook where units"):
		values := make([][]driver.Value, 0)
		for id, raw := range c.store.textbookUnit {
			values = append(values, []driver.Value{id, raw})
		}
		return &textbookRows{columns: []string{"id", "units"}, values: values}, nil
	case strings.HasPrefix(lowerQuery, "select units from ah_textbook where id"):
		id := namedInt64(args, 0)
		if _, ok := c.store.textbooks[id]; !ok {
			return emptyRows([]string{"units"}), nil
		}
		return &textbookRows{columns: []string{"units"}, values: [][]driver.Value{{c.store.textbookUnit[id]}}}, nil
	case strings.Contains(lowerQuery, "from ah_textbook where id"):
		id := namedInt64(args, 0)
		item, ok := c.store.textbooks[id]
		if !ok {
			return emptyRows(textbookColumns()), nil
		}
		return &textbookRows{columns: textbookColumns(), values: [][]driver.Value{textbookValues(item)}}, nil
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

func textbookValues(item textbook.Textbook) []driver.Value {
	return []driver.Value{item.ID, item.Subject, item.Version, int64(item.Grade), item.Semester, nullableString(item.File), nullableString(item.IndexFileID), int64(item.IsParsed)}
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
