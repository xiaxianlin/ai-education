package student

type Textbook struct {
	ID          int64   `json:"id"`
	Subject     string  `json:"subject"`
	Version     string  `json:"version"`
	Grade       int     `json:"grade"`
	Semester    string  `json:"semester"`
	File        *string `json:"file"`
	IndexFileID *string `json:"index_file_id"`
	IsParsed    int     `json:"is_parsed"`
}

type Profile struct {
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Grade     *int       `json:"grade"`
	Semester  *string    `json:"semester"`
	Subject   *string    `json:"subject"`
	Textbooks []Textbook `json:"textbooks"`
}

type UpdateSettingsRequest struct {
	Grade    int    `json:"grade"`
	Semester string `json:"semester"`
	Subject  string `json:"subject"`
}

type UpdateSettings struct {
	Grade    int
	Semester string
	Subject  string
}
