export interface Question {
  id: string;
  title: string;
  content?: string;
  knowledge_id?: number;
  course_unit_id?: number;
  textbook_id?: number;
  difficulty?: number;
  question_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionCreateSchema {
  title: string;
  content?: string;
  knowledge_id?: number;
  course_unit_id?: number;
  textbook_id?: number;
  difficulty?: number;
  question_type?: string;
}

export interface QuestionUpdateSchema {
  title?: string;
  content?: string;
  knowledge_id?: number;
  course_unit_id?: number;
  textbook_id?: number;
  difficulty?: number;
  question_type?: string;
}

export interface QuestionSearchSchema {
  current_page?: number;
  page_size?: number;
  title?: string;
  knowledge_id?: number;
  course_unit_id?: number;
  textbook_id?: number;
  difficulty?: number;
  question_type?: string;
}