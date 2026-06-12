package mastery_test

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

	"ai-education/server-go/internal/mastery"
)

func TestSQLRepositoryListSummaryAndStatistics(t *testing.T) {
	store := newMasterySQLStore()
	store.mastery = []mastery.Mastery{
		{ID: 1, StudentID: "student-1", AbilityCode: "MATH-1", MasteryScore: 45, MasteryLevel: mastery.MasteryLevelBeginner, CorrectCount: 2, WrongCount: 3, CreateTime: 10, UpdateTime: 20},
		{ID: 2, StudentID: "student-1", AbilityCode: "MATH-2", MasteryScore: 82, MasteryLevel: mastery.MasteryLevelMastered, CorrectCount: 8, WrongCount: 1, CreateTime: 11, UpdateTime: 21},
		{ID: 3, StudentID: "student-2", AbilityCode: "MATH-1", MasteryScore: 10, MasteryLevel: mastery.MasteryLevelUnlearned, CreateTime: 12, UpdateTime: 22},
	}
	store.abilities = map[string]masteryAbility{
		"MATH-1": {name: "数感", subject: "数学", grade: 3},
		"MATH-2": {name: "运算", subject: "数学", grade: 4},
	}
	store.practices = []practiceRow{
		{studentID: "student-1", practiceType: "unit_practice", status: 2, answerCount: 10, correctCount: 8, createTime: 100},
		{studentID: "student-1", practiceType: "ability_practice", status: 2, answerCount: 5, correctCount: 2, createTime: 200},
		{studentID: "student-1", practiceType: "ability_practice", status: 3, answerCount: 9, correctCount: 9, createTime: 300},
	}

	repo := mastery.NewSQLRepository(openMasteryTestDB(t, store))
	grade := 3
	items, err := repo.ListMastery(context.Background(), "student-1", mastery.MasteryFilter{Grade: &grade})
	if err != nil {
		t.Fatalf("ListMastery returned error: %v", err)
	}
	if len(items) != 1 || items[0].AbilityCode != "MATH-1" || items[0].AbilityName == nil || *items[0].AbilityName != "数感" {
		t.Fatalf("unexpected mastery items: %+v", items)
	}

	weak, err := repo.ListWeakMastery(context.Background(), "student-1", 60, 5)
	if err != nil {
		t.Fatalf("ListWeakMastery returned error: %v", err)
	}
	if len(weak) != 1 || weak[0].AbilityCode != "MATH-1" {
		t.Fatalf("unexpected weak items: %+v", weak)
	}

	summary, err := repo.GetSummary(context.Background(), "student-1")
	if err != nil {
		t.Fatalf("GetSummary returned error: %v", err)
	}
	if summary.TotalAbilities != 2 || summary.PracticedAbilities != 2 || summary.AvgMasteryScore != 63.5 || summary.LevelDistribution["beginner"] != 1 {
		t.Fatalf("unexpected summary: %+v", summary)
	}

	start := int64(150)
	stats, err := repo.GetPracticeStatistics(context.Background(), "student-1", &start)
	if err != nil {
		t.Fatalf("GetPracticeStatistics returned error: %v", err)
	}
	if stats.TotalPractices != 1 || stats.TotalQuestions != 5 || stats.CompletedAbilityPractices != 1 || stats.TotalAccuracy != 40 || stats.AverageAccuracy != 40 {
		t.Fatalf("unexpected stats: %+v", stats)
	}
}

var masteryDriverSeq uint64

func openMasteryTestDB(t *testing.T, store *masterySQLStore) *sql.DB {
	t.Helper()
	name := fmt.Sprintf("mastery_repo_test_%d", atomic.AddUint64(&masteryDriverSeq, 1))
	sql.Register(name, &masteryTestDriver{store: store})
	db, err := sql.Open(name, "")
	if err != nil {
		t.Fatalf("sql.Open returned error: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

type masteryAbility struct {
	name    string
	subject string
	grade   int
}

type practiceRow struct {
	studentID    string
	practiceType string
	status       int
	answerCount  int
	correctCount int
	createTime   int64
}

type masterySQLStore struct {
	mu        sync.Mutex
	mastery   []mastery.Mastery
	abilities map[string]masteryAbility
	practices []practiceRow
}

func newMasterySQLStore() *masterySQLStore {
	return &masterySQLStore{abilities: make(map[string]masteryAbility)}
}

type masteryTestDriver struct{ store *masterySQLStore }

func (d *masteryTestDriver) Open(_ string) (driver.Conn, error) {
	return &masteryTestConn{store: d.store}, nil
}

type masteryTestConn struct{ store *masterySQLStore }

func (c *masteryTestConn) Prepare(_ string) (driver.Stmt, error) {
	return nil, fmt.Errorf("prepare is not implemented")
}
func (c *masteryTestConn) Close() error { return nil }
func (c *masteryTestConn) Begin() (driver.Tx, error) {
	return nil, fmt.Errorf("begin is not implemented")
}

func (c *masteryTestConn) QueryContext(_ context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	c.store.mu.Lock()
	defer c.store.mu.Unlock()
	lowerQuery := strings.ToLower(query)
	switch {
	case strings.Contains(lowerQuery, "from ah_student_ability_mastery m left join"):
		return c.queryMasteryList(query, args), nil
	case strings.Contains(lowerQuery, "from ah_student_ability_mastery m where") && strings.Contains(lowerQuery, "mastery_score <"):
		return c.queryWeakMastery(args), nil
	case strings.Contains(lowerQuery, "count(id), avg(mastery_score)"):
		return c.queryMasteryTotals(args), nil
	case strings.Contains(lowerQuery, "group by mastery_level"):
		return c.queryMasteryLevels(args), nil
	case strings.Contains(lowerQuery, "from ah_practice") && strings.Contains(lowerQuery, "avg(correct_count"):
		return c.queryAverageAccuracy(query, args), nil
	case strings.Contains(lowerQuery, "from ah_practice"):
		return c.queryPracticeTotals(query, args), nil
	default:
		return nil, fmt.Errorf("unexpected query: %s", query)
	}
}

func (c *masteryTestConn) queryMasteryList(query string, args []driver.NamedValue) driver.Rows {
	studentID := namedString(args, 0)
	hasGrade := strings.Contains(query, "a.grade = ?")
	grade := int(namedInt64(args, len(args)-1))
	values := make([][]driver.Value, 0)
	for _, item := range c.store.mastery {
		ability := c.store.abilities[item.AbilityCode]
		if item.StudentID != studentID || (hasGrade && ability.grade != grade) {
			continue
		}
		values = append(values, masteryRowValues(item, ability))
	}
	return &masteryRows{columns: []string{"id", "student_id", "ability_code", "mastery_score", "mastery_level", "correct_count", "wrong_count", "last_practice_time", "create_time", "update_time", "ability_name", "subject", "grade"}, values: values}
}

func (c *masteryTestConn) queryWeakMastery(args []driver.NamedValue) driver.Rows {
	studentID := namedString(args, 0)
	threshold := namedFloat64(args, 1)
	values := make([][]driver.Value, 0)
	for _, item := range c.store.mastery {
		if item.StudentID == studentID && item.MasteryScore < threshold {
			values = append(values, masteryOnlyRowValues(item))
		}
	}
	return &masteryRows{columns: masteryOnlyColumns(), values: values}
}

func (c *masteryTestConn) queryMasteryTotals(args []driver.NamedValue) driver.Rows {
	studentID := namedString(args, 0)
	count := 0
	sum := 0.0
	for _, item := range c.store.mastery {
		if item.StudentID == studentID {
			count++
			sum += item.MasteryScore
		}
	}
	var avg driver.Value
	if count > 0 {
		avg = sum / float64(count)
	}
	return &masteryRows{columns: []string{"count", "avg"}, values: [][]driver.Value{{int64(count), avg}}}
}

func (c *masteryTestConn) queryMasteryLevels(args []driver.NamedValue) driver.Rows {
	studentID := namedString(args, 0)
	counts := make(map[string]int64)
	for _, item := range c.store.mastery {
		if item.StudentID == studentID {
			counts[string(item.MasteryLevel)]++
		}
	}
	values := make([][]driver.Value, 0, len(counts))
	for level, count := range counts {
		values = append(values, []driver.Value{level, count})
	}
	return &masteryRows{columns: []string{"mastery_level", "count"}, values: values}
}

func (c *masteryTestConn) queryPracticeTotals(query string, args []driver.NamedValue) driver.Rows {
	filtered := c.filterPractices(query, args)
	totalQuestions := int64(0)
	totalCorrect := int64(0)
	completedUnit := int64(0)
	completedAbility := int64(0)
	for _, item := range filtered {
		totalQuestions += int64(item.answerCount)
		totalCorrect += int64(item.correctCount)
		if item.status == 2 && item.practiceType == "unit_practice" {
			completedUnit++
		}
		if item.status == 2 && item.practiceType == "ability_practice" {
			completedAbility++
		}
	}
	return &masteryRows{columns: []string{"count", "answers", "unit", "ability", "correct"}, values: [][]driver.Value{{int64(len(filtered)), totalQuestions, completedUnit, completedAbility, totalCorrect}}}
}

func (c *masteryTestConn) queryAverageAccuracy(query string, args []driver.NamedValue) driver.Rows {
	filtered := c.filterPractices(query, args)
	count := 0
	sum := 0.0
	for _, item := range filtered {
		if item.status == 2 && item.answerCount > 0 {
			count++
			sum += float64(item.correctCount) * 100 / float64(item.answerCount)
		}
	}
	var avg driver.Value
	if count > 0 {
		avg = sum / float64(count)
	}
	return &masteryRows{columns: []string{"avg"}, values: [][]driver.Value{{avg}}}
}

func (c *masteryTestConn) filterPractices(query string, args []driver.NamedValue) []practiceRow {
	studentID := namedString(args, 0)
	var start *int64
	if strings.Contains(query, "create_time >= ?") {
		value := namedInt64(args, 1)
		start = &value
	}
	items := make([]practiceRow, 0)
	for _, item := range c.store.practices {
		if item.studentID != studentID || item.status == 3 {
			continue
		}
		if start != nil && item.createTime < *start {
			continue
		}
		items = append(items, item)
	}
	return items
}

type masteryRows struct {
	columns []string
	values  [][]driver.Value
	index   int
}

func (r *masteryRows) Columns() []string { return r.columns }
func (r *masteryRows) Close() error      { return nil }
func (r *masteryRows) Next(dest []driver.Value) error {
	if r.index >= len(r.values) {
		return io.EOF
	}
	copy(dest, r.values[r.index])
	r.index++
	return nil
}

func masteryOnlyColumns() []string {
	return []string{"id", "student_id", "ability_code", "mastery_score", "mastery_level", "correct_count", "wrong_count", "last_practice_time", "create_time", "update_time"}
}

func masteryOnlyRowValues(item mastery.Mastery) []driver.Value {
	return []driver.Value{item.ID, item.StudentID, item.AbilityCode, item.MasteryScore, string(item.MasteryLevel), int64(item.CorrectCount), int64(item.WrongCount), nullableInt64(item.LastPracticeTime), item.CreateTime, item.UpdateTime}
}

func masteryRowValues(item mastery.Mastery, ability masteryAbility) []driver.Value {
	return append(masteryOnlyRowValues(item), ability.name, ability.subject, int64(ability.grade))
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

func namedFloat64(args []driver.NamedValue, index int) float64 {
	switch value := args[index].Value.(type) {
	case float64:
		return value
	case int:
		return float64(value)
	default:
		return 0
	}
}

func nullableInt64(value *int64) driver.Value {
	if value == nil {
		return nil
	}
	return *value
}
