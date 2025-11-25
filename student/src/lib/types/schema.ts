/**
 * 统一的数据类型定义
 * 基于后端 server/core/schema.py 和 server/student/schema.py 定义
 * 确保前后端类型一致
 */

// ===== 基础类型 =====

/**
 * 学生信息（对应 StudentSchema）
 */
export interface Student {
  id: string;
  name: string;
  phone: string;
  status: number; // 0-正常, 1-禁用
  create_time: number;
  update_time?: number;
}

/**
 * 教材信息（对应 TextbookSchema）
 */
export interface Textbook {
  id: number;
  subject: string; // 科目：数学/英语
  version: string; // 版本：人教版等
  grade: number; // 年级：1-12
  semester: string; // 学期：上学期/下学期/整学期
  file?: string; // PDF文件路径
  index_file_id?: string; // 索引文件ID
  is_parsed?: number; // 是否已解析：0-未解析, 1-已解析
  active?: number; // 是否激活（学生端）：1-激活, 0-未激活
}

/**
 * 单元信息（对应 UnitSchema）
 */
export interface Unit {
  id: number;
  textbook_id: number;
  name: string;
  content: string;
}

/**
 * 知识点信息（对应 KnowledgeSchema）
 */
export interface Knowledge {
  id: number;
  textbook_id: number;
  unit_id: number;
  name: string;
  content: string;
  difficulty?: string; // 难度：简单/普通/困难
  importance?: number; // 重要性：1-10
  order?: number; // 排序值
}

/**
 * 题目信息（对应 QuestionSchema）
 */
export interface Question {
  id: number;
  type: string; // 题目类型（主类型）
  subtype?: string; // 题目子类型
  subject: string; // 科目
  grade: number; // 年级
  content: string; // 题目内容
  options?: string; // 选项（多行文本）
  answer?: string; // 答案
  resource?: string; // 资源路径（图片/音频URL）
  difficulty?: string; // 难度
  resource_type?: "image" | "audio" | null; // 资源类型
  resource_content?: string; // 资源内容（录音文本等）
  textbook_id: number;
  unit_id?: number; // 单元ID
  knowledge?: string; // 知识点
  // 前端扩展字段
  is_correct?: boolean; // 是否答对（答题后）
  order?: number; // 题目顺序（练习会话中）
}

// ===== 练习相关类型 =====

/**
 * 练习会话状态
 * 0: 未开始
 * 1: 进行中
 * 2: 已完成
 */
export type PracticeSessionStatus = 0 | 1 | 2;

/**
 * 练习类型
 */
export type PracticeSessionType =
  | "daily_practice"
  | "unit_practice"
  | "assessment";

/**
 * 练习会话（对应 PracticeSessionSchema）
 *
 * 注意：后端不同接口可能返回不同格式：
 * - PracticeSessionSchema: 使用 id, question_count, answer_count, correct_count
 * - PracticeStatsSchem: 使用 session_id, total_questions, completed_questions, right_questions
 *
 * 本类型兼容两种格式，前端使用时优先使用标准字段（id, question_count等）
 */
export interface PracticeSession {
  // 会话ID（兼容两种格式）
  id?: number; // 标准字段（PracticeSessionSchema）
  session_id?: number; // 兼容字段（PracticeStatsSchem），如果存在则优先使用

  student_id?: string; // 学生ID（某些接口可能不返回）
  session_type: PracticeSessionType;
  target_id?: number; // 单元ID或日期（如 20241123）
  textbook_id?: number; // 教材ID

  // 题目统计（兼容两种格式）
  question_count?: number; // 标准字段：题目总数
  answer_count?: number; // 标准字段：已答题数
  correct_count?: number; // 标准字段：正确数
  total_questions?: number; // 兼容字段：题目总数（PracticeStatsSchem）
  completed_questions?: number; // 兼容字段：已答题数（PracticeStatsSchem）
  right_questions?: number; // 兼容字段：正确数（PracticeStatsSchem）

  status: PracticeSessionStatus; // 会话状态：0-未开始, 1-进行中, 2-已完成
  generate_status?: number; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
  start_time?: number; // 开始时间（Unix时间戳，秒）
  end_time?: number; // 结束时间（Unix时间戳，秒）
  create_time?: number; // 创建时间（Unix时间戳，秒）
  update_time?: number; // 更新时间（Unix时间戳，秒）

  // 扩展字段（某些接口返回时包含）
  questions?: Question[]; // 题目列表
  times?: number; // 练习次数（PracticeStatsSchem）
}

/**
 * 练习统计（对应 PracticeStatsSchem）
 * 用于返回练习的基本统计信息
 *
 * 注意：这个类型对应后端 PracticeStatsSchem，字段名与 PracticeSession 不同
 */
export interface PracticeStats {
  session_id: number; // 会话ID
  status: PracticeSessionStatus; // 会话状态
  total_questions: number; // 题目总数
  completed_questions: number; // 已答题数
  right_questions: number; // 正确数
  times: number; // 练习次数（已完成次数）
  generate_status: number; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功

  // 可选：某些接口可能返回更多信息
  question_count?: number; // 兼容字段
  answer_count?: number; // 兼容字段
  correct_count?: number; // 兼容字段
}

/**
 * 练习历史记录（对应 PracticeHistorySchema）
 */
export interface PracticeHistory {
  session_id: number;
  session_type: PracticeSessionType;
  status: PracticeSessionStatus;
  target_id?: number; // 单元ID或日期
  textbook_id?: number; // 教材ID
  question_count: number; // 题目总数
  answer_count: number; // 已答题数
  correct_count: number; // 正确数
  start_time: number; // 开始时间
  end_time?: number; // 结束时间
  create_time: number; // 创建时间
}

/**
 * 答题记录（对应 PracticeAnswerSchema）
 */
export interface PracticeAnswer {
  id: number;
  session_id: number;
  question_id: number;
  question_order: number; // 题目顺序
  text_answer?: string; // 文本答案
  status: number; // 答题状态: 0-未答, 1-正确, 2-错误
  time_spent: number; // 耗时（秒）
  submit_time?: number; // 提交时间
  audio_answer?: string; // 音频答案（base64编码，前端使用）
}

/**
 * 错题记录（对应 StudentWrongRecordSchema）
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
  analysis?: string; // 错题分析
  time_spent?: number;
  is_corrected: number; // 是否已订正：0-未订正, 1-已订正
  corrected_time: number;
  create_time: number;
  update_time: number;
}

/**
 * 练习报告（对应 PracticeReportSchema）
 */
export interface PracticeReport {
  id: number;
  session_id: number;
  student_id: string;
  total_questions: number;
  correct_questions: number;
  total_time: number; // 总耗时（秒）
  overall_score: number; // 总得分
  current_ability?: number; // 当前能力值（-3到+3，主要用于assessment）
  confidence?: number; // 置信度
  ability_level?: string; // 能力等级
  percentile?: number; // 百分位排名
  knowledge_scores?: string; // 知识点掌握情况（JSON字符串）
  question_distribution?: string; // 题目来源分布（JSON字符串）
  ability_breakdown?: string; // 能力分解（JSON字符串）
  learning_speed?: number; // 学习速度
  consistency?: number; // 稳定性
  strengths?: string; // 优势（JSON数组字符串）
  weaknesses?: string; // 薄弱点（JSON数组字符串）
  recommendations?: string; // 学习建议（JSON数组字符串）
  create_time: number;
}

// ===== API 请求/响应类型 =====

/**
 * 登录请求参数（对应 LoginSchema）
 */
export interface LoginParams {
  phone: string;
  password: string;
}

/**
 * 检查登录状态响应
 */
export interface CheckAuthResponse {
  student: Student;
  textbook?: Textbook;
}

/**
 * 提交答案请求参数（对应 AnswerQuestionSchema）
 */
export interface SubmitAnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent: number; // 答题耗时（秒）
  is_audio_answer?: boolean; // 是否为音频回答
  audio_data?: string; // 音频数据（base64编码字符串）
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
    status: PracticeSessionStatus;
  };
}

/**
 * 开始练习响应
 */
export interface BeginPracticeResponse {
  session_id: number;
  status: PracticeSessionStatus;
  session_type: PracticeSessionType;
  target_id?: number;
  textbook_id?: number;
  question_count: number;
  answer_count: number;
  correct_count: number;
  generate_status?: number; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
  start_time: number;
  create_time: number;
}

/**
 * 完成练习响应
 */
export interface CompletePracticeResponse {
  report_id: number;
}

// ===== 单元练习状态（字典类型） =====
/**
 * 单元练习状态映射
 * key: unit_id (string)
 * value: PracticeStats | null
 */
export type UnitPracticeStatus = Record<string, PracticeStats | null>;

// ===== 工具函数 =====

/**
 * 将 PracticeStats 转换为 PracticeSession
 * 用于统一处理不同格式的返回数据
 */
export function practiceStatsToSession(
  stats: PracticeStats,
  sessionType: PracticeSessionType,
  targetId?: number,
  textbookId?: number
): PracticeSession {
  return {
    id: stats.session_id,
    session_id: stats.session_id,
    session_type: sessionType,
    target_id: targetId,
    textbook_id: textbookId,
    question_count: stats.total_questions,
    answer_count: stats.completed_questions,
    correct_count: stats.right_questions,
    total_questions: stats.total_questions,
    completed_questions: stats.completed_questions,
    right_questions: stats.right_questions,
    status: stats.status,
    times: stats.times,
  };
}

/**
 * 获取 PracticeSession 的标准字段值（兼容两种格式）
 */
export function getSessionId(session: PracticeSession): number {
  return session.session_id ?? session.id ?? 0;
}

export function getQuestionCount(session: PracticeSession): number {
  return session.question_count ?? session.total_questions ?? 0;
}

export function getAnswerCount(session: PracticeSession): number {
  return session.answer_count ?? session.completed_questions ?? 0;
}

export function getCorrectCount(session: PracticeSession): number {
  return session.correct_count ?? session.right_questions ?? 0;
}
