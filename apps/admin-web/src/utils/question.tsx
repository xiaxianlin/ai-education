import { Modal, Tag, Typography } from 'antd';
import { ReactNode } from 'react';

/**
 * 素材状态配置
 */
export const RESOURCE_STATUS_CONFIG = {
  none: { label: '-', color: 'default' },
  not_generated: { label: '未生成', color: 'red' },
  partial: { label: '生成不足', color: 'orange' },
  complete: { label: '已生成', color: 'green' },
} as const;

export type ResourceStatus = keyof typeof RESOURCE_STATUS_CONFIG;

/**
 * 判断是否需要素材
 */
export function hasResources(question: Question): boolean {
  return !!(question.resources && question.resources.length > 0);
}

/**
 * 获取素材状态
 */
export function getResourceStatus(question: Question): ResourceStatus {
  // 如果不需要素材，返回 'none'
  if (!hasResources(question)) {
    return 'none';
  }

  const resources = question.resources!;
  // 统计有有效 url 的资源数量
  const resourcesWithUrl = resources.filter(
    (resource) => resource.url && resource.url.trim() !== '',
  );

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
  return <Tag color={config.color}>{config.label}</Tag>;
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
export function formatCorrectAnswer(
  correctAnswer: unknown,
  questionAnswer?: Answer,
): string {
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
      return answerData.options
        .map((opt: { text?: string; id?: string }) => opt.text || opt.id || '')
        .join(', ');
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

  // 如果都没有，尝试从 questionAnswer 中获取
  if (questionAnswer?.correct_answers) {
    if (Array.isArray(questionAnswer.correct_answers)) {
      return questionAnswer.correct_answers.join(', ');
    }
  }

  return '-';
}

/**
 * 格式化解析内容
 * 从 answer.analysis 或默认解析中提取
 */
export function formatExplanation(
  analysis: unknown,
  defaultExplanation?: string,
): string {
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
export function showAnswerModal(params: {
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
}): void {
  const { studentAnswer, correctAnswer, explanation } = params;

  Modal.info({
    title: '查看答案',
    width: 600,
    content: (
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            学生答案：
          </Typography.Text>
          <Typography.Text>{studentAnswer}</Typography.Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            正确答案：
          </Typography.Text>
          <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
            {correctAnswer}
          </Tag>
        </div>
        {explanation && explanation !== '-' && (
          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              解析：
            </Typography.Text>
            <Typography.Text>{explanation}</Typography.Text>
          </div>
        )}
      </div>
    ),
  });
}
