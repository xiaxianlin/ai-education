import { STAGE_LABELS } from '@ai-education/shared-web';

/** 学段选项 */
export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
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
