package ai

type PromptLoader interface {
	LoadPrompt(ctx Context, code string) (string, error)
}

type RAGSearcher interface {
	SearchRAG(ctx Context, req SearchRAGRequest) ([]RAGDocument, error)
}

type ImageGenerator interface {
	GenerateImage(ctx Context, prompt string) ([]byte, error)
}

type AudioGenerator interface {
	GenerateAudio(ctx Context, text string) ([]byte, error)
}

type ObjectUploader interface {
	UploadImage(ctx Context, data []byte) (string, error)
	UploadAudio(ctx Context, data []byte) (string, error)
}

type SearchRAGRequest struct {
	Query      string         `json:"query"`
	Subject    string         `json:"subject,omitempty"`
	Grade      int            `json:"grade,omitempty"`
	UnitID     int64          `json:"unit_id,omitempty"`
	TopK       int            `json:"top_k,omitempty"`
	Attributes map[string]any `json:"attributes,omitempty"`
}

type RAGDocument struct {
	ID       string         `json:"id"`
	Title    string         `json:"title,omitempty"`
	Content  string         `json:"content"`
	Score    float64        `json:"score,omitempty"`
	Metadata map[string]any `json:"metadata,omitempty"`
}
