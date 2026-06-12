package textbook_test

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

func TestSQLRepositorySearchTextbooksReturnsPage(t *testing.T) {
	store := newTextbookSQLStore()
	repo := textbook.NewSQLRepository(openTextbookTestDB(t, store))
	ctx := context.Background()
	teacherID := "teacher-system"

	for _, item := range []textbook.SaveTextbookRequest{
		{TeacherID: &teacherID, Subject: "数学", Version: "人教版", Grade: 3, Semester: "上学期"},
		{TeacherID: &teacherID, Subject: "数学", Version: "人教版", Grade: 3, Semester: "下学期"},
		{Subject: "英语", Version: "外研版", Grade: 4, Semester: "上学期"},
	} {
		if _, err := repo.CreateTextbook(ctx, item); err != nil {
			t.Fatalf("CreateTextbook returned error: %v", err)
		}
	}

	result, err := repo.SearchTextbooks(ctx, textbook.SearchTextbookRequest{
		TeacherID: &teacherID,
		Subject:   "数学",
		Page:      2,
		Size:      1,
	})
	if err != nil {
		t.Fatalf("SearchTextbooks returned error: %v", err)
	}
	if result.Total != 2 {
		t.Fatalf("SearchTextbooks total = %d, want 2", result.Total)
	}
	if len(result.Data) != 1 || result.Data[0].Semester != "下学期" {
		t.Fatalf("SearchTextbooks page data = %+v, want second math textbook", result.Data)
	}
	if result.Data[0].TeacherName == nil || *result.Data[0].TeacherName != "系统老师" {
		t.Fatalf("SearchTextbooks teacher name = %v, want 系统老师", result.Data[0].TeacherName)
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
		c.store.textbooks[id] = textbook.Textbook{
			ID:          id,
			TeacherID:   namedOptionalString(args, 0),
			TeacherName: teacherNameForID(namedOptionalString(args, 0)),
			Subject:     namedString(args, 1),
			Version:     namedString(args, 2),
			Grade:       int(namedInt64(args, 3)),
			Semester:    namedString(args, 4),
		}
		return textbookResult{id: id, rows: 1}, nil
	case strings.HasPrefix(lowerQuery, "update ah_textbook set teacher_id"):
		id := namedInt64(args, 5)
		item, ok := c.store.textbooks[id]
		if !ok {
			return driver.RowsAffected(0), nil
		}
		item.TeacherID = namedOptionalString(args, 0)
		item.Subject = namedString(args, 1)
		item.Version = namedString(args, 2)
		item.Grade = int(namedInt64(args, 3))
		item.Semester = namedString(args, 4)
		c.store.textbooks[id] = item
		return driver.RowsAffected(1), nil
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
	case strings.HasPrefix(lowerQuery, "select id from ah_textbook where ((teacher_id"):
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
	case strings.Contains(lowerQuery, "from ah_textbook tb") && strings.Contains(lowerQuery, "where tb.id"):
		id := namedInt64(args, 0)
		item, ok := c.store.textbooks[id]
		if !ok {
			return emptyRows(textbookColumns()), nil
		}
		return &textbookRows{columns: textbookColumns(), values: [][]driver.Value{textbookValues(item)}}, nil
	case strings.HasPrefix(lowerQuery, "select count(tb.id) from ah_textbook tb"):
		items := c.filterTextbooks(lowerQuery, args, false)
		return &textbookRows{columns: []string{"count"}, values: [][]driver.Value{{int64(len(items))}}}, nil
	case strings.HasPrefix(lowerQuery, "select tb.id, tb.teacher_id"):
		items := c.filterTextbooks(lowerQuery, args, true)
		values := make([][]driver.Value, 0, len(items))
		for _, item := range items {
			values = append(values, textbookValues(item))
		}
		return &textbookRows{columns: textbookColumns(), values: values}, nil
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
		if optionalStringEqual(item.TeacherID, namedOptionalString(args, 1)) && item.Subject == namedString(args, 2) && item.Version == namedString(args, 3) && item.Grade == int(namedInt64(args, 4)) && item.Semester == namedString(args, 5) {
			return &id
		}
	}
	return nil
}

func (c *textbookTestConn) filterTextbooks(query string, args []driver.NamedValue, paged bool) []textbook.Textbook {
	argIndex := 0
	var teacherID *string
	if strings.Contains(query, "tb.teacher_id = ?") {
		teacherID = namedOptionalString(args, argIndex)
		argIndex++
	}
	subject := ""
	if strings.Contains(query, "tb.subject = ?") {
		subject = namedString(args, argIndex)
		argIndex++
	}
	version := ""
	if strings.Contains(query, "tb.version = ?") {
		version = namedString(args, argIndex)
		argIndex++
	}
	var grade *int
	if strings.Contains(query, "tb.grade = ?") {
		value := int(namedInt64(args, argIndex))
		grade = &value
		argIndex++
	}
	semester := ""
	if strings.Contains(query, "tb.semester = ?") {
		semester = namedString(args, argIndex)
		argIndex++
	}

	items := make([]textbook.Textbook, 0)
	for _, item := range c.store.textbooks {
		if teacherID != nil && !optionalStringEqual(item.TeacherID, teacherID) {
			continue
		}
		if subject != "" && item.Subject != subject {
			continue
		}
		if version != "" && item.Version != version {
			continue
		}
		if grade != nil && item.Grade != *grade {
			continue
		}
		if semester != "" && item.Semester != semester {
			continue
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		left := items[i]
		right := items[j]
		if left.Subject != right.Subject {
			return left.Subject < right.Subject
		}
		if left.Grade != right.Grade {
			return left.Grade < right.Grade
		}
		if left.Version != right.Version {
			return left.Version < right.Version
		}
		if left.Semester != right.Semester {
			return left.Semester < right.Semester
		}
		return left.ID < right.ID
	})
	if !paged {
		return items
	}
	limit := int(namedInt64(args, argIndex))
	offset := int(namedInt64(args, argIndex+1))
	if offset >= len(items) {
		return []textbook.Textbook{}
	}
	end := offset + limit
	if end > len(items) {
		end = len(items)
	}
	return items[offset:end]
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
	return []string{"id", "teacher_id", "teacher_name", "subject", "version", "grade", "semester"}
}

func textbookValues(item textbook.Textbook) []driver.Value {
	return []driver.Value{item.ID, nullableString(item.TeacherID), nullableString(item.TeacherName), item.Subject, item.Version, int64(item.Grade), item.Semester}
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

func namedOptionalString(args []driver.NamedValue, index int) *string {
	value, ok := args[index].Value.(string)
	if !ok || value == "" {
		return nil
	}
	return &value
}

func optionalStringEqual(left *string, right *string) bool {
	if left == nil || right == nil {
		return left == nil && right == nil
	}
	return *left == *right
}

func teacherNameForID(teacherID *string) *string {
	if teacherID == nil {
		return nil
	}
	name := "系统老师"
	return &name
}
