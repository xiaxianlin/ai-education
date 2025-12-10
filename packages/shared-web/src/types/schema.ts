/**
 * 基础数据类型定义
 * 
 * 注意：这些类型已迁移到对应的模块化文件中：
 * - Student -> student.ts
 * - Textbook, Unit, Knowledge -> textbook.ts
 * - Question -> question.ts
 * 
 * 此文件保留用于向后兼容，建议直接使用模块化文件中的类型
 */

// 重新导出，保持向后兼容
export type { Student } from './student';
export type { Textbook, Unit, Knowledge } from './textbook';
export type { Question } from './question';

