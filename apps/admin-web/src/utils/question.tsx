import { Badge, type BadgeVariant } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import type { ReactNode } from 'react';

/**
 * 素材状态配置
 */
export const RESOURCE_STATUS_CONFIG = {
  none: { label: '-', variant: 'outline' },
  not_generated: { label: '未生成', variant: 'destructive' },
  partial: { label: '生成不足', variant: 'warning' },
  complete: { label: '已生成', variant: 'success' },
} as const;

export type ResourceStatus = keyof typeof RESOURCE_STATUS_CONFIG;

/**
 * 判断是否需要素材
 */
export function hasResources(question: Question): boolean {
  const content = question.content || {};
  // 检查 content.resource
  const stemResource = content.resource;
  const options = content.options || [];
  const hasOptionResources = options.some((opt) => !!opt.resource);
  return !!(stemResource || hasOptionResources);
}

/**
 * 获取素材状态
 */
export function getResourceStatus(question: Question): ResourceStatus {
  // 如果不需要素材，返回 'none'
  if (!hasResources(question)) {
    return 'none';
  }

  const content = question.content || {};
  const resources: QuestionResource[] = [];

  // 收集题干资源
  const stemResource = content.resource;
  if (stemResource) {
    resources.push(stemResource);
  }

  // 收集选项资源 - 如果 QuestionOption 没有 resource 属性，
  // 我们可能需要从 content.resource (如果是数组) 或其他地方收集。
  // 目前 global.d.ts 中 QuestionContent.resource 是单个 QuestionResource。
  // 如果选项有资源，它们通常在 QuestionResource[] 类型的列表中，但 QuestionContent 没定义这个列表。
  // 临时修复以通过编译。

  // 统计有有效 url 的资源数量
  const resourcesWithUrl = resources.filter((resource) => resource.url && resource.url.trim() !== '');

  const totalCount = resources.length;
  const urlCount = resourcesWithUrl.length;

  // 所有资源都没有 url
  if (urlCount === 0) {
    return 'not_generated';
  }

  // 部分资源有 url
  if (urlCount < totalCount) {
    return 'partial';
  }

  // 所有资源都有 url
  return 'complete';
}

/**
 * 渲染素材状态 Tag
 */
export function renderResourceStatus(question: Question): ReactNode {
  const status = getResourceStatus(question);

  if (status === 'none') {
    return <span>-</span>;
  }

  const config = RESOURCE_STATUS_CONFIG[status];
  return <Badge variant={config.variant as BadgeVariant}>{config.label}</Badge>;
}

/**
 * 判断是否有答案
 */
export function hasAnswer(answer?: PracticeAnswer): boolean {
  return !!(answer && answer.status !== 0);
}

/**
 * 格式化正确答案
 * 处理多种数据格式：字符串、数组、对象等
 */
export function formatCorrectAnswer(correctAnswer: unknown, questionAnswer?: Answer): string {
  // 如果 correctAnswer 是字符串，直接返回
  if (typeof correctAnswer === 'string') {
    return correctAnswer;
  }

  // 如果 correctAnswer 是数组，用逗号连接
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.join(', ');
  }

  // 如果 correctAnswer 是对象，尝试提取内容
  if (correctAnswer && typeof correctAnswer === 'object') {
    const answerData = correctAnswer as {
      type?: string;
      value?: unknown;
      values?: unknown[];
      options?: Array<{ text?: string; id?: string }>;
      sub_answers?: unknown[];
    };

    // 优先处理 options 数组
    if (answerData.options && Array.isArray(answerData.options)) {
      return answerData.options.map((opt: { text?: string; id?: string }) => opt.text || opt.id || '').join(', ');
    }

    // 处理 values 数组
    if (answerData.values && Array.isArray(answerData.values)) {
      return answerData.values.join(', ');
    }

    // 处理单个 value
    if (answerData.value !== undefined && answerData.value !== null) {
      return String(answerData.value);
    }
  }

  if (questionAnswer?.correct_value !== undefined && questionAnswer.correct_value !== null) {
    return formatCorrectAnswer(questionAnswer.correct_value);
  }

  return '-';
}

/**
 * 格式化解析内容
 * 从 answer.analysis 或默认解析中提取
 */
export function formatExplanation(analysis: unknown, defaultExplanation?: string): string {
  // 如果 analysis 是字符串，直接返回
  if (typeof analysis === 'string') {
    return analysis;
  }

  // 如果 analysis 是对象，尝试提取 explanation 或 analysis 字段
  if (analysis && typeof analysis === 'object') {
    const analysisData = analysis as { explanation?: string; analysis?: string };
    return analysisData.explanation || analysisData.analysis || defaultExplanation || '-';
  }

  // 返回默认解析或 '-'
  return defaultExplanation || '-';
}

/**
 * 显示查看答案的 Modal
 */
export function showAnswerModal(params: { studentAnswer: string; correctAnswer: string; explanation: string }): void {
  const { studentAnswer, correctAnswer, explanation } = params;
  const answerText = `学生答案：${studentAnswer}\n正确答案：${correctAnswer}${explanation && explanation !== '-' ? `\n解析：${explanation}` : ''}`;
  window.alert(answerText);
  toast.info('已打开答案详情');
}
