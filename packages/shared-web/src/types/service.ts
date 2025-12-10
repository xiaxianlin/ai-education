/**
 * 学生端服务相关类型定义
 */

import type { PracticeSession, PracticeAnswer, PracticeReport } from './practice';
import type { Question } from './question';

/**
 * 登录请求参数（对应 LoginSchema）
 */
export interface LoginParams {
  phone: string;
  password: string;
}

/**
 * 提交答案请求参数（对应 AnswerQuestionSchema）
 */
export interface AnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent?: number;
  is_audio_answer?: boolean;
  audio_data?: string; // 音频 OSS 存储路径
}

/**
 * 提交答案响应（对应 AnswerResultSchema）
 */
export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  user_answer: string;
  analysis?: string;
}

/**
 * 获取练习会话详情响应
 */
export interface PracticeSessionDetail {
  session: PracticeSession;
  questions: Question[];
  answers: PracticeAnswer[];
  report: PracticeReport;
}

/**
 * 完成练习响应
 */
export interface CompletePracticeResponse {
  report_id: number;
}

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * 创建练习任务响应
 */
export interface CreatePracticeTaskResponse {
  task_id: string;
  status: TaskStatus;
}

/**
 * 练习任务状态响应
 */
export interface PracticeTaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  created_at?: string;
  updated_at?: string;
  result?: {
    session_id: number;
    question_count: number;
  };
  error?: string;
  processing_time?: number;
}

/**
 * 提交答案请求参数（对应 SubmitAnswerParams）
 */
export interface SubmitAnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent: number; // 答题耗时（秒）
  is_audio_answer?: boolean; // 是否为音频回答（口语题）
  audio_data?: string; // 音频 OSS 存储路径
  audio_match?: boolean; // 音频理解结果：是否匹配题目要求（仅口语题）
  audio_reason?: string; // 音频理解结果：匹配/不匹配的原因说明（仅口语题）
  audio_suggestion?: string; // 音频理解结果：改进建议（仅口语题）
}

/**
 * 提交答案响应
 */
export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  user_answer?: string; // 用户答案（可能是ASR识别后的文本）
  analysis?: string; // 错题分析（答错时返回）
  session_progress: {
    answer_count: number;
    correct_count: number;
    total_count: number; // 题目总数
    status: number; // PracticeSessionStatus
  };
}

/**
 * 上传录音结果（对应 UploadRecordingResultSchema）
 */
export interface UploadRecordingResult {
  oss_path: string; // OSS 存储路径
  transcription: string; // ASR 识别文本
  match: boolean; // 是否匹配题目要求
  reason: string; // 匹配/不匹配的原因说明
  suggestion?: string; // 改进建议（可选）
}

/**
 * 开始练习响应
 */
export interface BeginPracticeResponse {
  session_id: number;
  status: number; // PracticeSessionStatus
  session_type: string; // PracticeSessionType
  target_id?: number;
  textbook_id?: number;
  question_count: number;
  answer_count: number;
  correct_count: number;
  generate_status?: number; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
  start_time: number;
  create_time: number;
}

