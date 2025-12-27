import {
  STAGE_LABELS,
  INTERACTION_TYPE_LABELS,
  RESOURCE_TYPE_LABELS,
  ANSWER_TYPE_LABELS,
  COGNITIVE_LEVEL_LABELS,
} from '@ai-education/shared-web';

/** 学段选项 */
export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** 交互类型选项 */
export const INTERACTION_OPTIONS = Object.entries(INTERACTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** 资源类型选项 */
export const RESOURCE_OPTIONS = Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** 答案类型选项 */
export const ANSWER_OPTIONS = Object.entries(ANSWER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** 认知层次选项 */
export const COGNITIVE_OPTIONS = Object.entries(COGNITIVE_LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** 反馈配置示例 */
export const FEEDBACK_CONFIG_EXAMPLE = {
  correct: { messages: ['真棒！'], sound: 'success.mp3' },
  incorrect: { messages: ['再想想~'], showHint: true },
};

/** 变量定义示例 */
export const VARIABLES_EXAMPLE = {
  topic: { type: 'string', label: '主题', default: '天气' },
  count: { type: 'number', label: '题目数量', default: 5 },
};

/** 输出结构示例 */
export const OUTPUT_SCHEMA_EXAMPLE = {
  type: 'object',
  properties: {
    stem: { type: 'string', description: '题干' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          isCorrect: { type: 'boolean' },
        },
      },
    },
  },
};
