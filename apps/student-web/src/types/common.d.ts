/**
 * API 相关类型定义
 * 统一管理所有 API 接口的类型
 *
 * 注意：基础数据类型定义在 schema.ts 中，这里主要定义 API 响应和请求类型
 */

// 导出统一的数据类型
declare global {
  // ===== 通用类型 =====
  interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status?: number;
  }

  interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface Profile {
    student: Student;
    textbooks: Textbook[];
  }
}
export {};
