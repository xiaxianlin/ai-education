import { BaseEntity, Status, Grade } from './common';
import { Textbook } from './education';
import { PracticeSession } from './practice';

// ===== 学生统计数据 =====

/**
 * 学生统计数据
 */
export interface StudentStatistics {
  total_practices: number;
  total_questions: number;
  correct_rate: number;
  average_time: number;
  strength_knowledges: string[];
  weak_knowledges: string[];
}

// ===== 管理员相关 =====

/**
 * 管理员信息
 */
export interface Admin extends BaseEntity {
  id: string;
  username: string;
  password?: string; // 敏感信息，通常不返回
  type: number; // 0-超级管理员, 1-普通管理员
  status: Status;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * 登录请求参数
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
  user: Admin;
}

// ===== 学生相关 =====

/**
 * 学生信息
 */
export interface Student extends BaseEntity {
  id: string;
  name: string;
  phone: string;
  grade: Grade;
  status: Status;
  avatar?: string;
  parent_phone?: string;
  address?: string;
}

/**
 * 学生登录请求
 */
export interface StudentLoginRequest {
  phone: string;
  password: string;
}

/**
 * 学生登录响应
 */
export interface StudentLoginResponse {
  token: string;
  student: Student;
}

/**
 * 学生档案
 */
export interface StudentProfile {
  student: Student;
  textbooks: Textbook[];
  recent_practices: PracticeSession[];
  statistics: StudentStatistics;
}

/**
 * 学生统计数据
 */
export interface StudentStatistics {
  total_practices: number;
  total_questions: number;
  correct_rate: number;
  average_time: number;
  strength_knowledges: string[];
  weak_knowledges: string[];
}