/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

/**
 * 列表响应类型
 */
export interface ListResponse<T> {
  total: number;
  data: T[];
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  keywords?: string;
}

/**
 * 通用搜索参数
 */
export interface SearchParams extends PaginationParams {
  [key: string]: any;
}

