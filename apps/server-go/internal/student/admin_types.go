package student

type AdminStudent struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Phone      string  `json:"phone"`
	Grade      int     `json:"grade"`
	Semester   *string `json:"semester,omitempty"`
	Subject    *string `json:"subject,omitempty"`
	Status     int     `json:"status"`
	CreateTime int64   `json:"create_time"`
	UpdateTime int64   `json:"update_time,omitempty"`
}

type SearchStudentsRequest struct {
	Page     int
	Size     int
	Name     string
	Phone    string
	Keywords string
	Status   *int
}

type SearchStudentsResult struct {
	Total int            `json:"total"`
	Data  []AdminStudent `json:"data"`
}

type SaveStudentRequest struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Grade  int    `json:"grade"`
	Status *int   `json:"status,omitempty"`
}

type CreateStudentRecord struct {
	ID           string
	Name         string
	Phone        string
	PasswordHash string
	Grade        int
	Status       int
	CreateTime   int64
	UpdateTime   int64
}

type UpdateStudentRecord struct {
	Name       string
	Phone      string
	Grade      int
	Status     int
	UpdateTime int64
}

type StudentTextbookConfig struct {
	ID         int64     `json:"id"`
	StudentID  string    `json:"student_id"`
	TextbookID int64     `json:"textbook_id"`
	Textbook   *Textbook `json:"textbook,omitempty"`
	CreateTime int64     `json:"create_time"`
	UpdateTime int64     `json:"update_time"`
}

type SaveStudentTextbookConfigRequest struct {
	TextbookID int64 `json:"textbook_id"`
}

type SetStudentTextbookConfigsRequest struct {
	Configs []SaveStudentTextbookConfigRequest `json:"configs"`
}

type ListStudentTextbookConfigsRequest struct {
	Page    int
	Size    int
	Subject string
	Grade   *int
}

type ListStudentTextbookConfigsResult struct {
	Items    []StudentTextbookConfig `json:"items"`
	Total    int                     `json:"total"`
	Page     int                     `json:"page"`
	PageSize int                     `json:"page_size"`
}

type StudentMastery struct {
	ID               int64   `json:"id"`
	StudentID        string  `json:"student_id"`
	AbilityCode      string  `json:"ability_code"`
	MasteryScore     float64 `json:"mastery_score"`
	MasteryLevel     string  `json:"mastery_level"`
	CorrectCount     int     `json:"correct_count"`
	WrongCount       int     `json:"wrong_count"`
	LastPracticeTime *int64  `json:"last_practice_time"`
	CreateTime       int64   `json:"create_time"`
	UpdateTime       int64   `json:"update_time"`
	AbilityName      *string `json:"ability_name"`
	Subject          *string `json:"subject"`
	Grade            *int    `json:"grade"`
}

type StudentMasterySummary struct {
	TotalAbilities    int            `json:"total_abilities"`
	AvgMasteryScore   float64        `json:"avg_mastery_score"`
	LevelDistribution map[string]int `json:"level_distribution"`
}
