declare global {
  interface SavePracticePromptRequest {
    practice_type: 'daily_practice' | 'unit_practice' | 'assessment';
    subject: string;
    grade: number;
    prompt_id: number;
  }

  interface SearchPracticePromptRequest extends SearchRequest {
    practice_type?: 'daily_practice' | 'unit_practice' | 'assessment';
    subject?: string;
    grade?: number;
    prompt_id?: number;
  }

  // ========== 练习管理 ==========

  interface SearchPracticeRequest extends SearchRequest {
    name?: string;
    slug?: string;
    type?: 'system' | 'custom';
  }
}

export {};
