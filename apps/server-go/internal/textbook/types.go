package textbook

type Textbook struct {
	ID          int64   `json:"id"`
	TeacherID   *string `json:"teacher_id,omitempty"`
	TeacherName *string `json:"teacher_name,omitempty"`
	Subject     string  `json:"subject"`
	Version     string  `json:"version"`
	Grade       int     `json:"grade"`
	Semester    string  `json:"semester"`
}

type Unit struct {
	ID         int64  `json:"id"`
	TextbookID int64  `json:"textbook_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
}

type SaveTextbookRequest struct {
	TeacherID *string `json:"teacher_id,omitempty"`
	Subject   string  `json:"subject"`
	Version   string  `json:"version"`
	Grade     int     `json:"grade"`
	Semester  string  `json:"semester"`
}

type SearchTextbookRequest struct {
	TeacherID *string `json:"teacher_id,omitempty"`
	Subject   string  `json:"subject,omitempty"`
	Version   string  `json:"version,omitempty"`
	Grade     *int    `json:"grade,omitempty"`
	Semester  string  `json:"semester,omitempty"`
	Page      int     `json:"page,omitempty"`
	Size      int     `json:"size,omitempty"`
}

type SearchTextbookResult struct {
	Total int        `json:"total"`
	Data  []Textbook `json:"data"`
}

type SaveUnitRequest struct {
	TextbookID int64  `json:"textbook_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
}

type UpdateUnitRequest struct {
	Name    *string `json:"name,omitempty"`
	Content *string `json:"content,omitempty"`
}
