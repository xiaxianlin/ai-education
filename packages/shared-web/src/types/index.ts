/**
 * 统一类型导出
 * 注意：大部分类型通过 global.d.ts 声明为全局，这里不再需要显式导出
 * 但为了支持显式导入，这里也导出常用类型别名
 */

import "./global.d.ts";

// 重新导出全局类型，以便支持显式导入
// 这些类型在 global.d.ts 中已声明为全局，这里提供类型别名以便 IDE 支持
export type Stem = globalThis.Stem;
export type QuestionResource = globalThis.QuestionResource;
export type Question = globalThis.Question;
export type QuestionOption = globalThis.QuestionOption;
export type SubQuestion = globalThis.SubQuestion;
export type Practice = globalThis.Practice;
export type PracticeAnswer = globalThis.PracticeAnswer;
export type PracticeReport = globalThis.PracticeReport;
export type PracticeData = globalThis.PracticeData;
