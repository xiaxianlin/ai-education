declare global {
  interface SavePracticePromptRequest {
    practice_slug: string;
    subject: string;
    grade: number;
    prompt_slug: string;
  }

  interface SearchPracticePromptRequest extends SearchRequest {
    practice_slug?: string;
    subject?: string;
    grade?: number;
    prompt_slug?: string;
  }

  // ========== 练习管理 ==========

  interface SearchPracticeRequest extends SearchRequest {
    name?: string;
    slug?: string;
    type?: 'system' | 'custom';
  }
}

export {};
