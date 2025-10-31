declare global {
  interface Question {
    id: string | number;
    subject: string;
    grade: number;
    type: string;
    content: string;
    options?: string;
    answer?: string;
    resource?: string;
    difficulty?: string;
    textbook_id?: number;
    unit_id?: number;
    knowledge_id?: number;
    textbook?: Textbook;
    unit?: Unit;
    knowledge?: Knowledge;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface QuestionCreateSchema {
    subject: string;
    grade: number;
    type: string;
    content: string;
    options?: string;
    answer?: string;
    resource?: string;
    difficulty?: string;
    knowledge_id?: number;
    unit_id?: number;
    textbook_id?: number;
    status?: number;
  }

  interface QuestionUpdateForm {
    subject?: string;
    grade?: number;
    type?: string;
    content?: string;
    options?: string | string[];
    answer?: string;
    resource?: string;
    difficulty?: string;
    knowledge_id?: number;
    unit_id?: number;
    textbook_id?: number;
    status?: number;
  }

  interface QuestionSearchParams extends SearchParams {
    type?: string;
    subject?: string;
    grade?: number;
  }
}

export {};
