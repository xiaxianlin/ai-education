/**
 * 通用类型定义
 * 包含 API 响应、分页、搜索等通用类型
 */

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

/**
 * 分页列表数据
 */
export interface ListData<T> {
  data?: T[];
  total?: number;
}

/**
 * 分页列表响应
 */
export interface ListResponse<T = any> {
  status?: number;
  message?: string;
  data: ListData<T>;
}

/**
 * 分页响应（另一种格式）
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
  size?: number;
  sort?: string;
  order?: string;
  keywords?: string;
}

/**
 * 配置信息
 */
export interface Configs {
  subjects: string[];
  textbook_versions: string[];
  semesters: string[];
  question_types: Record<string, string[]>;
  question_subtypes?: Record<string, string[]>;
  difficulty_levels: string[];
}

/**
 * 初始状态
 */
export interface InitialState {
  manager?: Manager;
  configs?: Configs;
}

/**
 * 用户资料
 */
export interface Profile {
  student: Student;
  textbooks: Textbook[];
}

