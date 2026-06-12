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

func TestSQLRepositoryAdminSearchAndMastery(t *testing.T) {
	store := newStudentSQLStore()
	store.students["student-1"] = studentRow{
		name:       "小明",
		phone:      "13800138000",
		grade:      intPtr(4),
		status:     1,
		createTime: 100,
		updateTime: 200,
	}
	store.students["student-2"] = studentRow{
		name:       "小红",
		phone:      "13900139000",
		grade:      intPtr(5),
		status:     0,
		createTime: 90,
		updateTime: 190,
	}
	store.allTextbooks[7] = student.Textbook{ID: 7, Subject: "数学", Version: "人教版", Grade: 4, Semester: "上学期", IsParsed: 1}
	store.mastery = []studentMasteryRow{{id: 5, studentID: "student-1", abilityCode: "MATH-1", score: 88.126, level: "mastered", correct: 8, wrong: 1, createTime: 130, updateTime: 140, abilityName: stringPtr("数感"), subject: stringPtr("数学"), grade: intPtr(4)}}

	db := openStudentTestDB(t, store)
	repo := student.NewSQLRepository(db)

	search, err := repo.SearchStudents(context.Background(), student.SearchStudentsRequest{Page: 1, Size: 20, Keywords: "小", Status: intPtr(1)})
	if err != nil {
		t.Fatalf("SearchStudents returned error: %v", err)
	}
	if search.Total != 1 || len(search.Data) != 1 || search.Data[0].ID != "student-1" {
		t.Fatalf("unexpected search result: %+v", search)
	}

	masteryList, err := repo.ListStudentMastery(context.Background(), "student-1", "数学")
	if err != nil {
		t.Fatalf("ListStudentMastery returned error: %v", err)
	}
	if len(masteryList) != 1 || masteryList[0].AbilityName == nil || *masteryList[0].AbilityName != "数感" {
		t.Fatalf("unexpected mastery list: %+v", masteryList)
	}

	summary, err := repo.GetStudentMasterySummary(context.Background(), "student-1")
	if err != nil {
		t.Fatalf("GetStudentMasterySummary returned error: %v", err)
	}
	if summary.TotalAbilities != 1 || summary.AvgMasteryScore != 88.13 || summary.LevelDistribution["mastered"] != 1 {
		t.Fatalf("unexpected summary: %+v", summary)
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
	status     int
	createTime int64
	updateTime int64
}

type studentMasteryRow struct {
	id               int64
	studentID        string
	abilityCode      string
	score            float64
	level            string
	correct          int
	wrong            int
	lastPracticeTime *int64
	createTime       int64
	updateTime       int64
	abilityName      *string
	subject          *string
	grade            *int
}

type studentSQLStore struct {
	mu           sync.Mutex
	students     map[string]studentRow
	textbooks    map[string][]student.Textbook
	allTextbooks map[int64]student.Textbook
	mastery      []studentMasteryRow
}

func newStudentSQLStore() *studentSQLStore {
	return &studentSQLStore{
		students:     make(map[string]studentRow),
		textbooks:    make(map[string][]student.Textbook),
		allTextbooks: make(map[int64]student.Textbook),
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
	case strings.Contains(query, "COUNT(id) FROM ah_student ") || strings.Contains(query, "COUNT(s.id) FROM ah_student s "):
		return &studentRows{columns: []string{"count"}, values: [][]driver.Value{{int64(len(c.store.filterStudents(query, args)))}}}, nil
	case strings.Contains(query, "FROM ah_student") && (strings.Contains(query, "ORDER BY create_time DESC") || strings.Contains(query, "ORDER BY s.create_time DESC")):
		items := c.store.filterStudents(query, args)
		values := make([][]driver.Value, 0, len(items))
		for id, item := range items {
			values = append(values, adminStudentValues(id, item))
		}
		return &studentRows{
			columns: []string{"id", "name", "phone", "grade", "semester", "subject", "teacher_id", "status", "create_time", "update_time", "t_id", "t_account", "t_name", "t_phone", "t_subject", "t_school", "t_status"},
			values:  values,
		}, nil
	case strings.Contains(query, "FROM ah_student_ability_mastery m") && strings.Contains(query, "LEFT JOIN ah_ability"):
		values := make([][]driver.Value, 0)
		subject := ""
		if len(args) > 1 {
			subject = namedString(args, 1)
		}
		for _, item := range c.store.mastery {
			if item.studentID != studentID {
				continue
			}
			if subject != "" && (item.subject == nil || *item.subject != subject) {
				continue
			}
			values = append(values, masteryValues(item))
		}
		return &studentRows{
			columns: []string{"id", "student_id", "ability_code", "mastery_score", "mastery_level", "correct_count", "wrong_count", "last_practice_time", "create_time", "update_time", "ability_name", "subject", "grade"},
			values:  values,
		}, nil
	case strings.Contains(query, "COUNT(id), AVG(mastery_score)") && strings.Contains(query, "FROM ah_student_ability_mastery"):
		var total int64
		var sum float64
		for _, item := range c.store.mastery {
			if item.studentID == studentID {
				total++
				sum += item.score
			}
		}
		var avg driver.Value
		if total > 0 {
			avg = sum / float64(total)
		}
		return &studentRows{columns: []string{"count", "avg"}, values: [][]driver.Value{{total, avg}}}, nil
	case strings.Contains(query, "SELECT mastery_level, COUNT(id)") && strings.Contains(query, "FROM ah_student_ability_mastery"):
		counts := map[string]int64{}
		for _, item := range c.store.mastery {
			if item.studentID == studentID {
				counts[item.level]++
			}
		}
		values := make([][]driver.Value, 0, len(counts))
		for level, count := range counts {
			values = append(values, []driver.Value{level, count})
		}
		return &studentRows{columns: []string{"mastery_level", "count"}, values: values}, nil
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

func (s *studentSQLStore) filterStudents(query string, args []driver.NamedValue) map[string]studentRow {
	items := make(map[string]studentRow)
	keyword := ""
	status := (*int)(nil)
	index := 0
	if strings.Contains(query, "(name LIKE ? OR phone LIKE ?)") || strings.Contains(query, "(s.name LIKE ? OR s.phone LIKE ?)") {
		keyword = strings.Trim(namedString(args, index), "%")
		index += 2
	}
	if strings.Contains(query, "status = ?") {
		value := int(namedInt64(args, index))
		status = &value
	}
	for id, item := range s.students {
		if keyword != "" && !strings.Contains(item.name, keyword) && !strings.Contains(item.phone, keyword) {
			continue
		}
		if status != nil && item.status != *status {
			continue
		}
		items[id] = item
	}
	return items
}

func adminStudentValues(id string, item studentRow) []driver.Value {
	return []driver.Value{
		id,
		item.name,
		item.phone,
		nullableInt(item.grade),
		nullableString(item.semester),
		nullableString(item.subject),
		nil,
		int64(item.status),
		item.createTime,
		item.updateTime,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
	}
}

func masteryValues(item studentMasteryRow) []driver.Value {
	return []driver.Value{
		item.id,
		item.studentID,
		item.abilityCode,
		item.score,
		item.level,
		int64(item.correct),
		int64(item.wrong),
		nullableInt64(item.lastPracticeTime),
		item.createTime,
		item.updateTime,
		nullableString(item.abilityName),
		nullableString(item.subject),
		nullableInt(item.grade),
	}
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

func nullableInt64(value *int64) driver.Value {
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
