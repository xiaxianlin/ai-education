import { BaseEntity, Subject, Grade, Semester, Difficulty, ResourceType, QuestionType } from './common';

// ===== 教材相关 =====

/**
 * 教材信息
 */
export interface Textbook extends BaseEntity {
  id: number;
  subject: Subject;
  version: string; // 如：人教版、苏教版等
  grade: Grade;
  semester: Semester;
  title?: string;
  file?: string; // PDF 文件路径
  index_file_id?: string; // 索引文件ID
  is_parsed: boolean; // 是否已解析
  cover_image?: string; // 封面图片
  description?: string; // 教材描述
  publisher?: string; // 出版社
  publish_year?: number; // 出版年份
  active?: boolean; // 是否激活（学生端可见）
}

/**
 * 单元信息
 */
export interface Unit extends BaseEntity {
  id: number;
  textbook_id: number;
  name: string;
  content: string;
  order: number;
  textbook?: Textbook;
  knowledges?: Knowledge[];
}

/**
 * 知识点信息
 */
export interface Knowledge extends BaseEntity {
  id: number;
  textbook_id: number;
  unit_id: number;
  name: string;
  content: string;
  difficulty?: Difficulty;
  importance: number; // 重要性 1-10
  order: number;
  parent_id?: number; // 父知识点ID
  level: number; // 知识点层级
  tags?: string[]; // 标签
  textbook?: Textbook;
  unit?: Unit;
  children?: Knowledge[]; // 子知识点
}

// ===== 题目相关 =====

/**
 * 题目信息
 */
export interface Question extends BaseEntity {
  id: number;
  type: QuestionType; // 题目类型
  subtype?: string; // 题目子类型
  subject: Subject;
  grade: Grade;
  content: string; // 题目内容（支持Markdown）
  options?: string[]; // 选项（选择题使用）
  answer?: string | string[]; // 答案
  explanation?: string; // 解析
  resource?: string; // 资源文件路径（图片/音频等）
  resource_type?: ResourceType; // 资源类型
  resource_content?: string; // 资源内容描述
  difficulty?: Difficulty;
  points?: number; // 分值
  estimated_time?: number; // 预估答题时间（秒）
  tags?: string[]; // 题目标签

  // 关联信息
  textbook_id: number;
  unit_id?: number;
  knowledge_ids?: number[]; // 关联的知识点ID数组
  knowledge_names?: string[]; // 知识点名称（便于前端显示）

  // 扩展字段（前端使用）
  is_correct?: boolean; // 是否答对（答题后）
  order?: number; // 题目顺序（练习会话中）
  user_answer?: string; // 用户答案
  time_spent?: number; // 答题耗时
}

/**
 * 题目选项（专门用于选择题）
 */
export interface QuestionOption {
  id: string;
  label: string; // A, B, C, D
  content: string;
  is_correct: boolean;
}

/**
 * 题目组（用于复合题）
 */
export interface QuestionGroup {
  id: number;
  title: string;
  description?: string;
  material?: string; // 题目材料（如阅读材料）
  questions: Question[];
  total_points: number;
}