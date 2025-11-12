/**
 * 练习相关类型定义
 * 统一管理所有练习模块的类型
 */

// ===== 通用类型 =====
export interface Question {
  id: number;
  type: string;
  subtype?: string;
  content: string;
  options: string;
  difficulty: string;
  knowledge: string;
  resource?: string;
  resource_type?: string;
  resource_content?: string;
  answer?: string;
  is_correct?: boolean;
}

export interface SubmitAnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent?: number;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
}

export interface KnowledgeScore {
  total: number;
  correct: number;
  rate: number;
}

// ===== 今日练习类型 =====
export interface DailyPracticeSession {
  id: number;
  student_id: string;
  date: number;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  score: number;
  practice_type: string;
  knowledge_coverage: string;
  question_distribution: string;
  question_ids: string;
  answers: string;
  status: string;
  create_time: number;
  update_time: number;
}

export interface CreateDailyPracticeParams {
  count?: number;
  practice_type?: string;
}

export interface DailyPracticeSessionDetail {
  session: DailyPracticeSession;
  questions: Question[];
}

export interface DailyPracticeReport {
  session_id: number;
  date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  knowledge_coverage: Record<string, KnowledgeScore>;
  question_distribution: Record<string, number>;
  status: string;
}

export interface DailyPracticeHistoryItem {
  id: number;
  date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  practice_type: string;
  status: string;
}

// ===== 单元练习类型 =====
export interface UnitPracticeSession {
  id: number;
  student_id: string;
  unit_id: number;
  practice_date: number;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  score: number;
  knowledge_scores: string;
  difficulty: string;
  question_ids: string;
  answers: string;
  status: string;
  create_time: number;
  update_time: number;
}

export interface UnitInfo {
  id: number;
  name: string;
  content: string;
}

export interface PracticeSessionDetail {
  session: UnitPracticeSession;
  questions: Question[];
  unit: UnitInfo;
}

export interface CreatePracticeParams {
  unit_id: number;
  difficulty?: string;
  count?: number;
}

export interface PracticeReport {
  session_id: number;
  unit_id: number;
  unit_name: string;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  knowledge_scores: Record<string, KnowledgeScore>;
  status: string;
  practice_date: number;
}

export interface UnitProgress {
  unit_id: number;
  total_sessions: number;
  average_score: number;
  best_score: number;
  total_questions: number;
  correct_questions: number;
  knowledge_progress: Record<string, KnowledgeScore>;
  recent_sessions: Array<{
    id: number;
    practice_date: number;
    score: number;
    total_questions: number;
    correct_questions: number;
    difficulty: string;
  }>;
}

export interface PracticeHistoryItem {
  id: number;
  unit_id: number;
  unit_name: string;
  practice_date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  difficulty: string;
  status: string;
}

// ===== 能力评测类型 =====
export interface AssessmentTest {
  id: number;
  student_id: string;
  assessment_type: string;
  target_id?: number;
  status: string;
  start_time: number;
  end_time?: number;
  total_time: number;
  adaptive: number;
  max_questions: number;
  min_questions: number;
  difficulty_range: string;
  current_ability: number;
  confidence: number;
  overall_score: number;
  ability_level: string;
  answered_count: number;
  create_time: number;
  update_time: number;
}

export interface CreateAssessmentParams {
  assessment_type?: string;
  target_id?: number;
  max_questions?: number;
  min_questions?: number;
}

export interface AssessmentNextQuestion {
  question: Question;
  progress: {
    current: number;
    max: number;
    min: number;
  };
  current_ability: number;
  confidence: number;
}

export interface AssessmentAnswerResult {
  is_correct: boolean;
  correct_answer: string;
  current_ability: number;
  confidence: number;
  answered_count: number;
}

export interface AssessmentReport {
  assessment_id: number;
  overall_score: number;
  ability_level: string;
  answered_count: number;
  total_time: number;
  report: {
    knowledge_mastery: Record<string, KnowledgeScore>;
    ability_breakdown: Record<string, KnowledgeScore>;
    learning_speed: number;
    consistency: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface AssessmentHistoryItem {
  id: number;
  assessment_type: string;
  target_id?: number;
  start_time: number;
  end_time?: number;
  answered_count: number;
  overall_score: number;
  ability_level: string;
  status: string;
}

