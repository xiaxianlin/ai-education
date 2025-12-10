/**
 * 教材相关类型定义
 */

import type { SearchParams } from './common';

/**
 * 教材信息（对应 TextbookSchema）
 */
export interface Textbook {
  id: number;
  subject: string;
  version: string;
  grade: number;
  semester: string;
  file?: string;
  index_file_id?: string;
  is_parsed?: number; // 0-未解析, 1-已解析
  active?: number; // 是否激活（学生端）：1-激活, 0-未激活
}

/**
 * 教材搜索参数（对应 SearchTextbookSchema）
 */
export interface TextbookSearchParams extends SearchParams {
  keyword?: string;
  subject?: string;
  version?: string;
  grade?: number | string;
}

/**
 * 教材表单（对应 SaveTextbookSchema）
 */
export interface TextbookForm {
  subject: string;
  version: string;
  grade: number;
  semester: string;
}

/**
 * 教师用书信息（对应 TeacherBookSchema）
 */
export interface TeacherBook {
  id: number;
  subject: string;
  version: string;
  grade: number;
  semester: string;
  file?: string;
  index_file_id?: string;
}

/**
 * 教师用书搜索参数（对应 SearchTeacherBookSchema）
 */
export interface TeacherBookSearchParams extends SearchParams {
  keyword?: string;
  subject?: string;
  version?: string;
  grade?: number | string;
}

/**
 * 教师用书表单（对应 SaveTeacherBookSchema）
 */
export interface TeacherBookForm {
  subject: string;
  version: string;
  grade: number;
  semester: string;
}

/**
 * 单元信息（对应 UnitSchema）
 */
export interface Unit {
  id: number;
  textbook_id: number;
  name: string;
  content: string;
  textbook?: Textbook;
}

/**
 * 单元搜索参数
 */
export interface UnitSearchParams extends SearchParams {
  keyword?: string;
  textbook_id?: number;
}

/**
 * 单元表单（对应 CreateUnitSchema）
 */
export interface UnitForm {
  textbook_id: number;
  name: string;
  content: string;
}

/**
 * 单元更新表单（对应 UpdateUnitSchema）
 */
export interface UnitUpdateForm {
  name?: string;
  content?: string;
}

/**
 * 知识点信息（对应 KnowledgeSchema）
 */
export interface Knowledge {
  id: number;
  textbook_id: number;
  unit_id: number;
  name: string;
  content: string;
  difficulty?: string; // 难度：简单/普通/困难
  importance?: number; // 重要性：1-10
  order?: number; // 排序值
  textbook?: Textbook;
  unit?: Unit;
}

/**
 * 知识点搜索参数
 */
export interface KnowledgeSearchParams extends SearchParams {
  keyword?: string;
  textbook_id?: number;
  unit_id?: number;
}

/**
 * 知识点表单（对应 CreateKnowledgeSchema）
 */
export interface KnowledgeForm {
  textbook_id: number;
  unit_id: number;
  name: string;
  content: string;
  difficulty?: string;
  importance?: number;
  order?: number;
}

/**
 * 知识点更新表单（对应 UpdateKnowledgeSchema）
 */
export interface KnowledgeUpdateForm {
  name?: string;
  content?: string;
  difficulty?: string;
  importance?: number;
  order?: number;
}

/**
 * 教材内容表单
 */
export interface TextbookContentForm {
  name: string;
  content: string;
  unit_id?: number;
  textbook_id?: number;
}

