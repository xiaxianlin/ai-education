package mastery

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
)

type Queryer interface {
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type SQLRepository struct {
	store Queryer
}

func NewSQLRepository(store Queryer) *SQLRepository {
	return &SQLRepository{store: store}
}

const masteryColumns = "m.id, m.student_id, m.ability_code, m.mastery_score, m.mastery_level, m.correct_count, m.wrong_count, m.last_practice_time, m.create_time, m.update_time"

func (r *SQLRepository) ListMastery(ctx context.Context, studentID string, filter MasteryFilter) ([]MasteryWithInfo, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}

	query := "SELECT " + masteryColumns + ", a.name AS ability_name, a.subject, a.grade FROM ah_student_ability_mastery m LEFT JOIN ah_ability a ON m.ability_code = a.code WHERE m.student_id = ?"
	args := []any{studentID}
	if filter.Subject != nil {
		query += " AND a.subject = ?"
		args = append(args, *filter.Subject)
	}
	if filter.Grade != nil {
		query += " AND a.grade = ?"
		args = append(args, *filter.Grade)
	}
	query += " ORDER BY m.mastery_score ASC"

	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list mastery: %w", err)
	}
	defer rows.Close()

	items := make([]MasteryWithInfo, 0)
	for rows.Next() {
		item, err := scanMasteryWithInfo(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate mastery: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) ListWeakMastery(ctx context.Context, studentID string, threshold float64, limit int) ([]Mastery, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	rows, err := r.store.QueryContext(ctx,
		"SELECT "+masteryColumns+" FROM ah_student_ability_mastery m WHERE m.student_id = ? AND m.mastery_score < ? ORDER BY m.mastery_score ASC LIMIT ?",
		studentID, threshold, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("list weak mastery: %w", err)
	}
	defer rows.Close()

	items := make([]Mastery, 0)
	for rows.Next() {
		item, err := scanMastery(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate weak mastery: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) GetSummary(ctx context.Context, studentID string) (Summary, error) {
	if err := r.ensureStore(); err != nil {
		return Summary{}, err
	}

	var total int
	var avg sql.NullFloat64
	if err := r.store.QueryRowContext(ctx,
		"SELECT COUNT(id), AVG(mastery_score) FROM ah_student_ability_mastery WHERE student_id = ?",
		studentID,
	).Scan(&total, &avg); err != nil {
		return Summary{}, fmt.Errorf("get mastery summary totals: %w", err)
	}

	rows, err := r.store.QueryContext(ctx,
		"SELECT mastery_level, COUNT(id) FROM ah_student_ability_mastery WHERE student_id = ? GROUP BY mastery_level",
		studentID,
	)
	if err != nil {
		return Summary{}, fmt.Errorf("get mastery summary levels: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int)
	for rows.Next() {
		var level string
		var count int
		if err := rows.Scan(&level, &count); err != nil {
			return Summary{}, fmt.Errorf("scan mastery summary level: %w", err)
		}
		distribution[level] = count
	}
	if err := rows.Err(); err != nil {
		return Summary{}, fmt.Errorf("iterate mastery summary levels: %w", err)
	}

	avgScore := 0.0
	if avg.Valid {
		avgScore = round2(avg.Float64)
	}
	return Summary{
		TotalAbilities:     total,
		PracticedAbilities: total,
		AvgMasteryScore:    avgScore,
		LevelDistribution:  distribution,
	}, nil
}

func (r *SQLRepository) GetPracticeStatistics(ctx context.Context, studentID string, startTime *int64) (Statistics, error) {
	if err := r.ensureStore(); err != nil {
		return Statistics{}, err
	}

	where := "WHERE student_id = ? AND status != 3"
	args := []any{studentID}
	if startTime != nil {
		where += " AND create_time >= ?"
		args = append(args, *startTime)
	}

	var stats Statistics
	var totalQuestions sql.NullInt64
	var totalCorrect sql.NullInt64
	query := `SELECT
COUNT(id),
COALESCE(SUM(answer_count), 0),
COALESCE(SUM(CASE WHEN practice_type = 'unit_practice' AND status = 2 THEN 1 ELSE 0 END), 0),
COALESCE(SUM(CASE WHEN practice_type = 'ability_practice' AND status = 2 THEN 1 ELSE 0 END), 0),
COALESCE(SUM(correct_count), 0)
FROM ah_practice ` + where
	if err := r.store.QueryRowContext(ctx, query, args...).Scan(
		&stats.TotalPractices,
		&totalQuestions,
		&stats.CompletedUnitPractices,
		&stats.CompletedAbilityPractices,
		&totalCorrect,
	); err != nil {
		return Statistics{}, fmt.Errorf("get practice statistics totals: %w", err)
	}
	stats.TotalQuestions = int(totalQuestions.Int64)
	if totalQuestions.Int64 > 0 {
		stats.TotalAccuracy = round2(float64(totalCorrect.Int64) / float64(totalQuestions.Int64) * 100)
	}

	avgQuery := `SELECT AVG(correct_count * 100.0 / answer_count)
FROM ah_practice ` + where + ` AND status = 2 AND answer_count > 0`
	var average sql.NullFloat64
	if err := r.store.QueryRowContext(ctx, avgQuery, args...).Scan(&average); err != nil {
		return Statistics{}, fmt.Errorf("get practice average accuracy: %w", err)
	}
	if average.Valid {
		stats.AverageAccuracy = round2(average.Float64)
	}
	return stats, nil
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

func scanMasteryWithInfo(s scanner) (*MasteryWithInfo, error) {
	var item MasteryWithInfo
	var abilityName sql.NullString
	var subject sql.NullString
	var grade sql.NullInt64
	if err := scanMasteryFields(s, &item.Mastery, &abilityName, &subject, &grade); err != nil {
		return nil, err
	}
	item.AbilityName = stringPointer(abilityName)
	item.Subject = stringPointer(subject)
	item.Grade = intPointer(grade)
	return &item, nil
}

func scanMastery(s scanner) (*Mastery, error) {
	var item Mastery
	if err := scanMasteryFields(s, &item); err != nil {
		return nil, err
	}
	return &item, nil
}

func scanMasteryFields(s scanner, item *Mastery, extra ...any) error {
	var lastPracticeTime sql.NullInt64
	dest := []any{
		&item.ID,
		&item.StudentID,
		&item.AbilityCode,
		&item.MasteryScore,
		&item.MasteryLevel,
		&item.CorrectCount,
		&item.WrongCount,
		&lastPracticeTime,
		&item.CreateTime,
		&item.UpdateTime,
	}
	dest = append(dest, extra...)
	if err := s.Scan(dest...); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return err
		}
		return fmt.Errorf("scan mastery: %w", err)
	}
	item.LastPracticeTime = int64Pointer(lastPracticeTime)
	return nil
}

func int64Pointer(value sql.NullInt64) *int64 {
	if !value.Valid {
		return nil
	}
	return &value.Int64
}

func intPointer(value sql.NullInt64) *int {
	if !value.Valid {
		return nil
	}
	v := int(value.Int64)
	return &v
}

func stringPointer(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}
