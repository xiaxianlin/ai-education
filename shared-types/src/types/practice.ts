import { BaseEntity, PracticeType, PracticeSessionStatus, PracticeGenerateStatus, AnswerStatus } from './common';
import { Student } from './user';
import { Textbook, Unit, Question } from './education';

// ===== 练习会话相关 =====

/**
 * 练习会话
 */
export interface PracticeSession extends BaseEntity {
  id: number;
  student_id: string;
  session_type: PracticeType;
  target_id?: number; // 单元ID或日期（如 20241123）
  textbook_id?: number;
  question_count: number;
  answer_count: number;
  correct_count: number;
  status: PracticeSessionStatus;
  generate_status: PracticeGenerateStatus;
  start_time: number;
  end_time?: number;

  // 关联数据
  student?: Student;
  textbook?: Textbook;
  unit?: Unit;
  questions?: Question[];
  answers?: PracticeAnswer[];
  report?: PracticeReport;
}

/**
 * 创建练习请求
 */
export interface CreatePracticeRequest {
  type: PracticeType;
  textbook_id: number;
  unit_id?: number;
  target_date?: string; // 格式: YYYYMMDD
  question_count?: number;
  difficulty?: string;
  knowledge_ids?: number[]; // 指定知识点
}

/**
 * 练习答案记录
 */
export interface PracticeAnswer extends BaseEntity {
  id: number;
  session_id: number;
  question_id: number;
  question_order: number; // 题目在练习中的顺序
  text_answer?: string; // 文本答案
  status: AnswerStatus; // 答题状态
  time_spent: number; // 耗时（秒）
  submit_time?: number; // 提交时间
  audio_answer?: string; // 音频答案（OSS 存储路径）

  // 关联数据
  question?: Question;
}

/**
 * 提交答案请求
 */
export interface SubmitAnswerRequest {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent: number; // 答题耗时（秒）
  is_audio_answer?: boolean; // 是否为音频回答
  audio_data?: string; // 音频 OSS 存储路径
  audio_match?: boolean; // 音频理解结果：是否匹配题目要求
  audio_reason?: string; // 音频理解结果：原因说明
  audio_suggestion?: string; // 音频理解结果：改进建议
}

/**
 * 提交答案响应
 */
export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  user_answer?: string; // 用户答案（可能是ASR识别后的文本）
  analysis?: string; // 错题分析
  explanation?: string; // 题目解析
  session_progress: {
    answer_count: number;
    correct_count: number;
    total_count: number;
    status: PracticeSessionStatus;
  };
}

// ===== 错题记录 =====

/**
 * 错题记录
 */
export interface WrongRecord extends BaseEntity {
  id: number;
  student_id: string;
  question_id: number;
  session_id: number;
  unit_id?: number;
  knowledge_ids?: number[]; // 错题涉及的知识点
  knowledge_names?: string[];
  textbook_id?: number;
  user_answer?: string;
  correct_answer?: string;
  analysis?: string; // 错题分析
  time_spent?: number;
  is_corrected: boolean; // 是否已订正
  corrected_time?: number;
  review_count: number; // 复习次数
  mastery_level: number; // 掌握程度 1-5

  // 关联数据
  question?: Question;
  session?: PracticeSession;
}

// ===== 练习报告 =====

/**
 * 练习报告
 */
export interface PracticeReport extends BaseEntity {
  id: number;
  session_id: number;
  student_id: string;
  total_questions: number;
  correct_questions: number;
  total_time: number; // 总耗时（秒）
  overall_score: number; // 总得分
  accuracy_rate: number; // 正确率

  // 能力评估（主要用于assessment）
  current_ability?: number; // 当前能力值（-3到+3）
  ability_level?: string; // 能力等级
  percentile?: number; // 百分位排名
  confidence?: number; // 置信度

  // 详细分析（JSON格式）
  knowledge_scores?: Record<string, number>; // 知识点掌握情况
  question_distribution?: Record<string, number>; // 题目来源分布
  ability_breakdown?: Record<string, any>; // 能力分解
  learning_speed?: number; // 学习速度
  consistency?: number; // 稳定性
  strengths?: string[]; // 优势知识点
  weaknesses?: string[]; // 薄弱知识点
  recommendations?: string[]; // 学习建议

  // 关联数据
  session?: PracticeSession;
}

/**
 * 能力评估详情
 */
export interface AbilityAssessment {
  overall_score: number;
  ability_level: string;
  percentile: number;
  confidence: number;
  subject_scores: Record<string, number>;
  knowledge_mastery: Record<string, {
    score: number;
    level: string;
    improvement_needed: boolean;
  }>;
  learning_trends: {
    speed: number;
    consistency: number;
    improvement_rate: number;
  };
  next_step_recommendations: string[];
}

// ===== 学习统计 =====

/**
 * 学生学习统计
 */
export interface LearningStatistics {
  student_id: string;
  period: string; // 统计周期：daily/weekly/monthly

  // 基础统计
  total_practices: number;
  total_questions: number;
  total_time: number; // 总学习时间（秒）
  average_accuracy: number;
  average_time_per_question: number; // 平均每题时间（秒）

  // 按类型统计
  practice_type_stats: Record<PracticeType, {
    count: number;
    questions: number;
    accuracy: number;
    time: number;
  }>;

  // 知识点掌握度
  knowledge_mastery: Record<string, {
    total_attempts: number;
    correct_attempts: number;
    accuracy: number;
    mastery_level: number;
  }>;

  // 学习趋势
  daily_progress: Array<{
    date: string;
    questions: number;
    accuracy: number;
    time: number;
  }>;

  // 薄弱点分析
  weak_areas: Array<{
    knowledge_name: string;
    accuracy: number;
    recommended_actions: string[];
  }>;
}