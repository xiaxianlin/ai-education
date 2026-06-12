package practice

import (
	"time"

	"ai-education/server-go/internal/ai"
)

const (
	PracticeTypeAbility = "ability_practice"
	PracticeTypeUnit    = "unit_practice"

	GenerateStatusGenerating = 0
	GenerateStatusCompleted  = 1
	GenerateStatusFailed     = -1

	PracticeStatusNotStarted = 0
	PracticeStatusInProgress = 1
	PracticeStatusCompleted  = 2
	PracticeStatusAbandoned  = 3

	AnswerStatusUnanswered = 0
	AnswerStatusCorrect    = 1
	AnswerStatusIncorrect  = 2
)

type JSONMap map[string]any

type Practice struct {
	ID             string `json:"id"`
	StudentID      string `json:"student_id"`
	PracticeType   string `json:"practice_type"`
	Subject        string `json:"subject,omitempty"`
	Grade          int    `json:"grade,omitempty"`
	AbilityCode    string `json:"ability_code,omitempty"`
	AbilityName    string `json:"ability_name,omitempty"`
	UnitID         int64  `json:"unit_id,omitempty"`
	UnitName       string `json:"unit_name,omitempty"`
	QuestionCount  int    `json:"question_count"`
	AnswerCount    int    `json:"answer_count"`
	CorrectCount   int    `json:"correct_count"`
	Status         int    `json:"status"`
	GenerateStatus int    `json:"generate_status"`
	GenerateTime   *int   `json:"generate_time,omitempty"`
	StartTime      int64  `json:"start_time"`
	EndTime        *int64 `json:"end_time,omitempty"`
	CreateTime     int64  `json:"create_time"`
	UpdateTime     int64  `json:"update_time,omitempty"`
}

type PracticeQuestion struct {
	ID               string             `json:"id"`
	QuestionTypeCode string             `json:"question_type_code"`
	Subject          string             `json:"subject"`
	Grade            int                `json:"grade"`
	Content          ai.QuestionContent `json:"content"`
	Answer           ai.QuestionAnswer  `json:"answer"`
	Difficulty       string             `json:"difficulty,omitempty"`
	CreateTime       int64              `json:"create_time,omitempty"`
	UpdateTime       int64              `json:"update_time,omitempty"`
}

type PracticeAnswer struct {
	ID            int64              `json:"id"`
	SessionID     string             `json:"session_id"`
	QuestionID    string             `json:"question_id"`
	StudentID     string             `json:"student_id"`
	QuestionOrder int                `json:"question_order"`
	Answer        any                `json:"answer,omitempty"`
	AudioURL      string             `json:"audio_url,omitempty"`
	Status        int                `json:"status"`
	TimeSpent     int                `json:"time_spent"`
	SubmitTime    *int64             `json:"submit_time,omitempty"`
	CorrectAnswer *ai.CorrectAnswer  `json:"correct_answer,omitempty"`
	Analysis      *ai.AnswerAnalysis `json:"analysis,omitempty"`
	IsCorrected   int                `json:"is_corrected"`
	CorrectedTime *int64             `json:"corrected_time,omitempty"`
	CreateTime    int64              `json:"create_time"`
	UpdateTime    int64              `json:"update_time,omitempty"`
	Question      *PracticeQuestion  `json:"question,omitempty"`
}

type PracticeReport struct {
	ID                   int64    `json:"id"`
	SessionID            string   `json:"session_id"`
	StudentID            string   `json:"student_id"`
	TotalQuestions       int      `json:"total_questions"`
	CorrectQuestions     int      `json:"correct_questions"`
	TotalTime            int      `json:"total_time"`
	OverallScore         float64  `json:"overall_score"`
	CurrentAbility       float64  `json:"current_ability"`
	Confidence           float64  `json:"confidence"`
	AbilityLevel         string   `json:"ability_level"`
	Percentile           int      `json:"percentile"`
	KnowledgeScores      JSONMap  `json:"knowledge_scores"`
	QuestionDistribution JSONMap  `json:"question_distribution"`
	AbilityBreakdown     JSONMap  `json:"ability_breakdown"`
	LearningSpeed        float64  `json:"learning_speed"`
	Consistency          float64  `json:"consistency"`
	Strengths            []string `json:"strengths"`
	Weaknesses           []string `json:"weaknesses"`
	Recommendations      []string `json:"recommendations"`
	CreateTime           int64    `json:"create_time"`
}

type PracticeData struct {
	Session   Practice           `json:"session"`
	Questions []PracticeQuestion `json:"questions"`
	Answers   []PracticeAnswer   `json:"answers"`
	Report    *PracticeReport    `json:"report,omitempty"`
}

type CreatePracticeRequest struct {
	Type          string `json:"type"`
	AbilityCode   string `json:"ability_code,omitempty"`
	Subject       string `json:"subject,omitempty"`
	Grade         int    `json:"grade,omitempty"`
	UnitID        int64  `json:"unit_id,omitempty"`
	GenerateCount int    `json:"generate_count,omitempty"`
}

type CreatePracticeResponse struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
}

type PersistGeneratedPracticeRequest struct {
	SessionID    string                 `json:"session_id"`
	Questions    []ai.GeneratedQuestion `json:"questions"`
	GenerateTime *int                   `json:"generate_time,omitempty"`
}

type PersistGeneratedPracticeResult struct {
	Session       Practice `json:"session"`
	QuestionCount int      `json:"question_count"`
}

type SubmitAnswerRequest struct {
	SessionID  string `json:"session_id"`
	QuestionID string `json:"question_id"`
	Answer     any    `json:"answer"`
	TimeSpent  int    `json:"time_spent"`
	AudioURL   string `json:"audio_url,omitempty"`
}

type PracticeListParams struct {
	StudentID    string
	PracticeType string
	Subject      string
	Grade        int
	Status       *int
	Page         int
	PageSize     int
}

type PracticeListResult struct {
	Data     []Practice `json:"data"`
	Total    int        `json:"total"`
	Page     int        `json:"page"`
	PageSize int        `json:"pageSize"`
}

type ProgressResponse struct {
	Progress int    `json:"progress"`
	Step     string `json:"step"`
	Message  string `json:"message"`
}

type ResolvedState struct {
	Step     string
	Message  string
	Progress int
}

func ResolveState(practice Practice) ResolvedState {
	switch practice.GenerateStatus {
	case GenerateStatusGenerating:
		return ResolvedState{Step: "generating", Message: "练习正在生成中", Progress: 0}
	case GenerateStatusFailed:
		return ResolvedState{Step: "failed", Message: "练习生成失败", Progress: 0}
	}

	switch practice.Status {
	case PracticeStatusNotStarted:
		return ResolvedState{Step: "not_started", Message: "练习待开始", Progress: 100}
	case PracticeStatusInProgress:
		return ResolvedState{Step: "in_progress", Message: "练习进行中", Progress: 100}
	case PracticeStatusCompleted:
		return ResolvedState{Step: "completed", Message: "练习已完成", Progress: 100}
	case PracticeStatusAbandoned:
		return ResolvedState{Step: "abandoned", Message: "练习已废弃", Progress: 100}
	default:
		return ResolvedState{Step: "unknown", Message: "练习状态异常", Progress: 0}
	}
}

func unixNow() int64 {
	return time.Now().Unix()
}
