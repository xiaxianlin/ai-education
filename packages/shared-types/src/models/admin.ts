/**
 * 管理员信息
 */
export interface Manager {
  id: string;
  username: string;
  type: number;
  status: number;
  create_time: number;
  update_time?: number;
}

/**
 * 系统配置
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
 * 创建管理员请求
 */
export interface CreateManagerRequest {
  username: string;
  type: number;
}

/**
 * 更新管理员请求
 */
export interface UpdateManagerRequest {
  type?: number;
  status?: number;
}

/**
 * 修改密码请求
 */
export interface ModifyPasswordRequest {
  origin: string;
  password: string;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  manager: Manager;
}

