package ai

import "encoding/json"

type Adapter interface {
	Invoke(ctx Context, req AdapterRequest) (AdapterResponse, error)
}

type AdapterRequest struct {
	AgentName      string            `json:"agent_name"`
	SystemPrompt   string            `json:"system_prompt"`
	UserMessage    string            `json:"user_message"`
	ResponseSchema string            `json:"response_schema,omitempty"`
	Tools          []ToolDefinition  `json:"tools,omitempty"`
	Metadata       map[string]string `json:"metadata,omitempty"`
}

type AdapterResponse struct {
	Text      string          `json:"text,omitempty"`
	JSON      json.RawMessage `json:"json,omitempty"`
	ToolCalls []ToolCall      `json:"tool_calls,omitempty"`
	Usage     *UsageMetadata  `json:"usage,omitempty"`
}

type ToolDefinition struct {
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	InputSchema map[string]any `json:"input_schema,omitempty"`
}

type ToolCall struct {
	Name      string         `json:"name"`
	Arguments map[string]any `json:"arguments,omitempty"`
	Result    any            `json:"result,omitempty"`
}

type UsageMetadata struct {
	InputTokens  int `json:"input_tokens,omitempty"`
	OutputTokens int `json:"output_tokens,omitempty"`
	TotalTokens  int `json:"total_tokens,omitempty"`
}
