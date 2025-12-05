import type { Textbook, Question } from './question';

/**
 * 学生信息
 */
export interface Student {
  id: string;
  name: string;
  phone: string;
  grade: number;
  status: number;
  create_time: number;
  update_time?: number;
}

/**
 * 学生教材关联
 */
export interface StudentTextbook {
  id: number;
  student_id: string;
  textbook_id: number;
  active: number;
  textbook?: Textbook;
}

/**
 * 练习会话
 */
export interface PracticeSession {
  id: number;
  student_id: string;
  session_type: string;
  target_id?: number;
  textbook_id?: number;
  question_count: number;
  answer_count: number;
  correct_count: number;
  status: number;
  generate_status: number;
  start_time: number;
  end_time?: number;
  create_time: number;
  update_time?: number;
  textbook?: Textbook;
}

/**
 * 练习答案
 */
export interface PracticeAnswer {
  id: number;
  session_id: number;
  question_id: number;
  question_order: number;
  text_answer?: string;
  status: number;
  time_spent: number;
  submit_time?: number;
  audio_answer?: string;
  question?: Question;
}

/**
 * 练习错题记录
 */
export interface PracticeWrongRecord {
  id: number;
  student_id: string;
  question_id: number;
  session_id: number;
  unit_id?: number;
  knowledge?: string;
  textbook_id?: number;
  user_answer?: string;
  correct_answer?: string;
  analysis?: string;
  time_spent: number;
  is_corrected: number;
  corrected_time: number;
  create_time: number;
  update_time: number;
}

/**
 * 练习报告
 */
export interface PracticeReport {
  id: number;
  session_id: number;
  student_id: string;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  overall_score: number;
  current_ability: number;
  confidence: number;
  ability_level: string;
  percentile: number;
  knowledge_scores: string;
  question_distribution: string;
  ability_breakdown: string;
  learning_speed: number;
  consistency: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  create_time: number;
}

/**
 * 练习详情
 */
export interface PracticeDetail {
  session: PracticeSession;
  answers: PracticeAnswer[];
  report: PracticeReport;
  wrong_records: PracticeWrongRecord[];
}

// Question 类型从 question.ts 导入

