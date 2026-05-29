package student_test

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"io"
	"strings"
	"sync"
	"sync/atomic"
	"testing"

	"ai-education/server-go/internal/student"
)

func TestSQLRepositoryGetProfileAndUpdateSettings(t *testing.T) {
	store := newStudentSQLStore()
	store.students["student-1"] = studentRow{
		name:     "小明",
		phone:    "13800138000",
		grade:    intPtr(4),
		semester: stringPtr("上学期"),
		subject:  stringPtr("数学"),
	}
	store.textbooks["student-1"] = []student.Textbook{
		{ID: 2, Subject: "数学", Version: "人教版", Grade: 4, Semester: "上学期", IsParsed: 1},
	}

	db := openStudentTestDB(t, store)
	repo := student.NewSQLRepository(db)

	profile, err := repo.GetProfile(context.Background(), "student-1")
	if err != nil {
		t.Fatalf("GetProfile returned error: %v", err)
	}
	if profile.Name != "小明" || profile.Grade == nil || *profile.Grade != 4 || len(profile.Textbooks) != 1 {
		t.Fatalf("unexpected profile: %+v", profile)
	}

	err = repo.UpdateSettings(context.Background(), "student-1", student.UpdateSettings{
		Grade:    5,
		Semester: "下学期",
		Subject:  "语文",
	})
	if err != nil {
		t.Fatalf("UpdateSettings returned error: %v", err)
	}

	updated := store.students["student-1"]
	if updated.grade == nil || *updated.grade != 5 || updated.semester == nil || *updated.semester != "下学期" || updated.subject == nil || *updated.subject != "语文" {
		t.Fatalf("settings were not persisted: %+v", updated)
	}
}

var studentDriverSeq uint64

func openStudentTestDB(t *testing.T, store *studentSQLStore) *sql.DB {
	t.Helper()

	name := fmt.Sprintf("student_repo_test_%d", atomic.AddUint64(&studentDriverSeq, 1))
	sql.Register(name, &studentTestDriver{store: store})

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

type studentRow struct {
	name       string
	phone      string
	grade      *int
	semester   *string
	subject    *string
	updateTime int64
}

type studentSQLStore struct {
	mu        sync.Mutex
	students  map[string]studentRow
	textbooks map[string][]student.Textbook
}

func newStudentSQLStore() *studentSQLStore {
	return &studentSQLStore{
		students:  make(map[string]studentRow),
		textbooks: make(map[string][]student.Textbook),
	}
}

type studentTestDriver struct {
	store *studentSQLStore
}

func (d *studentTestDriver) Open(name string) (driver.Conn, error) {
	return &studentTestConn{store: d.store}, nil
}

type studentTestConn struct {
	store *studentSQLStore
}

func (c *studentTestConn) Prepare(query string) (driver.Stmt, error) {
	return nil, fmt.Errorf("Prepare is not implemented")
}

func (c *studentTestConn) Close() error {
	return nil
}

func (c *studentTestConn) Begin() (driver.Tx, error) {
	return nil, fmt.Errorf("Begin is not implemented")
}

func (c *studentTestConn) QueryContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	studentID := namedString(args, 0)
	switch {
	case strings.Contains(query, "FROM ah_student"):
		item, ok := c.store.students[studentID]
		if !ok {
			return &studentRows{columns: []string{"name", "phone", "grade", "semester", "subject"}}, nil
		}
		return &studentRows{
			columns: []string{"name", "phone", "grade", "semester", "subject"},
			values: [][]driver.Value{{
				item.name,
				item.phone,
				nullableInt(item.grade),
				nullableString(item.semester),
				nullableString(item.subject),
			}},
		}, nil
	case strings.Contains(query, "FROM ah_textbook"):
		items := c.store.textbooks[studentID]
		values := make([][]driver.Value, 0, len(items))
		for _, item := range items {
			values = append(values, []driver.Value{
				item.ID,
				item.Subject,
				item.Version,
				int64(item.Grade),
				item.Semester,
				nullableString(item.File),
				nullableString(item.IndexFileID),
				int64(item.IsParsed),
			})
		}
		return &studentRows{
			columns: []string{"id", "subject", "version", "grade", "semester", "file", "index_file_id", "is_parsed"},
			values:  values,
		}, nil
	default:
		return nil, fmt.Errorf("unexpected query: %s", query)
	}
}

func (c *studentTestConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()

	if !strings.Contains(query, "UPDATE ah_student") {
		return nil, fmt.Errorf("unexpected exec: %s", query)
	}

	studentID := namedString(args, 4)
	item, ok := c.store.students[studentID]
	if !ok {
		return driver.RowsAffected(0), nil
	}
	grade := int(namedInt64(args, 0))
	semester := namedString(args, 1)
	subject := namedString(args, 2)
	item.grade = &grade
	item.semester = &semester
	item.subject = &subject
	item.updateTime = namedInt64(args, 3)
	c.store.students[studentID] = item
	return driver.RowsAffected(1), nil
}

type studentRows struct {
	columns []string
	values  [][]driver.Value
	index   int
}

func (r *studentRows) Columns() []string {
	return r.columns
}

func (r *studentRows) Close() error {
	return nil
}

func (r *studentRows) Next(dest []driver.Value) error {
	if r.index >= len(r.values) {
		return io.EOF
	}
	copy(dest, r.values[r.index])
	r.index++
	return nil
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

func nullableInt(value *int) driver.Value {
	if value == nil {
		return nil
	}
	return int64(*value)
}

func nullableString(value *string) driver.Value {
	if value == nil {
		return nil
	}
	return *value
}

func intPtr(value int) *int {
	return &value
}

func stringPtr(value string) *string {
	return &value
}
