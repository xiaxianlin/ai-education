package textbook

type Textbook struct {
	ID          int64   `json:"id"`
	Subject     string  `json:"subject"`
	Version     string  `json:"version"`
	Grade       int     `json:"grade"`
	Semester    string  `json:"semester"`
	File        *string `json:"file,omitempty"`
	IndexFileID *string `json:"index_file_id,omitempty"`
	IsParsed    int     `json:"is_parsed"`
}

type Unit struct {
	ID         int64  `json:"id"`
	TextbookID int64  `json:"textbook_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
}

type TextbookVersion struct {
	ID           int64  `json:"id"`
	Subject      string `json:"subject"`
	Name         string `json:"name"`
	RevisionYear int    `json:"revision_year"`
	IsEnabled    int    `json:"is_enabled"`
	CreateTime   int64  `json:"create_time,omitempty"`
	UpdateTime   int64  `json:"update_time,omitempty"`
}

type TeacherBook struct {
	ID          int64   `json:"id"`
	Subject     string  `json:"subject"`
	Version     string  `json:"version"`
	Grade       int     `json:"grade"`
	Semester    string  `json:"semester"`
	File        *string `json:"file,omitempty"`
	IndexFileID *string `json:"index_file_id,omitempty"`
}

type SaveTextbookRequest struct {
	Subject  string `json:"subject"`
	Version  string `json:"version"`
	Grade    int    `json:"grade"`
	Semester string `json:"semester"`
}

type SearchTextbookRequest struct {
	Subject  string `json:"subject,omitempty"`
	Version  string `json:"version,omitempty"`
	Grade    *int   `json:"grade,omitempty"`
	Semester string `json:"semester,omitempty"`
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

type SaveTextbookVersionRequest struct {
	Subject      string `json:"subject"`
	Name         string `json:"name"`
	RevisionYear int    `json:"revision_year"`
}

type SearchTextbookVersionRequest struct {
	Subject string `json:"subject,omitempty"`
}

type SaveTeacherBookRequest struct {
	Subject  string `json:"subject"`
	Version  string `json:"version"`
	Grade    int    `json:"grade"`
	Semester string `json:"semester"`
}

type SearchTeacherBookRequest struct {
	Subject string `json:"subject"`
	Grade   int    `json:"grade"`
}
