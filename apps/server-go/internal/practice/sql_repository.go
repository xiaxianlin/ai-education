package practice

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"ai-education/server-go/internal/ai"
)

type SQLDB interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type SQLRepository struct {
	db SQLDB
}

func NewSQLRepository(db SQLDB) *SQLRepository {
	return &SQLRepository{db: db}
}

func (repo *SQLRepository) CreatePractice(ctx context.Context, session Practice) (Practice, error) {
	if err := repo.ensureDB(); err != nil {
		return Practice{}, err
	}
	_, err := repo.db.ExecContext(ctx, `
INSERT INTO ah_practice (
    id, student_id, practice_type, subject, grade, ability_code, unit_id,
    question_count, answer_count, correct_count, status, generate_status,
    generate_time, start_time, end_time, create_time, update_time
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		session.ID,
		session.StudentID,
		session.PracticeType,
		nullableString(session.Subject),
		nullableInt(session.Grade),
		nullableString(session.AbilityCode),
		nullableInt64(session.UnitID),
		session.QuestionCount,
		session.AnswerCount,
		session.CorrectCount,
		session.Status,
		session.GenerateStatus,
		nullableIntPointer(session.GenerateTime),
		session.StartTime,
		nullableInt64Pointer(session.EndTime),
		session.CreateTime,
		session.UpdateTime,
	)
	if err != nil {
		return Practice{}, fmt.Errorf("create practice: %w", err)
	}
	return session, nil
}

func (repo *SQLRepository) GetOpenPractice(ctx context.Context, studentID string, practiceType string, abilityCode string, unitID int64) (*Practice, error) {
	if err := repo.ensureDB(); err != nil {
		return nil, err
	}

	query := selectPracticeColumns + `
FROM ah_practice
WHERE student_id = ?
  AND practice_type = ?
  AND status != ?`
	args := []any{studentID, practiceType, PracticeStatusCompleted}
	switch practiceType {
	case PracticeTypeAbility:
		query += "\n  AND ability_code = ?"
		args = append(args, abilityCode)
	case PracticeTypeUnit:
		query += "\n  AND unit_id = ?"
		args = append(args, unitID)
	default:
		return nil, newValidationError("无效的练习类型")
	}
	query += "\nORDER BY create_time DESC\nLIMIT 1"

	practice, err := scanPractice(repo.db.QueryRowContext(ctx, query, args...))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get open practice: %w", err)
	}
	return practice, nil
}

func (repo *SQLRepository) GetPractice(ctx context.Context, studentID string, sessionID string) (*Practice, error) {
	if err := repo.ensureDB(); err != nil {
		return nil, err
	}
	practice, err := scanPractice(repo.db.QueryRowContext(ctx, selectPracticeColumns+`
FROM ah_practice
WHERE id = ?
  AND student_id = ?
LIMIT 1`, sessionID, studentID))
	if err != nil {
		return nil, wrapPracticeLookupError("get practice", err)
	}
	return practice, nil
}

func (repo *SQLRepository) GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error) {
	if err := repo.ensureDB(); err != nil {
		return nil, err
	}
	practice, err := scanPractice(repo.db.QueryRowContext(ctx, selectPracticeColumns+`
FROM ah_practice
WHERE id = ?
LIMIT 1`, sessionID))
	if err != nil {
		return nil, wrapPracticeLookupError("get practice by id", err)
	}
	return practice, nil
}

func (repo *SQLRepository) ListPractices(ctx context.Context, params PracticeListParams) (PracticeListResult, error) {
	if err := repo.ensureDB(); err != nil {
		return PracticeListResult{}, err
	}

	page := params.Page
	if page <= 0 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize <= 0 {
		pageSize = 20
	}
	where, args := buildPracticeListWhere(params)

	var total int
	countQuery := "SELECT COUNT(*) FROM ah_practice " + where
	if err := repo.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return PracticeListResult{}, fmt.Errorf("count practices: %w", err)
	}

	offset := (page - 1) * pageSize
	listArgs := append(append([]any(nil), args...), pageSize, offset)
	rows, err := repo.db.QueryContext(ctx, selectPracticeColumns+`
FROM ah_practice
`+where+`
ORDER BY create_time DESC
LIMIT ? OFFSET ?`, listArgs...)
	if err != nil {
		return PracticeListResult{}, fmt.Errorf("list practices: %w", err)
	}
	defer rows.Close()

	practices := make([]Practice, 0)
	for rows.Next() {
		practice, err := scanPracticeRows(rows)
		if err != nil {
			return PracticeListResult{}, err
		}
		practices = append(practices, *practice)
	}
	if err := rows.Err(); err != nil {
		return PracticeListResult{}, fmt.Errorf("iterate practices: %w", err)
	}

	return PracticeListResult{
		Data:     practices,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (repo *SQLRepository) UpdatePractice(ctx context.Context, session Practice) error {
	if err := repo.ensureDB(); err != nil {
		return err
	}
	result, err := repo.db.ExecContext(ctx, `
UPDATE ah_practice
SET subject = ?,
    grade = ?,
    ability_code = ?,
    unit_id = ?,
    question_count = ?,
    answer_count = ?,
    correct_count = ?,
    status = ?,
    generate_status = ?,
    generate_time = ?,
    start_time = ?,
    end_time = ?,
    update_time = ?
WHERE id = ?
  AND student_id = ?`,
		nullableString(session.Subject),
		nullableInt(session.Grade),
		nullableString(session.AbilityCode),
		nullableInt64(session.UnitID),
		session.QuestionCount,
		session.AnswerCount,
		session.CorrectCount,
		session.Status,
		session.GenerateStatus,
		nullableIntPointer(session.GenerateTime),
		session.StartTime,
		nullableInt64Pointer(session.EndTime),
		session.UpdateTime,
		session.ID,
		session.StudentID,
	)
	if err != nil {
		return fmt.Errorf("update practice: %w", err)
	}
	return requireRowsAffected(result)
}

func (repo *SQLRepository) PersistGeneratedPractice(ctx context.Context, sessionID string, questions []ai.GeneratedQuestion, generateTime *int) (Practice, error) {
	if err := repo.ensureDB(); err != nil {
		return Practice{}, err
	}

	runner := repo.db
	var tx *sql.Tx
	if beginner, ok := repo.db.(interface {
		BeginTx(context.Context, *sql.TxOptions) (*sql.Tx, error)
	}); ok {
		started, err := beginner.BeginTx(ctx, nil)
		if err != nil {
			return Practice{}, fmt.Errorf("begin persist generated practice: %w", err)
		}
		tx = started
		runner = started
		defer tx.Rollback()
	}

	session, err := scanPractice(runner.QueryRowContext(ctx, selectPracticeColumns+`
FROM ah_practice
WHERE id = ?
LIMIT 1`, sessionID))
	if err != nil {
		return Practice{}, wrapPracticeLookupError("get practice for generated questions", err)
	}

	if _, err := runner.ExecContext(ctx, `DELETE FROM ah_practice_answer WHERE session_id = ?`, sessionID); err != nil {
		return Practice{}, fmt.Errorf("delete stale practice answers: %w", err)
	}

	now := unixNow()
	for index, question := range questions {
		contentJSON, err := marshalJSONDefault(question.Content, "{}")
		if err != nil {
			return Practice{}, err
		}
		answerJSON, err := marshalJSONDefault(question.Answer, "{}")
		if err != nil {
			return Practice{}, err
		}
		if _, err := runner.ExecContext(ctx, `
INSERT INTO ah_question (
    id, question_type_code, subject, grade, content, answer, difficulty, create_time, update_time
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    question_type_code = VALUES(question_type_code),
    subject = VALUES(subject),
    grade = VALUES(grade),
    content = VALUES(content),
    answer = VALUES(answer),
    difficulty = VALUES(difficulty),
    update_time = VALUES(update_time)`,
			question.ID,
			question.QuestionTypeCode,
			question.Subject,
			question.Grade,
			contentJSON,
			answerJSON,
			nullableString(question.Difficulty),
			now,
			now,
		); err != nil {
			return Practice{}, fmt.Errorf("upsert generated question %q: %w", question.ID, err)
		}

		if _, err := runner.ExecContext(ctx, `
INSERT INTO ah_practice_answer (
    session_id, question_id, student_id, question_order, answer, audio_url, status,
    time_spent, submit_time, correct_answer, analysis, is_corrected, corrected_time,
    create_time, update_time
) VALUES (?, ?, ?, ?, NULL, NULL, ?, 0, NULL, NULL, NULL, 0, NULL, ?, ?)`,
			session.ID,
			question.ID,
			session.StudentID,
			index+1,
			AnswerStatusUnanswered,
			now,
			now,
		); err != nil {
			return Practice{}, fmt.Errorf("create practice answer for question %q: %w", question.ID, err)
		}
	}

	result, err := runner.ExecContext(ctx, `
UPDATE ah_practice
SET question_count = ?,
    generate_status = ?,
    generate_time = ?,
    update_time = ?
WHERE id = ?`,
		len(questions),
		GenerateStatusCompleted,
		nullableIntPointer(generateTime),
		now,
		sessionID,
	)
	if err != nil {
		return Practice{}, fmt.Errorf("mark practice generation completed: %w", err)
	}
	if err := requireRowsAffected(result); err != nil {
		return Practice{}, err
	}
	if tx != nil {
		if err := tx.Commit(); err != nil {
			return Practice{}, fmt.Errorf("commit generated practice: %w", err)
		}
	}

	session.QuestionCount = len(questions)
	session.GenerateStatus = GenerateStatusCompleted
	session.GenerateTime = generateTime
	session.UpdateTime = now
	return *session, nil
}

func (repo *SQLRepository) GetPracticeData(ctx context.Context, studentID string, sessionID string) (PracticeData, error) {
	session, err := repo.GetPractice(ctx, studentID, sessionID)
	if err != nil {
		return PracticeData{}, err
	}
	answers, questions, err := repo.listAnswersWithQuestions(ctx, studentID, sessionID)
	if err != nil {
		return PracticeData{}, err
	}
	report, err := repo.getReport(ctx, studentID, sessionID)
	if errors.Is(err, ErrNotFound) {
		report = nil
	} else if err != nil {
		return PracticeData{}, err
	}
	return PracticeData{
		Session:   *session,
		Questions: questions,
		Answers:   answers,
		Report:    report,
	}, nil
}

func (repo *SQLRepository) GetPracticeDataByID(ctx context.Context, sessionID string) (PracticeData, error) {
	session, err := repo.GetPracticeByID(ctx, sessionID)
	if err != nil {
		return PracticeData{}, err
	}
	return repo.GetPracticeData(ctx, session.StudentID, sessionID)
}

func (repo *SQLRepository) GetAnswer(ctx context.Context, studentID string, sessionID string, questionID string) (*PracticeAnswer, error) {
	if err := repo.ensureDB(); err != nil {
		return nil, err
	}
	answer, err := scanAnswerWithQuestion(repo.db.QueryRowContext(ctx, selectAnswerWithQuestionColumns+`
FROM ah_practice_answer pa
LEFT JOIN ah_question q ON q.id = pa.question_id
WHERE pa.session_id = ?
  AND pa.question_id = ?
  AND pa.student_id = ?
LIMIT 1`, sessionID, questionID, studentID))
	if err != nil {
		return nil, wrapPracticeLookupError("get practice answer", err)
	}
	return answer, nil
}

func (repo *SQLRepository) UpdateAnswer(ctx context.Context, answer PracticeAnswer) error {
	if err := repo.ensureDB(); err != nil {
		return err
	}
	answerJSON, err := marshalNullableJSON(answer.Answer)
	if err != nil {
		return err
	}
	correctAnswerJSON, err := marshalNullableJSON(answer.CorrectAnswer)
	if err != nil {
		return err
	}
	analysisJSON, err := marshalNullableJSON(answer.Analysis)
	if err != nil {
		return err
	}
	result, err := repo.db.ExecContext(ctx, `
UPDATE ah_practice_answer
SET answer = ?,
    audio_url = ?,
    status = ?,
    time_spent = ?,
    submit_time = ?,
    correct_answer = ?,
    analysis = ?,
    is_corrected = ?,
    corrected_time = ?,
    update_time = ?
WHERE session_id = ?
  AND question_id = ?
  AND student_id = ?`,
		answerJSON,
		nullableString(answer.AudioURL),
		answer.Status,
		answer.TimeSpent,
		nullableInt64Pointer(answer.SubmitTime),
		correctAnswerJSON,
		analysisJSON,
		answer.IsCorrected,
		nullableInt64Pointer(answer.CorrectedTime),
		answer.UpdateTime,
		answer.SessionID,
		answer.QuestionID,
		answer.StudentID,
	)
	if err != nil {
		return fmt.Errorf("update practice answer: %w", err)
	}
	return requireRowsAffected(result)
}

func (repo *SQLRepository) DeletePractice(ctx context.Context, sessionID string) error {
	if err := repo.ensureDB(); err != nil {
		return err
	}
	if _, err := repo.GetPracticeByID(ctx, sessionID); err != nil {
		return err
	}
	if _, err := repo.db.ExecContext(ctx, `DELETE FROM ah_practice_answer WHERE session_id = ?`, sessionID); err != nil {
		return fmt.Errorf("delete practice answers: %w", err)
	}
	if _, err := repo.db.ExecContext(ctx, `DELETE FROM ah_practice_report WHERE session_id = ?`, sessionID); err != nil {
		return fmt.Errorf("delete practice report: %w", err)
	}
	result, err := repo.db.ExecContext(ctx, `DELETE FROM ah_practice WHERE id = ?`, sessionID)
	if err != nil {
		return fmt.Errorf("delete practice: %w", err)
	}
	return requireRowsAffected(result)
}

func (repo *SQLRepository) ResetPractice(ctx context.Context, sessionID string) error {
	if err := repo.ensureDB(); err != nil {
		return err
	}
	session, err := repo.GetPracticeByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if _, err := repo.db.ExecContext(ctx, `
UPDATE ah_practice_answer
SET status = ?,
    answer = NULL,
    time_spent = 0,
    submit_time = NULL,
    correct_answer = NULL,
    analysis = NULL,
    is_corrected = 0,
    corrected_time = NULL,
    update_time = ?
WHERE session_id = ?`, AnswerStatusUnanswered, unixNow(), sessionID); err != nil {
		return fmt.Errorf("reset practice answers: %w", err)
	}
	status := session.Status
	if status == PracticeStatusCompleted {
		status = PracticeStatusInProgress
	}
	result, err := repo.db.ExecContext(ctx, `
UPDATE ah_practice
SET answer_count = 0,
    correct_count = 0,
    status = ?,
    update_time = ?
WHERE id = ?`, status, unixNow(), sessionID)
	if err != nil {
		return fmt.Errorf("reset practice: %w", err)
	}
	return requireRowsAffected(result)
}

func (repo *SQLRepository) ResetPracticeAnswer(ctx context.Context, sessionID string, questionID string) error {
	if err := repo.ensureDB(); err != nil {
		return err
	}
	session, err := repo.GetPracticeByID(ctx, sessionID)
	if err != nil {
		return err
	}
	answer, err := repo.GetAnswer(ctx, session.StudentID, sessionID, questionID)
	if err != nil {
		return err
	}
	wasAnswered := answer.Status != AnswerStatusUnanswered
	wasCorrect := answer.Status == AnswerStatusCorrect
	result, err := repo.db.ExecContext(ctx, `
UPDATE ah_practice_answer
SET status = ?,
    answer = NULL,
    time_spent = 0,
    submit_time = NULL,
    correct_answer = NULL,
    analysis = NULL,
    is_corrected = 0,
    corrected_time = NULL,
    update_time = ?
WHERE session_id = ?
  AND question_id = ?`, AnswerStatusUnanswered, unixNow(), sessionID, questionID)
	if err != nil {
		return fmt.Errorf("reset practice answer: %w", err)
	}
	if err := requireRowsAffected(result); err != nil {
		return err
	}
	if !wasAnswered {
		return nil
	}
	answerCount := session.AnswerCount - 1
	if answerCount < 0 {
		answerCount = 0
	}
	correctCount := session.CorrectCount
	if wasCorrect {
		correctCount--
		if correctCount < 0 {
			correctCount = 0
		}
	}
	result, err = repo.db.ExecContext(ctx, `
UPDATE ah_practice
SET answer_count = ?,
    correct_count = ?,
    update_time = ?
WHERE id = ?`, answerCount, correctCount, unixNow(), sessionID)
	if err != nil {
		return fmt.Errorf("update practice counters after answer reset: %w", err)
	}
	return requireRowsAffected(result)
}

func (repo *SQLRepository) CreateReport(ctx context.Context, report PracticeReport) (PracticeReport, error) {
	if err := repo.ensureDB(); err != nil {
		return PracticeReport{}, err
	}
	if existing, err := repo.getReport(ctx, report.StudentID, report.SessionID); err == nil && existing != nil {
		return *existing, nil
	} else if err != nil && !errors.Is(err, ErrNotFound) {
		return PracticeReport{}, err
	}

	knowledgeScores, err := marshalJSONDefault(report.KnowledgeScores, "{}")
	if err != nil {
		return PracticeReport{}, err
	}
	questionDistribution, err := marshalJSONDefault(report.QuestionDistribution, "{}")
	if err != nil {
		return PracticeReport{}, err
	}
	abilityBreakdown, err := marshalJSONDefault(report.AbilityBreakdown, "{}")
	if err != nil {
		return PracticeReport{}, err
	}
	strengths, err := marshalJSONDefault(report.Strengths, "[]")
	if err != nil {
		return PracticeReport{}, err
	}
	weaknesses, err := marshalJSONDefault(report.Weaknesses, "[]")
	if err != nil {
		return PracticeReport{}, err
	}
	recommendations, err := marshalJSONDefault(report.Recommendations, "[]")
	if err != nil {
		return PracticeReport{}, err
	}

	result, err := repo.db.ExecContext(ctx, `
INSERT INTO ah_practice_report (
    session_id, student_id, total_questions, correct_questions, total_time,
    overall_score, current_ability, confidence, ability_level, percentile,
    knowledge_scores, question_distribution, ability_breakdown, learning_speed,
    consistency, strengths, weaknesses, recommendations, create_time
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		report.SessionID,
		report.StudentID,
		report.TotalQuestions,
		report.CorrectQuestions,
		report.TotalTime,
		report.OverallScore,
		report.CurrentAbility,
		report.Confidence,
		report.AbilityLevel,
		report.Percentile,
		knowledgeScores,
		questionDistribution,
		abilityBreakdown,
		report.LearningSpeed,
		report.Consistency,
		strengths,
		weaknesses,
		recommendations,
		report.CreateTime,
	)
	if err != nil {
		return PracticeReport{}, fmt.Errorf("create practice report: %w", err)
	}
	if report.ID == 0 {
		if id, err := result.LastInsertId(); err == nil {
			report.ID = id
		}
	}
	return report, nil
}

func (repo *SQLRepository) ensureDB() error {
	if repo == nil || repo.db == nil {
		return ErrNotConfigured
	}
	return nil
}

func (repo *SQLRepository) listAnswersWithQuestions(ctx context.Context, studentID string, sessionID string) ([]PracticeAnswer, []PracticeQuestion, error) {
	rows, err := repo.db.QueryContext(ctx, selectAnswerWithQuestionColumns+`
FROM ah_practice_answer pa
LEFT JOIN ah_question q ON q.id = pa.question_id
WHERE pa.session_id = ?
  AND pa.student_id = ?
ORDER BY pa.question_order`, sessionID, studentID)
	if err != nil {
		return nil, nil, fmt.Errorf("list practice answers: %w", err)
	}
	defer rows.Close()

	answers := make([]PracticeAnswer, 0)
	questions := make([]PracticeQuestion, 0)
	for rows.Next() {
		answer, err := scanAnswerWithQuestionRows(rows)
		if err != nil {
			return nil, nil, err
		}
		if answer.Question != nil {
			questions = append(questions, *answer.Question)
		}
		answers = append(answers, *answer)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, fmt.Errorf("iterate practice answers: %w", err)
	}
	return answers, questions, nil
}

func (repo *SQLRepository) getReport(ctx context.Context, studentID string, sessionID string) (*PracticeReport, error) {
	report, err := scanReport(repo.db.QueryRowContext(ctx, selectReportColumns+`
FROM ah_practice_report
WHERE session_id = ?
  AND student_id = ?
LIMIT 1`, sessionID, studentID))
	if err != nil {
		return nil, wrapPracticeLookupError("get practice report", err)
	}
	return report, nil
}

const selectPracticeColumns = `
SELECT id, student_id, practice_type, subject, grade, ability_code, unit_id,
       question_count, answer_count, correct_count, status, generate_status,
       generate_time, start_time, end_time, create_time, update_time
`

const selectAnswerWithQuestionColumns = `
SELECT pa.id, pa.session_id, pa.question_id, pa.student_id, pa.question_order,
       pa.answer, pa.audio_url, pa.status, pa.time_spent, pa.submit_time,
       pa.correct_answer, pa.analysis, pa.is_corrected, pa.corrected_time,
       pa.create_time, pa.update_time,
       q.id, q.question_type_code, q.subject, q.grade, q.content, q.answer,
       q.difficulty, q.create_time, q.update_time
`

const selectReportColumns = `
SELECT id, session_id, student_id, total_questions, correct_questions, total_time,
       overall_score, current_ability, confidence, ability_level, percentile,
       knowledge_scores, question_distribution, ability_breakdown, learning_speed,
       consistency, strengths, weaknesses, recommendations, create_time
`

type practiceScanner interface {
	Scan(dest ...any) error
}

func scanPractice(scanner practiceScanner) (*Practice, error) {
	var practice Practice
	var subject sql.NullString
	var grade sql.NullInt64
	var abilityCode sql.NullString
	var unitID sql.NullInt64
	var generateTime sql.NullInt64
	var endTime sql.NullInt64
	err := scanner.Scan(
		&practice.ID,
		&practice.StudentID,
		&practice.PracticeType,
		&subject,
		&grade,
		&abilityCode,
		&unitID,
		&practice.QuestionCount,
		&practice.AnswerCount,
		&practice.CorrectCount,
		&practice.Status,
		&practice.GenerateStatus,
		&generateTime,
		&practice.StartTime,
		&endTime,
		&practice.CreateTime,
		&practice.UpdateTime,
	)
	if err != nil {
		return nil, err
	}
	practice.Subject = subject.String
	if grade.Valid {
		practice.Grade = int(grade.Int64)
	}
	practice.AbilityCode = abilityCode.String
	if unitID.Valid {
		practice.UnitID = unitID.Int64
	}
	if generateTime.Valid {
		value := int(generateTime.Int64)
		practice.GenerateTime = &value
	}
	if endTime.Valid {
		practice.EndTime = &endTime.Int64
	}
	return &practice, nil
}

func scanPracticeRows(rows *sql.Rows) (*Practice, error) {
	practice, err := scanPractice(rows)
	if err != nil {
		return nil, fmt.Errorf("scan practice: %w", err)
	}
	return practice, nil
}

func scanAnswerWithQuestion(scanner practiceScanner) (*PracticeAnswer, error) {
	answer, err := scanAnswerWithQuestionBase(scanner)
	if err != nil {
		return nil, err
	}
	return answer, nil
}

func scanAnswerWithQuestionRows(rows *sql.Rows) (*PracticeAnswer, error) {
	answer, err := scanAnswerWithQuestionBase(rows)
	if err != nil {
		return nil, fmt.Errorf("scan practice answer: %w", err)
	}
	return answer, nil
}

func scanAnswerWithQuestionBase(scanner practiceScanner) (*PracticeAnswer, error) {
	var answer PracticeAnswer
	var answerRaw []byte
	var audioURL sql.NullString
	var submitTime sql.NullInt64
	var correctAnswerRaw []byte
	var analysisRaw []byte
	var correctedTime sql.NullInt64
	var qID sql.NullString
	var qType sql.NullString
	var qSubject sql.NullString
	var qGrade sql.NullInt64
	var qContentRaw []byte
	var qAnswerRaw []byte
	var qDifficulty sql.NullString
	var qCreateTime sql.NullInt64
	var qUpdateTime sql.NullInt64

	err := scanner.Scan(
		&answer.ID,
		&answer.SessionID,
		&answer.QuestionID,
		&answer.StudentID,
		&answer.QuestionOrder,
		&answerRaw,
		&audioURL,
		&answer.Status,
		&answer.TimeSpent,
		&submitTime,
		&correctAnswerRaw,
		&analysisRaw,
		&answer.IsCorrected,
		&correctedTime,
		&answer.CreateTime,
		&answer.UpdateTime,
		&qID,
		&qType,
		&qSubject,
		&qGrade,
		&qContentRaw,
		&qAnswerRaw,
		&qDifficulty,
		&qCreateTime,
		&qUpdateTime,
	)
	if err != nil {
		return nil, err
	}
	answer.AudioURL = audioURL.String
	if submitTime.Valid {
		answer.SubmitTime = &submitTime.Int64
	}
	if correctedTime.Valid {
		answer.CorrectedTime = &correctedTime.Int64
	}
	if len(answerRaw) > 0 {
		if err := json.Unmarshal(answerRaw, &answer.Answer); err != nil {
			return nil, fmt.Errorf("decode answer json: %w", err)
		}
	}
	if len(correctAnswerRaw) > 0 {
		var correctAnswer ai.CorrectAnswer
		if err := json.Unmarshal(correctAnswerRaw, &correctAnswer); err != nil {
			return nil, fmt.Errorf("decode correct_answer json: %w", err)
		}
		answer.CorrectAnswer = &correctAnswer
	}
	if len(analysisRaw) > 0 {
		var analysis ai.AnswerAnalysis
		if err := json.Unmarshal(analysisRaw, &analysis); err != nil {
			return nil, fmt.Errorf("decode analysis json: %w", err)
		}
		answer.Analysis = &analysis
	}
	if qID.Valid {
		question := PracticeQuestion{
			ID:               qID.String,
			QuestionTypeCode: qType.String,
			Subject:          qSubject.String,
			Difficulty:       qDifficulty.String,
		}
		if qGrade.Valid {
			question.Grade = int(qGrade.Int64)
		}
		if qCreateTime.Valid {
			question.CreateTime = qCreateTime.Int64
		}
		if qUpdateTime.Valid {
			question.UpdateTime = qUpdateTime.Int64
		}
		if len(qContentRaw) > 0 {
			if err := json.Unmarshal(qContentRaw, &question.Content); err != nil {
				return nil, fmt.Errorf("decode question content json: %w", err)
			}
		}
		if len(qAnswerRaw) > 0 {
			if err := json.Unmarshal(qAnswerRaw, &question.Answer); err != nil {
				return nil, fmt.Errorf("decode question answer json: %w", err)
			}
		}
		answer.Question = &question
	}
	return &answer, nil
}

func scanReport(scanner practiceScanner) (*PracticeReport, error) {
	var report PracticeReport
	var knowledgeScoresRaw []byte
	var questionDistributionRaw []byte
	var abilityBreakdownRaw []byte
	var strengthsRaw []byte
	var weaknessesRaw []byte
	var recommendationsRaw []byte
	err := scanner.Scan(
		&report.ID,
		&report.SessionID,
		&report.StudentID,
		&report.TotalQuestions,
		&report.CorrectQuestions,
		&report.TotalTime,
		&report.OverallScore,
		&report.CurrentAbility,
		&report.Confidence,
		&report.AbilityLevel,
		&report.Percentile,
		&knowledgeScoresRaw,
		&questionDistributionRaw,
		&abilityBreakdownRaw,
		&report.LearningSpeed,
		&report.Consistency,
		&strengthsRaw,
		&weaknessesRaw,
		&recommendationsRaw,
		&report.CreateTime,
	)
	if err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(knowledgeScoresRaw, &report.KnowledgeScores, JSONMap{}); err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(questionDistributionRaw, &report.QuestionDistribution, JSONMap{}); err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(abilityBreakdownRaw, &report.AbilityBreakdown, JSONMap{}); err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(strengthsRaw, &report.Strengths, []string{}); err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(weaknessesRaw, &report.Weaknesses, []string{}); err != nil {
		return nil, err
	}
	if err := unmarshalJSONDefault(recommendationsRaw, &report.Recommendations, []string{}); err != nil {
		return nil, err
	}
	return &report, nil
}

func buildPracticeListWhere(params PracticeListParams) (string, []any) {
	clauses := make([]string, 0, 5)
	args := make([]any, 0, 5)
	if params.StudentID != "" {
		clauses = append(clauses, "student_id = ?")
		args = append(args, params.StudentID)
	}
	if params.PracticeType != "" {
		clauses = append(clauses, "practice_type = ?")
		args = append(args, params.PracticeType)
	}
	if params.Status != nil {
		clauses = append(clauses, "status = ?")
		args = append(args, *params.Status)
	}
	if params.Subject != "" {
		clauses = append(clauses, "subject = ?")
		args = append(args, params.Subject)
	}
	if params.Grade != 0 {
		clauses = append(clauses, "grade = ?")
		args = append(args, params.Grade)
	}
	if len(clauses) == 0 {
		return "", args
	}
	return "WHERE " + strings.Join(clauses, " AND "), args
}

func wrapPracticeLookupError(operation string, err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	return fmt.Errorf("%s: %w", operation, err)
}

func requireRowsAffected(result sql.Result) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return nil
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func nullableInt(value int) any {
	if value == 0 {
		return nil
	}
	return value
}

func nullableInt64(value int64) any {
	if value == 0 {
		return nil
	}
	return value
}

func nullableIntPointer(value *int) any {
	if value == nil {
		return nil
	}
	return *value
}

func nullableInt64Pointer(value *int64) any {
	if value == nil {
		return nil
	}
	return *value
}

func marshalNullableJSON(value any) (any, error) {
	if value == nil {
		return nil, nil
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return nil, fmt.Errorf("marshal json: %w", err)
	}
	return string(raw), nil
}

func marshalJSONDefault(value any, fallback string) (string, error) {
	if value == nil {
		return fallback, nil
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return "", fmt.Errorf("marshal json: %w", err)
	}
	return string(raw), nil
}

func unmarshalJSONDefault[T any](raw []byte, target *T, fallback T) error {
	if len(raw) == 0 {
		*target = fallback
		return nil
	}
	if err := json.Unmarshal(raw, target); err != nil {
		return fmt.Errorf("decode report json: %w", err)
	}
	return nil
}
