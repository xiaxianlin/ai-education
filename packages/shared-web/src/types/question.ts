/**
 * 题目相关类型定义
 */

import type { SearchParams } from './common';
import type { Textbook, Unit } from './textbook';

/**
 * 题目信息（对应 QuestionSchema）
 */
export interface Question {
  id: string | number;
  type: string; // 题目类型（主类型）
  subtype?: string; // 题目子类型
  subject: string; // 科目
  grade: number; // 年级
  content: string; // 题目内容
  options?: string; // 选项（多行文本）
  answer?: string; // 答案
  resource?: string; // 资源路径（图片/音频URL）
  difficulty?: string; // 难度
  resource_type?: 'image' | 'audio' | string | null; // 资源类型
  resource_content?: string; // 资源内容（录音文本等）
  textbook_id?: number;
  unit_id?: number; // 单元ID
  knowledge?: string; // 知识点
  // 前端扩展字段
  is_correct?: boolean; // 是否答对（答题后）
  order?: number; // 题目顺序（练习会话中）
  textbook?: Textbook;
  unit?: Unit;
}

/**
 * 题目创建表单（对应 CreateQuestionSchema）
 */
export interface QuestionCreateSchema {
  subject: string;
  grade: number;
  type: string;
  content: string;
  options?: string;
  answer?: string;
  resource?: string;
  difficulty?: string;
  knowledge_id?: number;
  unit_id?: number;
  textbook_id?: number;
}

/**
 * 题目更新表单（对应 UpdateQuestionSchema）
 */
export interface QuestionUpdateForm {
  subject?: string;
  grade?: number;
  type?: string;
  subtype?: string;
  content?: string;
  options?: string | string[];
  answer?: string;
  resource?: string;
  resource_type?: string;
  resource_content?: string;
  difficulty?: string;
  knowledge?: string;
  unit_id?: number;
  textbook_id?: number;
}

/**
 * 题目搜索参数（对应 SearchQuestionSchema）
 */
export interface QuestionSearchParams extends SearchParams {
  question_id?: number;
  keyword?: string;
  textbook_id?: number;
  unit_id?: number;
  type?: string;
  subtype?: string;
  difficulty?: string;
  subject?: string;
  grade?: number;
  resource_type?: string;
  resource_generated?: boolean;
}

