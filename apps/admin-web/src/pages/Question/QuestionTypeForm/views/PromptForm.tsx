import {
  ABILITY_TYPE_MAP,
  ANSWER_TYPE_LABELS,
  COGNITIVE_LEVEL_LABELS,
  DIFFICULTY_LABELS,
  GRADES,
  INTERACTION_TYPE_LABELS,
  RESOURCE_TYPE_LABELS,
  STAGE_LABELS,
} from '@ai-education/shared-web';
import { ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form } from 'antd';

export function PromptForm() {
  const form = Form.useFormInstance();

  const generatePromptTemplate = () => {
    const values = form.getFieldsValue();

    // 格式化基础信息
    const name = values.name || '';
    const subject = values.subject || '';
    const stages =
      (values.stages || [])
        .map((stage: string) => STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage)
        .join('、') || '无';
    const grades = (values.grades || []).map((grade: number) => GRADES[grade] || `${grade}年级`).join('、') || '无';
    const description = values.description || '无';

    // 格式化交互配置
    const interactionType = values.interactionType
      ? INTERACTION_TYPE_LABELS[values.interactionType as keyof typeof INTERACTION_TYPE_LABELS] ||
        values.interactionType
      : '无';
    let interactionConfig = '无';
    if (values.interactionConfig) {
      try {
        const parsed = JSON.parse(values.interactionConfig);
        if (parsed && Object.keys(parsed).length > 0) {
          interactionConfig = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // 如果解析失败，保持原值
        interactionConfig = values.interactionConfig;
      }
    }

    // 格式化资源配置
    const resourceType = values.resourceType
      ? RESOURCE_TYPE_LABELS[values.resourceType as keyof typeof RESOURCE_TYPE_LABELS] || values.resourceType
      : '文本';
    let resourceConfig = '无';
    if (values.resourceConfig) {
      try {
        const parsed = JSON.parse(values.resourceConfig);
        if (parsed && Object.keys(parsed).length > 0) {
          resourceConfig = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // 如果解析失败，保持原值
        resourceConfig = values.resourceConfig;
      }
    }

    // 格式化答案配置
    const answerType = values.answerType
      ? ANSWER_TYPE_LABELS[values.answerType as keyof typeof ANSWER_TYPE_LABELS] || values.answerType
      : '无';
    let answerConfig = '无';
    if (values.answerConfig) {
      try {
        const parsed = JSON.parse(values.answerConfig);
        if (parsed && Object.keys(parsed).length > 0) {
          answerConfig = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // 如果解析失败，保持原值
        answerConfig = values.answerConfig;
      }
    }

    // 格式化认知与能力
    const cognitiveLevels =
      (values.cognitiveLevels || [])
        .map((level: string) => COGNITIVE_LEVEL_LABELS[level as keyof typeof COGNITIVE_LEVEL_LABELS] || level)
        .join('、') || '无';
    const abilityDimensions =
      (values.abilityDimensions || [])
        .map((dim: string) => {
          const subjectMap = ABILITY_TYPE_MAP[subject as keyof typeof ABILITY_TYPE_MAP];
          return subjectMap?.[dim as keyof typeof subjectMap] || dim;
        })
        .join('、') || '无';
    const difficulty = values.difficulty
      ? DIFFICULTY_LABELS[values.difficulty as keyof typeof DIFFICULTY_LABELS] || values.difficulty
      : '无';

    // 生成模板
    const template = `请根据题型信息和生成要求生成问题。

## 题型信息

### 基础信息
- 题型名称：${name}
- 科目：${subject}
- 适用学段：${stages}
- 适用年级：${grades}
- 题型描述：${description}

### 交互配置
- 说明：交互配置是学生在界面上的操作方式
- 交互类型：${interactionType}
- 交互配置：${interactionConfig}

### 资源配置
- 说明：资源配置是根据类型去生成问题对于的资源，文本不需要生成资源内容，图片需要生成图片生成的 prompt，音频需要生成合成音频的文本。
- 资源类型：${resourceType}
- 资源配置：${resourceConfig}

### 答案配置
- 答案类型：${answerType}
- 答案配置：${answerConfig}

###认知与能力
- 认知层次：${cognitiveLevels}
- 能力维度：${abilityDimensions}
- 难度：${difficulty}

## 任务
- 生成严格遵循此题型的{count}题目。
- 请不要生成超出必填字段的解释。
- 仅返回 JSON，按照预定义的输出模式。

## 输出格式
{format_instructions}`;

    return template;
  };

  const handleApplyTemplate = () => {
    const template = generatePromptTemplate();
    form.setFieldValue('aiPrompt', template);
  };

  return (
    <ProFormTextArea
      name="aiPrompt"
      label="AI 生成指令"
      placeholder="用于生成该题型题目的 AI 指令"
      fieldProps={{ rows: 26 }}
      extra={
        <Button type="link" size="small" onClick={handleApplyTemplate}>
          应用模板
        </Button>
      }
    />
  );
}
