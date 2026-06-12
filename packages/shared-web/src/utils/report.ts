/**
 * 练习报告相关工具函数
 * 用于在前端解析后端 JSON 字符串字段为结构化数据
 */

/** 安全解析 JSON 字符串，失败时返回 fallback */
export function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 解析后的报告类型，AI 字段为结构化数据 */
export interface ParsedReport
  extends Omit<
    PracticeReport,
    'strengths' | 'weaknesses' | 'recommendations' | 'ability_breakdown' | 'question_distribution' | 'knowledge_scores'
  > {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  ability_breakdown: Record<string, unknown>;
  question_distribution: Record<string, unknown>;
  knowledge_scores: Record<string, unknown>;
}

/** 解析报告中的 JSON 字符串字段 */
export function parseReport(report?: PracticeReport): ParsedReport | undefined {
  if (!report) return undefined;
  return {
    ...report,
    strengths: safeParseJSON<string[]>(report.strengths, []),
    weaknesses: safeParseJSON<string[]>(report.weaknesses, []),
    recommendations: safeParseJSON<string[]>(report.recommendations, []),
    ability_breakdown: safeParseJSON<Record<string, unknown>>(report.ability_breakdown, {}),
    question_distribution: safeParseJSON<Record<string, unknown>>(report.question_distribution, {}),
    knowledge_scores: safeParseJSON<Record<string, unknown>>(report.knowledge_scores, {}),
  };
}

/** 判断 AI 报告是否可用 */
export function hasAIReportContent(report?: ParsedReport): boolean {
  if (!report) return false;
  return report.strengths.length > 0 || report.weaknesses.length > 0 || report.recommendations.length > 0;
}
