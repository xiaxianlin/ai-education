// 导出所有类型定义

// 通用类型
export * from './common';

// 用户相关类型
export * from './user';

// 教育内容类型
export * from './education';

// 练习相关类型
export * from './practice';

// 媒体文件类型
export * from './media';

// ===== 类型别名和工具类型 =====

/**
 * 用户角色类型
 */
export type UserRole = 'admin' | 'student' | 'teacher';

/**
 * API 端点路径类型
 */
export type ApiEndpoint =
  | '/auth/login'
  | '/auth/logout'
  | '/student/profile'
  | '/textbooks'
  | '/textbooks/:id'
  | '/textbooks/:id/units'
  | '/units/:id/knowledges'
  | '/practices'
  | '/practices/:id'
  | '/practices/:id/answer'
  | '/practices/:id/complete'
  | '/questions'
  | '/questions/:id'
  | '/upload/audio'
  | '/upload/image';

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 分页参数类型
 */
export type PaginationParams = {
  page: number;
  pageSize: number;
};

/**
 * 时间戳类型
 */
export type Timestamp = number;

/**
 * ID 类型
 */
export type ID = string | number;

/**
 * 可选字段类型（将 T 的所有字段变为可选）
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 必需字段类型（将 T 的指定字段变为必需）
 */
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

/**
 * 选择字段类型（只保留 T 的指定字段）
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * 排除字段类型（排除 T 的指定字段）
 */
export type Omit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};