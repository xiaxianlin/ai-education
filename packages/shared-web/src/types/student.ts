/**
 * 学生相关类型定义
 */

import type { SearchParams } from './common';

/**
 * 学生信息（对应 StudentSchema）
 */
export interface Student {
  id: string;
  name: string;
  phone: string;
  grade: number;
  status: number; // 0-正常, 1-禁用
  create_time: number;
  update_time?: number;
}

/**
 * 学生表单（对应 CreateStudentSchema）
 */
export interface StudentForm {
  name?: string;
  phone?: string;
  grade?: number;
  status?: number;
}

/**
 * 学生搜索参数（对应 SearchStudentSchema）
 */
export interface StudentSearchParams extends SearchParams {
  keyword?: string;
  phone?: string;
  status?: number;
}

/**
 * 重置密码响应
 */
export interface ResetPasswordResponse {
  password: string;
}

/**
 * 保存学生科目表单（对应 SaveStudentSubjectSchema）
 */
export interface SaveStudentSubjectSchema {
  ids: number[];
}

