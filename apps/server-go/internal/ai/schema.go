package ai

import "time"

type QuestionGenerator interface {
	GenerateQuestions(ctx Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error)
}

type AnswerEvaluator interface {
	EvaluateAnswer(ctx Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error)
}

type ReportGenerator interface {
	GenerateReport(ctx Context, req GenerateReportRequest) (PracticeReportDraft, error)
}

type Context interface {
	Done() <-chan struct{}
	Err() error
}

type GenerateQuestionRequest struct {
	QuestionTypeCode string         `json:"question_type_code"`
	Subject          string         `json:"subject"`
	Grade            int            `json:"grade"`
	Count            int            `json:"count"`
	AbilityCode      string         `json:"ability_code,omitempty"`
	UnitID           int64          `json:"unit_id,omitempty"`
	UnitContent      string         `json:"unit_content,omitempty"`
	Prompt           string         `json:"prompt,omitempty"`
	Params           map[string]any `json:"params,omitempty"`
}

type GeneratedQuestion struct {
	ID               string          `json:"id"`
	QuestionTypeCode string          `json:"question_type_code"`
	Subject          string          `json:"subject"`
	Grade            int             `json:"grade"`
	Content          QuestionContent `json:"content"`
	Answer           QuestionAnswer  `json:"answer"`
	Difficulty       string          `json:"difficulty,omitempty"`
}

type QuestionContent struct {
	Stem         string            `json:"stem"`
	Resource     *Resource         `json:"resource,omitempty"`
	Options      []Option          `json:"options,omitempty"`
	SubQuestions []QuestionContent `json:"sub_questions,omitempty"`
}

type Resource struct {
	Type        string `json:"type"`
	URL         string `json:"url,omitempty"`
	Alt         string `json:"alt,omitempty"`
	ImagePrompt string `json:"image_prompt,omitempty"`
	TTSText     string `json:"tts_text,omitempty"`
}

type Option struct {
	ID        string    `json:"id"`
	Text      string    `json:"text,omitempty"`
	Resource  *Resource `json:"resource,omitempty"`
	IsCorrect *bool     `json:"is_correct,omitempty"`
}

type QuestionAnswer struct {
	Value        any            `json:"value"`
	CorrectValue any            `json:"correct_value,omitempty"`
	AnalysisMode string         `json:"analysis_mode"`
	Explanation  string         `json:"explanation,omitempty"`
	Rubrics      []Rubric       `json:"rubrics,omitempty"`
	Configs      map[string]any `json:"configs,omitempty"`
}

type Rubric struct {
	Dimension   string  `json:"dimension"`
	MaxScore    float64 `json:"max_score"`
	Description string  `json:"description,omitempty"`
}

type EvaluateAnswerRequest struct {
	SessionID        string          `json:"session_id"`
	QuestionID       string          `json:"question_id"`
	QuestionTypeCode string          `json:"question_type_code"`
	Content          QuestionContent `json:"content"`
	ExpectedAnswer   QuestionAnswer  `json:"expected_answer"`
	StudentAnswer    any             `json:"student_answer"`
	AudioURL         string          `json:"audio_url,omitempty"`
	SubmittedAt      time.Time       `json:"submitted_at,omitempty"`
}

type EvaluateAnswerResult struct {
	IsCorrect     bool           `json:"is_correct"`
	Score         float64        `json:"score"`
	FullScore     float64        `json:"full_score"`
	CorrectAnswer CorrectAnswer  `json:"correct_answer"`
	Analysis      AnswerAnalysis `json:"analysis"`
	Metadata      map[string]any `json:"metadata,omitempty"`
}

type CorrectAnswer struct {
	Type       string      `json:"type"`
	Value      any         `json:"value,omitempty"`
	Values     []any       `json:"values,omitempty"`
	Options    []Option    `json:"options,omitempty"`
	SubAnswers []SubAnswer `json:"sub_answers,omitempty"`
}

type SubAnswer struct {
	SubID     string `json:"sub_id"`
	IsCorrect bool   `json:"is_correct"`
	Value     any    `json:"value,omitempty"`
}

type AnswerAnalysis struct {
	CorrectAnswer any    `json:"correct_answer,omitempty"`
	Explanation   string `json:"explanation,omitempty"`
	Analysis      string `json:"analysis,omitempty"`
}

type GenerateReportRequest struct {
	SessionID     string                 `json:"session_id"`
	StudentID     string                 `json:"student_id"`
	Subject       string                 `json:"subject"`
	Grade         int                    `json:"grade"`
	PracticeType  string                 `json:"practice_type"`
	Answers       []EvaluateAnswerResult `json:"answers"`
	Mastery       map[string]any         `json:"mastery,omitempty"`
	TotalTimeSecs int                    `json:"total_time_secs"`
}

type PracticeReportDraft struct {
	OverallScore         float64        `json:"overall_score"`
	CurrentAbility       float64        `json:"current_ability"`
	Confidence           float64        `json:"confidence"`
	AbilityLevel         string         `json:"ability_level"`
	Percentile           int            `json:"percentile"`
	KnowledgeScores      map[string]any `json:"knowledge_scores"`
	QuestionDistribution map[string]any `json:"question_distribution"`
	AbilityBreakdown     map[string]any `json:"ability_breakdown"`
	LearningSpeed        float64        `json:"learning_speed"`
	Consistency          float64        `json:"consistency"`
	Strengths            []string       `json:"strengths"`
	Weaknesses           []string       `json:"weaknesses"`
	Recommendations      []string       `json:"recommendations"`
}
