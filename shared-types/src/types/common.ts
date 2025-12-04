// ===== 通用类型定义 =====

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 搜索参数
 */
export interface SearchParams {
  page?: number;
  pageSize?: number;
  keywords?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 搜索结果
 */
export interface SearchResult<T> {
  total: number;
  data: T[];
}

/**
 * 基础实体接口
 */
export interface BaseEntity {
  create_time: number;
  update_time?: number;
}

/**
 * 状态枚举
 */
export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 1,
  FEMALE = 2,
}

/**
 * 科目枚举
 */
export enum Subject {
  MATH = '数学',
  ENGLISH = '英语',
  CHINESE = '语文',
  PHYSICS = '物理',
  CHEMISTRY = '化学',
  BIOLOGY = '生物',
  HISTORY = '历史',
  GEOGRAPHY = '地理',
  POLITICS = '政治',
}

/**
 * 年级枚举
 */
export enum Grade {
  GRADE_1 = 1,
  GRADE_2 = 2,
  GRADE_3 = 3,
  GRADE_4 = 4,
  GRADE_5 = 5,
  GRADE_6 = 6,
  GRADE_7 = 7,
  GRADE_8 = 8,
  GRADE_9 = 9,
  GRADE_10 = 10,
  GRADE_11 = 11,
  GRADE_12 = 12,
}

/**
 * 学期枚举
 */
export enum Semester {
  FIRST = '上学期',
  SECOND = '下学期',
  FULL = '整学期',
}

/**
 * 题目类型枚举
 */
export enum QuestionType {
  MULTIPLE_CHOICE = '选择题',
  TRUE_FALSE = '判断题',
  FILL_BLANK = '填空题',
  SHORT_ANSWER = '简答题',
  ESSAY = '论述题',
  CALCULATION = '计算题',
  READING = '阅读理解',
  LISTENING = '听力题',
  SPEAKING = '口语题',
}

/**
 * 题目难度枚举
 */
export enum Difficulty {
  EASY = '简单',
  MEDIUM = '普通',
  HARD = '困难',
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

/**
 * 练习类型枚举
 */
export enum PracticeType {
  DAILY = 'daily_practice',
  UNIT = 'unit_practice',
  ASSESSMENT = 'assessment',
}

/**
 * 练习会话状态枚举
 */
export enum PracticeSessionStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

/**
 * 练习生成状态枚举
 */
export enum PracticeGenerateStatus {
  FAILED = -1,
  GENERATING = 0,
  SUCCESS = 1,
}

/**
 * 答题状态枚举
 */
export enum AnswerStatus {
  UNANSWERED = 0,
  CORRECT = 1,
  INCORRECT = 2,
}