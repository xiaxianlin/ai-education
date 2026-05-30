package teacher

type Teacher struct {
	ID         string `json:"id"`
	Account    string `json:"account"`
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	Subject    string `json:"subject"`
	School     string `json:"school"`
	Status     int    `json:"status"`
	CreateTime int64  `json:"create_time"`
	UpdateTime int64  `json:"update_time,omitempty"`
}

type SaveTeacherRequest struct {
	Account  string `json:"account"`
	Password string `json:"password,omitempty"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Subject  string `json:"subject"`
	School   string `json:"school"`
	Status   *int   `json:"status,omitempty"`
}

type SearchTeachersRequest struct {
	Page     int
	Size     int
	Keywords string
	Subject  string
	Status   *int
}

type SearchTeachersResult struct {
	Total int       `json:"total"`
	Data  []Teacher `json:"data"`
}

type TeacherStats struct {
	StudentCount  int `json:"student_count"`
	TextbookCount int `json:"textbook_count"`
	AbilityCount  int `json:"ability_count"`
	QuestionCount int `json:"question_count"`
}

type TeacherStudent struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Grade    int    `json:"grade"`
	Subject  string `json:"subject,omitempty"`
	Semester string `json:"semester,omitempty"`
	Status   int    `json:"status"`
}

type TeacherTextbook struct {
	ID       int64  `json:"id"`
	Subject  string `json:"subject"`
	Version  string `json:"version"`
	Grade    int    `json:"grade"`
	Semester string `json:"semester"`
}

type TeacherAbility struct {
	ID         int64  `json:"id"`
	Subject    string `json:"subject"`
	Grade      int    `json:"grade"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	Difficulty int    `json:"difficulty"`
}

type TeacherQuestion struct {
	ID               string `json:"id"`
	QuestionTypeCode string `json:"question_type_code"`
	Subject          string `json:"subject"`
	Grade            int    `json:"grade"`
	Difficulty       string `json:"difficulty,omitempty"`
	CreateTime       int64  `json:"create_time"`
}

type TeacherDetail struct {
	Teacher   Teacher           `json:"teacher"`
	Stats     TeacherStats      `json:"stats"`
	Students  []TeacherStudent  `json:"students"`
	Textbooks []TeacherTextbook `json:"textbooks"`
	Abilities []TeacherAbility  `json:"abilities"`
	Questions []TeacherQuestion `json:"questions"`
}

type AssignStudentTeacherRequest struct {
	TeacherID string `json:"teacher_id"`
}

type CreateTeacherClaimRequest struct {
	TeacherID string `json:"teacher_id"`
}

type UpdateTeacherClaimRequest struct {
	Status string `json:"status"`
}

type StudentTeacherClaim struct {
	ID         int64           `json:"id"`
	StudentID  string          `json:"student_id"`
	TeacherID  string          `json:"teacher_id"`
	Status     string          `json:"status"`
	CreateTime int64           `json:"create_time"`
	UpdateTime int64           `json:"update_time"`
	Teacher    *Teacher        `json:"teacher,omitempty"`
	Student    *TeacherStudent `json:"student,omitempty"`
}

type PasswordResponse struct {
	Password string `json:"password"`
}
