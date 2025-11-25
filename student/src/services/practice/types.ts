/**
 * 练习相关类型定义
 * 基于后端 schema 定义，与 server/student/schema.py 保持一致
 *
 * 注意：基础类型已定义在 @/lib/types/schema.ts 中
 */

import { PracticeHistory, PracticeSession, Question } from "@/lib/types/schema";

// 导出统一的基础类型
export type {
  Question,
  PracticeSession,
  PracticeHistory,
  PracticeAnswer,
  PracticeWrongRecord,
  PracticeReport,
  SubmitAnswerParams,
  SubmitAnswerResponse,
  BeginPracticeResponse,
  CompletePracticeResponse,
  UnitPracticeStatus,
  PracticeSessionType,
  PracticeSessionStatus,
} from "@/lib/types/schema";

// ===== 扩展类型（用于特定场景） =====

// ===== 练习会话详情 =====
/**
 * 练习会话详情（包含题目和答案）
 */
export interface PracticeSessionDetail {
  session: PracticeSession;
  questions?: Question[];
  answers?: Array<{
    question_id: number;
    question_content: string;
    text_answer?: string;
    status: number; // 答题状态: 0-未答, 1-正确, 2-错误
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

export interface KnowledgeScore {
  total: number;
  correct: number;
  rate: number;
}

// ===== 每日练习类型 =====
/**
 * 每日练习会话（扩展 PracticeSession）
 * 兼容旧接口，实际使用 PracticeSession
 */
export interface DailyPracticeSession extends PracticeSession {
  session_type: "daily_practice";
  date: number; // 日期（如 20241123）
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

/**
 * 每日练习历史记录（扩展 PracticeHistory）
 */
export interface DailyPracticeHistoryItem extends PracticeHistory {
  session_type: "daily_practice";
  target_id: number; // 日期（如 20241123）
}

// ===== 单元练习类型 =====
// 兼容旧接口，实际使用 PracticeSession
export interface UnitPracticeSession extends PracticeSession {
  session_type: "unit_practice";
  unit_id: number;
  target_id: number; // 等于 unit_id
  difficulty: "easy" | "medium" | "hard" | "adaptive";
}

// 单元练习状态（根据 API.md）
// 后端返回 Dict[int, PracticeStatsSchem]，键为 unit_id，值为 PracticeStatsSchem
// 注意：这个类型在 schema.ts 中已定义，这里保留注释说明

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

export interface UnitPracticeReport {
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

/**
 * 单元练习历史记录（扩展 PracticeHistory）
 */
export interface PracticeHistoryItem extends PracticeHistory {
  session_type: "unit_practice";
  unit_id: number;
  target_id: number; // 等于 unit_id
}

// ===== 能力评测类型 =====
// 兼容旧接口，实际使用 PracticeSession
export interface AssessmentTest extends PracticeSession {
  session_type: "assessment";
  assessment_type: "unit" | "comprehensive" | "topic";
  current_ability: number;
  ability_level: "beginner" | "intermediate" | "advanced";
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

/**
 * 能力评估历史记录（扩展 PracticeHistory）
 */
export interface AssessmentHistoryItem extends PracticeHistory {
  session_type: "assessment";
  assessment_type?: "unit" | "comprehensive" | "topic";
  current_ability?: number;
  ability_level?: "beginner" | "intermediate" | "advanced";
  overall_score?: number;
  confidence?: number;
  answered_count?: number;
}
