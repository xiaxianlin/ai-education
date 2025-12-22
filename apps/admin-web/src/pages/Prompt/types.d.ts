declare global {
  interface SearchPromptRequest extends SearchRequest {
    name?: string;
    type?: string;
    slug?: string;
  }

  interface SearchPromptVersionRequest extends SearchRequest {
    prompt_id?: number;
  }

  interface SavePromptRequest {
    name?: string;
    slug?: string;
    type?: string;
    description?: string;
    template_content?: string;
    negative_content?: string;
    model_params?: any;
  }

  interface TestPromptRequest {
    variables?: Record<string, any>;
    model_provider?: string;
    model_name?: string;
    model_params?: {
      temperature?: number;
      max_tokens?: number;
      [key: string]: any;
    };
    generation_type?: GenerateType;
  }

  interface TestPromptResponse {
    rendered_prompt: string;
    response_snapshot: {
      content?: string;
      model?: string;
      usage?: {
        prompt_tokens?: number | null;
        completion_tokens?: number | null;
        total_tokens?: number | null;
      };
      finish_reason?: string;
      model_provider: string;
      model_name: string;
      model_params: any;
      latency_ms: number;
      response_id?: string | null;
      error?: string;
    };
    ai_response?: string;
    latency_ms: number;
    status: 'testing' | 'success' | 'failed';
    error?: string | null;
    record_id: number;
  }

  interface PromptMetrics {
    calls: number;
    success_rate: number;
    p95_latency_ms?: number | null;
  }

  interface SearchPromptTestRecordRequest extends SearchRequest {
    prompt_id?: number;
    version_id?: number;
    generation_type?: string;
    model_name?: string;
    status?: number;
  }
}

export {};
