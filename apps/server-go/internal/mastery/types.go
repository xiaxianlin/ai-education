package mastery

type MasteryLevel string

const (
	MasteryLevelUnlearned  MasteryLevel = "unlearned"
	MasteryLevelBeginner   MasteryLevel = "beginner"
	MasteryLevelProficient MasteryLevel = "proficient"
	MasteryLevelMastered   MasteryLevel = "mastered"
)

type Mastery struct {
	ID               int64        `json:"id"`
	StudentID        string       `json:"student_id"`
	AbilityCode      string       `json:"ability_code"`
	MasteryScore     float64      `json:"mastery_score"`
	MasteryLevel     MasteryLevel `json:"mastery_level"`
	CorrectCount     int          `json:"correct_count"`
	WrongCount       int          `json:"wrong_count"`
	LastPracticeTime *int64       `json:"last_practice_time"`
	CreateTime       int64        `json:"create_time"`
	UpdateTime       int64        `json:"update_time"`
}

type MasteryWithInfo struct {
	Mastery
	AbilityName *string `json:"ability_name"`
	Subject     *string `json:"subject"`
	Grade       *int    `json:"grade"`
}

type Summary struct {
	TotalAbilities     int            `json:"total_abilities"`
	PracticedAbilities int            `json:"practiced_abilities"`
	AvgMasteryScore    float64        `json:"avg_mastery_score"`
	LevelDistribution  map[string]int `json:"level_distribution"`
}

type MasteryFilter struct {
	Subject *string
	Grade   *int
}

type Statistics struct {
	TotalPractices            int     `json:"total_practices"`
	TotalQuestions            int     `json:"total_questions"`
	CompletedUnitPractices    int     `json:"completed_unit_practices"`
	CompletedAbilityPractices int     `json:"completed_ability_practices"`
	TotalAccuracy             float64 `json:"total_accuracy"`
	AverageAccuracy           float64 `json:"average_accuracy"`
}

type StatisticsSummary struct {
	AllTime      Statistics `json:"all_time"`
	Recent30Days Statistics `json:"recent_30_days"`
}

// AnswerMasteryInput 练习完成后用于更新掌握度的答案输入
type AnswerMasteryInput struct {
	AbilityCode string
	IsCorrect   bool
}

// CalculateMasteryLevel 根据掌握度分数计算掌握等级
func CalculateMasteryLevel(score float64) MasteryLevel {
	switch {
	case score >= 80:
		return MasteryLevelMastered
	case score >= 60:
		return MasteryLevelProficient
	case score >= 40:
		return MasteryLevelBeginner
	default:
		return MasteryLevelUnlearned
	}
}
