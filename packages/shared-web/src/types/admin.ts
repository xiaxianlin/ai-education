/**
 * 管理端相关类型定义
 */

/**
 * 管理员类型枚举
 */
export enum ManagerType {
  Init = 0,
  System = 1,
  Audit = 2,
  Data = 3,
}

/**
 * 管理员信息（对应 ManagerSchema）
 */
export interface Manager {
  id: string;
  username: string;
  type: ManagerType | number;
  status: number; // 0-停用, 1-启用
  create_time: number;
  update_time?: number;
}

/**
 * 创建管理员模型（对应 CreateManangeSchema）
 */
export interface CreateManagerModel {
  username: string;
  password?: string; // 后端生成，前端可能不需要
  type: number;
}

/**
 * 登录模型（对应 LoginSchema）
 */
export interface LoginModel {
  username?: string;
  password?: string;
}

/**
 * 修改密码模型（对应 ModifyPasswordSchema）
 */
export interface ModifyPasswordModel {
  old_password?: string;
  origin?: string; // 后端使用 origin
  new_password?: string;
  password?: string; // 后端使用 password
}

