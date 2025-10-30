declare global {
  interface Question {
    id: string;
    subject?: string;
    grade?: number;
    type?: string;
    title: string;
    content?: string;
    options?: string;
    answer?: string;
    difficulty?: string;
    textbook?: Textbook;
    unit?: Unit;
    knowledge?: Knowledge;
    status?: number;
    create_time?: number;
    update_time?: number;
  }

  interface QuestionCreateSchema {
    title: string;
    content?: string;
    knowledge_id?: number;
    course_unit_id?: number;
    textbook_id?: number;
    difficulty?: number;
    question_type?: string;
  }

  interface QuestionUpdateSchema {
    title?: string;
    content?: string;
    knowledge_id?: number;
    course_unit_id?: number;
    textbook_id?: number;
    difficulty?: number;
    question_type?: string;
  }

  interface QuestionSearchParams extends SearchParams {
    type?: string;
    subject?: string;
    grade?: number;
  }
}

export {};
