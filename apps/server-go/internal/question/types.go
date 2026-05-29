package question

type JSONMap map[string]any

type Resource struct {
	Type string `json:"type"`
	URL  string `json:"url"`
	Alt  string `json:"alt,omitempty"`
}

type Option struct {
	ID        string    `json:"id"`
	Text      string    `json:"text,omitempty"`
	Resource  *Resource `json:"resource,omitempty"`
	IsCorrect *bool     `json:"is_correct,omitempty"`
}

type QuestionContent struct {
	Stem         string            `json:"stem"`
	Resource     *Resource         `json:"resource,omitempty"`
	Options      []Option          `json:"options,omitempty"`
	SubQuestions []QuestionContent `json:"sub_questions,omitempty"`
}

type Rubric struct {
	Dimension   string  `json:"dimension"`
	MaxScore    float64 `json:"max_score"`
	Description string  `json:"description,omitempty"`
}

type QuestionAnswer struct {
	Value        any      `json:"value"`
	CorrectValue any      `json:"correct_value,omitempty"`
	AnalysisMode string   `json:"analysis_mode"`
	Explanation  string   `json:"explanation,omitempty"`
	Rubrics      []Rubric `json:"rubrics,omitempty"`
	Configs      JSONMap  `json:"configs,omitempty"`
}

type Content = QuestionContent
type Answer = QuestionAnswer

type QuestionType struct {
	ID          int64   `json:"id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description string  `json:"description,omitempty"`
	Category    string  `json:"category"`
	Subject     string  `json:"subject,omitempty"`
	AbilityCode string  `json:"ability_code,omitempty"`
	Configs     JSONMap `json:"configs,omitempty"`
	CreateTime  int64   `json:"create_time"`
	UpdateTime  int64   `json:"update_time"`
}

type Question struct {
	ID               string          `json:"id"`
	QuestionTypeCode string          `json:"question_type_code"`
	Subject          string          `json:"subject"`
	Grade            int             `json:"grade"`
	Content          QuestionContent `json:"content"`
	Answer           QuestionAnswer  `json:"answer"`
	Difficulty       string          `json:"difficulty,omitempty"`
	CreateTime       int64           `json:"create_time"`
	UpdateTime       int64           `json:"update_time"`
	QuestionType     *QuestionType   `json:"question_type,omitempty"`
}

type SearchResult[T any] struct {
	Total int `json:"total"`
	Data  []T `json:"data"`
}

type QuestionSearch struct {
	ID               string
	QuestionTypeCode string
	Subject          string
	Grade            int
	Page             int
	Size             int
}

type QuestionUpdate struct {
	Content     *QuestionContent `json:"content,omitempty"`
	Answer      *QuestionAnswer  `json:"answer,omitempty"`
	Explanation *string          `json:"explanation,omitempty"`
}

type QuestionTypeSave struct {
	ID          *int64  `json:"id,omitempty"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Description *string `json:"description,omitempty"`
	Subject     *string `json:"subject,omitempty"`
	AbilityCode *string `json:"ability_code,omitempty"`
}

type AbilityPracticeSearch struct {
	Subject string
	Grade   int
}

type QuestionTypeConfigsUpdate struct {
	Configs JSONMap `json:"configs"`
}

type QuestionTypePromptUpdate struct {
	Prompt string `json:"prompt"`
}
