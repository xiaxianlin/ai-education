import type { GenerateType } from '@ai-education/shared-web';

declare global {
  interface SearchPromptRequest extends SearchRequest {
    name?: string;
    type?: string;
    slug?: string;
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
}

export { };

