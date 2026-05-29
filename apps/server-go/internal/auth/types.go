package auth

type Manager struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"`
	Token        string `json:"-"`
	Type         int    `json:"type"`
	Status       int    `json:"status"`
	CreateTime   int64  `json:"create_time"`
	UpdateTime   int64  `json:"update_time,omitempty"`
}

type Student struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Phone        string  `json:"phone"`
	PasswordHash string  `json:"-"`
	Token        string  `json:"-"`
	Grade        *int    `json:"grade,omitempty"`
	Semester     *string `json:"semester,omitempty"`
	Subject      *string `json:"subject,omitempty"`
	Status       int     `json:"status"`
	CreateTime   int64   `json:"create_time"`
	UpdateTime   int64   `json:"update_time,omitempty"`
}

type ManagerTokenClaims struct {
	ID         string `json:"id"`
	UpdateTime int64  `json:"update_time,omitempty"`
}

type StudentTokenClaims struct {
	ID         string `json:"id"`
	UpdateTime int64  `json:"update_time,omitempty"`
}

type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type StudentLoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type ConfigsResponse struct {
	Subjects  []string `json:"subjects"`
	Semesters []string `json:"semesters"`
	Providers []string `json:"providers"`
}
