package ai

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"google.golang.org/adk/agent"
	"google.golang.org/adk/agent/llmagent"
	"google.golang.org/adk/model"
	"google.golang.org/adk/model/gemini"
	"google.golang.org/adk/runner"
	"google.golang.org/adk/session"
	"google.golang.org/genai"
)

const defaultADKAppName = "ai-education-go"

type ADKConfig struct {
	APIKey    string
	APIBase   string
	ModelName string
	AppName   string
}

type ADKAdapter struct {
	model   model.LLM
	appName string
}

func NewGeminiADKAdapter(ctx context.Context, cfg ADKConfig) (*ADKAdapter, error) {
	modelName := strings.TrimSpace(cfg.ModelName)
	if modelName == "" {
		return nil, fmt.Errorf("%w: adk model name is required", ErrNotConfigured)
	}

	clientConfig := &genai.ClientConfig{
		APIKey: strings.TrimSpace(cfg.APIKey),
	}
	if baseURL := strings.TrimSpace(cfg.APIBase); baseURL != "" {
		clientConfig.HTTPOptions.BaseURL = baseURL
	}

	llm, err := gemini.NewModel(ctx, modelName, clientConfig)
	if err != nil {
		return nil, fmt.Errorf("create adk gemini model: %w", err)
	}
	return NewADKAdapter(llm, cfg.AppName)
}

func NewADKAdapter(llm model.LLM, appName string) (*ADKAdapter, error) {
	if llm == nil {
		return nil, fmt.Errorf("%w: adk model is required", ErrNotConfigured)
	}
	appName = strings.TrimSpace(appName)
	if appName == "" {
		appName = defaultADKAppName
	}
	return &ADKAdapter{model: llm, appName: appName}, nil
}

func (a *ADKAdapter) Invoke(ctx Context, req AdapterRequest) (AdapterResponse, error) {
	if a == nil || a.model == nil {
		return AdapterResponse{}, ErrNotConfigured
	}

	runCtx, cancel := toContext(ctx)
	defer cancel()

	config, err := generationConfig(req)
	if err != nil {
		return AdapterResponse{}, err
	}

	name := strings.TrimSpace(req.AgentName)
	if name == "" {
		name = "ai_education_agent"
	}
	instruction := buildInstruction(req)
	adkAgent, err := llmagent.New(llmagent.Config{
		Name:                  sanitizeAgentName(name),
		Model:                 a.model,
		Description:           "AI education task agent",
		Instruction:           instruction,
		GenerateContentConfig: config,
	})
	if err != nil {
		return AdapterResponse{}, fmt.Errorf("create adk agent: %w", err)
	}

	adkRunner, err := runner.New(runner.Config{
		AppName:           a.appName,
		Agent:             adkAgent,
		SessionService:    session.InMemoryService(),
		AutoCreateSession: true,
	})
	if err != nil {
		return AdapterResponse{}, fmt.Errorf("create adk runner: %w", err)
	}

	sessionID := newADKSessionID()
	userID := req.Metadata["student_id"]
	if userID == "" {
		userID = "system"
	}

	var lastText string
	var usage *UsageMetadata
	msg := genai.NewContentFromText(req.UserMessage, genai.RoleUser)
	for event, err := range adkRunner.Run(runCtx, userID, sessionID, msg, agent.RunConfig{}) {
		if err != nil {
			return AdapterResponse{}, fmt.Errorf("run adk agent: %w", err)
		}
		if event == nil {
			continue
		}
		if text := contentText(event.LLMResponse.Content); text != "" {
			lastText = text
		}
		if event.LLMResponse.UsageMetadata != nil {
			usage = convertUsage(event.LLMResponse.UsageMetadata)
		}
	}
	if strings.TrimSpace(lastText) == "" {
		return AdapterResponse{}, fmt.Errorf("%w: empty adk response", ErrInvalidAIJSON)
	}

	response := AdapterResponse{
		Text:  lastText,
		Usage: usage,
	}
	if data, err := ExtractJSON(lastText); err == nil {
		response.JSON = append([]byte(nil), data...)
	}
	return response, nil
}

type ADKProvider struct {
	adapter Adapter
}

func NewADKProvider(adapter Adapter) ADKProvider {
	return ADKProvider{adapter: adapter}
}

func (p ADKProvider) GenerateQuestions(ctx Context, req GenerateQuestionRequest) ([]GeneratedQuestion, error) {
	if p.adapter == nil {
		return nil, ErrNotConfigured
	}
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	resp, err := p.adapter.Invoke(ctx, AdapterRequest{
		AgentName:    "question_generator",
		SystemPrompt: questionGenerationInstruction(),
		UserMessage:  string(payload),
		ResponseSchema: `{
			"type":"object",
			"properties":{"questions":{"type":"array","items":{"type":"object"}}},
			"required":["questions"]
		}`,
		Metadata: map[string]string{
			"task": "generate_questions",
		},
	})
	if err != nil {
		return nil, err
	}
	questions, err := DecodeGeneratedQuestions(responseText(resp))
	if err != nil {
		return nil, err
	}
	if err := ValidateGeneratedQuestions(questions); err != nil {
		return nil, err
	}
	return questions, nil
}

func (p ADKProvider) GenerateReport(ctx Context, req GenerateReportRequest) (PracticeReportDraft, error) {
	if p.adapter == nil {
		return PracticeReportDraft{}, ErrNotConfigured
	}
	payload, err := json.Marshal(req)
	if err != nil {
		return PracticeReportDraft{}, err
	}
	resp, err := p.adapter.Invoke(ctx, AdapterRequest{
		AgentName:    "practice_report_generator",
		SystemPrompt: reportGenerationInstruction(),
		UserMessage:  string(payload),
		ResponseSchema: `{
			"type":"object",
			"properties":{
				"overall_score":{"type":"number"},
				"current_ability":{"type":"number"},
				"confidence":{"type":"number"},
				"ability_level":{"type":"string"},
				"percentile":{"type":"integer"},
				"knowledge_scores":{"type":"object"},
				"question_distribution":{"type":"object"},
				"ability_breakdown":{"type":"object"},
				"learning_speed":{"type":"number"},
				"consistency":{"type":"number"},
				"strengths":{"type":"array","items":{"type":"string"}},
				"weaknesses":{"type":"array","items":{"type":"string"}},
				"recommendations":{"type":"array","items":{"type":"string"}}
			},
			"required":["overall_score","current_ability","confidence","ability_level","percentile","knowledge_scores","question_distribution","ability_breakdown","learning_speed","consistency","strengths","weaknesses","recommendations"]
		}`,
		Metadata: map[string]string{
			"task":       "generate_report",
			"student_id": req.StudentID,
		},
	})
	if err != nil {
		return PracticeReportDraft{}, err
	}
	return DecodeJSON[PracticeReportDraft](responseText(resp))
}

func (p ADKProvider) EvaluateAnswer(ctx Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error) {
	return ObjectiveAnswerEvaluator{}.EvaluateAnswer(ctx, req)
}

func generationConfig(req AdapterRequest) (*genai.GenerateContentConfig, error) {
	cfg := &genai.GenerateContentConfig{}
	if strings.TrimSpace(req.ResponseSchema) != "" {
		var schema any
		if err := json.Unmarshal([]byte(req.ResponseSchema), &schema); err != nil {
			return nil, fmt.Errorf("%w: invalid response schema: %v", ErrInvalidAIJSON, err)
		}
		cfg.ResponseMIMEType = "application/json"
		cfg.ResponseJsonSchema = schema
	}
	return cfg, nil
}

func buildInstruction(req AdapterRequest) string {
	var b strings.Builder
	if strings.TrimSpace(req.SystemPrompt) != "" {
		b.WriteString(strings.TrimSpace(req.SystemPrompt))
		b.WriteString("\n\n")
	}
	if strings.TrimSpace(req.ResponseSchema) != "" {
		b.WriteString("Return only valid JSON matching this JSON Schema. Do not wrap the JSON in markdown fences.\n")
		b.WriteString(req.ResponseSchema)
	}
	return strings.TrimSpace(b.String())
}

func responseText(resp AdapterResponse) string {
	if len(resp.JSON) > 0 {
		return string(resp.JSON)
	}
	return resp.Text
}

func contentText(content *genai.Content) string {
	if content == nil {
		return ""
	}
	parts := make([]string, 0, len(content.Parts))
	for _, part := range content.Parts {
		if part == nil || strings.TrimSpace(part.Text) == "" {
			continue
		}
		parts = append(parts, part.Text)
	}
	return strings.TrimSpace(strings.Join(parts, ""))
}

func convertUsage(usage *genai.GenerateContentResponseUsageMetadata) *UsageMetadata {
	if usage == nil {
		return nil
	}
	return &UsageMetadata{
		InputTokens:  int(usage.PromptTokenCount),
		OutputTokens: int(usage.CandidatesTokenCount),
		TotalTokens:  int(usage.TotalTokenCount),
	}
}

func toContext(ctx Context) (context.Context, context.CancelFunc) {
	if ctx == nil {
		return context.WithCancel(context.Background())
	}
	if standard, ok := ctx.(context.Context); ok {
		child, cancel := context.WithCancel(standard)
		return child, cancel
	}
	child, cancel := context.WithCancel(context.Background())
	go func() {
		select {
		case <-ctx.Done():
			cancel()
		case <-child.Done():
		}
	}()
	return child, cancel
}

func sanitizeAgentName(name string) string {
	name = strings.TrimSpace(name)
	var b strings.Builder
	for _, r := range name {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			b.WriteRune(r)
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '_':
			b.WriteRune(r)
		default:
			b.WriteByte('_')
		}
	}
	out := strings.Trim(b.String(), "_")
	if out == "" || out == "user" {
		return "ai_education_agent"
	}
	return out
}

func newADKSessionID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "adk-session"
	}
	return "adk-" + hex.EncodeToString(b[:])
}

func questionGenerationInstruction() string {
	return strings.Join([]string{
		"You are an elementary education question generation agent.",
		"Generate age-appropriate Chinese practice questions from the JSON request.",
		"Every question must include id, question_type_code, subject, grade, content, answer, and optional difficulty.",
		"Use content.stem for the prompt, content.options for choices, and answer.analysis_mode plus answer.value/correct_value for grading.",
	}, "\n")
}

func reportGenerationInstruction() string {
	return strings.Join([]string{
		"You are an elementary education learning analytics agent.",
		"Create a concise practice report from the JSON request.",
		"Return numeric scores and short Chinese feedback arrays for strengths, weaknesses, and recommendations.",
	}, "\n")
}

var _ Adapter = (*ADKAdapter)(nil)
var _ QuestionGenerator = ADKProvider{}
var _ AnswerEvaluator = ADKProvider{}
var _ ReportGenerator = ADKProvider{}

func IsADKConfigured(err error) bool {
	return !errors.Is(err, ErrNotConfigured)
}
