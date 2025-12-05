/**
 * 题目类型
 */
export interface Question {
  id: number;
  type: string;
  subtype?: string;
  subject: string;
  grade: number;
  content: string;
  options?: string;
  answer?: string;
  resource?: string;
  difficulty?: string;
  resource_type?: string;
  resource_content?: string;
  textbook_id: number;
  unit_id?: number;
  knowledge?: string;
  unit?: Unit;
  textbook?: Textbook;
}

/**
 * 教材
 */
export interface Textbook {
  id: number;
  subject: string;
  version: string;
  grade: number;
  semester: string;
  file?: string;
  index_file_id?: string;
  is_parsed: number;
  course_units?: Unit[];
}

/**
 * 单元
 */
export interface Unit {
  id: number;
  textbook_id: number;
  name: string;
  content: string;
  textbook?: Textbook;
}

/**
 * 知识点
 */
export interface Knowledge {
  id: number;
  textbook_id: number;
  unit_id: number;
  name: string;
  content: string;
  difficulty?: string;
  importance?: number;
  order?: number;
  textbook?: Textbook;
  unit?: Unit;
}

/**
 * 教师用书
 */
export interface TeacherBook {
  id: number;
  subject: string;
  version: string;
  grade: number;
  semester: string;
  file?: string;
  index_file_id?: string;
}

/**
 * 创建题目请求
 */
export interface CreateQuestionRequest {
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
}

/**
 * 更新题目请求
 */
export interface UpdateQuestionRequest {
  subject?: string;
  grade?: number;
  type?: string;
  subtype?: string;
  content?: string;
  options?: string | string[];
  answer?: string;
  resource?: string;
  resource_type?: string;
  resource_content?: string;
  difficulty?: string;
  knowledge?: string;
  unit_id?: number;
  textbook_id?: number;
}

