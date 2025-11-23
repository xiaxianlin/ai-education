/**
 * 练习相关类型定义
 * 根据 API.md 规范定义
 */

// ===== 通用类型 =====
export interface Question {
  id: number;
  type: string;
  subtype?: string;
  content: string;
  options?: string;
  difficulty?: string;
  knowledge?: string;
  resource?: string;
  resource_type?: 'image' | 'audio' | null;
  resource_content?: string;
  answer?: string;
  is_correct?: boolean;
  order?: number;
}

// 根据 API.md 定义的练习会话接口
export interface PracticeSession {
  session_id: number;
  session_type: 'daily_practice' | 'unit_practice' | 'assessment';
  target_id?: number; // 每日练习的日期（如 20241123），单元练习的单元ID，能力评估的目标ID
  textbook_id?: number; // 教材ID（历史记录中）
  question_count: number;
  answer_count: number;
  correct_count: number;
  status: number; // 0-未开始, 1-进行中, 2-已完成
  create_time?: number;
  start_time?: number;
  end_time?: number;
  questions?: Question[];
  // 每日练习特有字段
  date?: number; // 日期（如 20241123）
  score?: number; // 得分
  // 单元练习特有字段
  unit_id?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  // 能力评估特有字段
  assessment_type?: 'unit' | 'comprehensive' | 'topic';
  current_ability?: number; // 能力值
  ability_level?: 'beginner' | 'intermediate' | 'advanced';
  overall_score?: number; // 总分
  confidence?: number; // 置信度（0-1）
  answered_count?: number; // 已答题数
  // 其他字段
  total_time?: number; // 总用时（秒）
  update_time?: number;
}

// 练习会话详情
export interface PracticeSessionDetail {
  session: PracticeSession;
  questions?: Question[];
  answers?: Array<{
    question_id: number;
    question_content: string;
    text_answer?: string;
    is_correct: number; // 0-未答, 1-正确, 2-错误
    time_spent: number; // 答题耗时（秒）
    audio_data?: string; // 音频答案（base64）
  }>;
  report?: {
    total_questions: number;
    correct_questions: number;
    overall_score: number;
    total_time: number;
  };
  unit?: {
    id: number;
    name: string;
    textbook_id: number;
  };
}

export interface SubmitAnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent?: number;
  is_audio_answer?: boolean;
  audio_data?: string; // 音频数据（base64编码）
  audio_url?: string; // 录音文件 URL（兼容旧接口）
}

export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  analysis?: string; // 解析说明
  explanation?: string; // 兼容旧字段
  session_progress?: {
    answer_count: number;
    correct_count: number;
    question_count: number;
  };
}

export interface KnowledgeScore {
  total: number;
  correct: number;
  rate: number;
}

// ===== 每日练习类型 =====
// 兼容旧接口，实际使用 PracticeSession
export interface DailyPracticeSession extends PracticeSession {
  session_type: 'daily_practice';
  date: number;
  target_id: number; // 等于 date
}

export interface CreateDailyPracticeParams {
  count?: number;
  practice_type?: string;
}

export interface DailyPracticeSessionDetail {
  session: PracticeSession;
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

export interface DailyPracticeHistoryItem extends PracticeSession {
  session_type: 'daily_practice';
  target_id: number; // 日期（如 20241123）
}

// ===== 单元练习类型 =====
// 兼容旧接口，实际使用 PracticeSession
export interface UnitPracticeSession extends PracticeSession {
  session_type: 'unit_practice';
  unit_id: number;
  target_id: number; // 等于 unit_id
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
}

// 单元练习状态（根据 API.md）
export interface UnitPracticeStatus {
  [unitId: string]: PracticeSession | null;
}

export interface UnitInfo {
  id: number;
  name: string;
  content: string;
}

// PracticeSessionDetail 已在上面定义，这里保留兼容
export interface UnitPracticeSessionDetail {
  session: PracticeSession;
  questions: Question[];
  unit?: UnitInfo;
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

export interface PracticeHistoryItem extends PracticeSession {
  session_type: 'unit_practice';
  unit_id: number;
  target_id: number; // 等于 unit_id
}

// ===== 能力评测类型 =====
// 兼容旧接口，实际使用 PracticeSession
export interface AssessmentTest extends PracticeSession {
  session_type: 'assessment';
  assessment_type: 'unit' | 'comprehensive' | 'topic';
  current_ability: number;
  ability_level: 'beginner' | 'intermediate' | 'advanced';
  overall_score: number;
  confidence: number;
  answered_count: number;
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

export interface AssessmentHistoryItem extends PracticeSession {
  session_type: 'assessment';
  assessment_type: 'unit' | 'comprehensive' | 'topic';
  current_ability: number;
  ability_level: 'beginner' | 'intermediate' | 'advanced';
  overall_score: number;
  confidence: number;
  answered_count: number;
}

