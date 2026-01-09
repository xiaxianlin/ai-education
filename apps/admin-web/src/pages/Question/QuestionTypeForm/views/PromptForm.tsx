import {
    ANSWER_TYPE_LABELS,
    COGNITIVE_LEVEL_LABELS,
    DIFFICULTY_LABELS,
    GRADES,
    INTERACTION_TYPE_LABELS,
    RESOURCE_TYPE_LABELS,
    STAGE_LABELS,
} from '@ai-education/shared-web';
import { ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { AbilityApi } from '../../../Ability/api';

export function PromptForm() {
  const form = Form.useFormInstance();

  const generatePromptTemplate = async () => {
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
    
    // 加载能力域名称
    let domainName = '无';
    if (values.domain_code && values.subject) {
      try {
        const domains = await AbilityApi.searchDomains({ subject: values.subject });
        const domain = domains.find((d) => d.code === values.domain_code);
        domainName = domain?.name || values.domain_code;
      } catch (error) {
        console.error('加载能力域失败:', error);
        domainName = values.domain_code || '无';
      }
    }

    // 加载原子能力名称
    let atomicNames = '无';
    if (values.ability_atomic_codes?.length && values.subject && values.domain_code && values.grades?.length) {
      try {
        const promises = (values.grades as number[]).map((grade: number) =>
          AbilityApi.searchAtomics({
            subject: values.subject,
            grade,
            domain_code: values.domain_code,
          })
        );
        const results = await Promise.all(promises);
        const allAtomics = results.flat();
        const nameMap = new Map(allAtomics.map((a) => [a.code, a.name]));
        const names = (values.ability_atomic_codes as string[])
          .map((code: string) => nameMap.get(code) || code)
          .filter(Boolean);
        atomicNames = names.length > 0 ? names.join('、') : '无';
      } catch (error) {
        console.error('加载原子能力失败:', error);
        atomicNames = (values.ability_atomic_codes as string[]).join('、') || '无';
      }
    }

    const difficulty = values.difficulty
      ? DIFFICULTY_LABELS[values.difficulty as keyof typeof DIFFICULTY_LABELS] || values.difficulty
      : '无';

    // 生成改进后的模板
    const template = `请根据题型信息和生成要求生成问题。

## 题型信息

### 基础信息
- 题型名称：${name}
- 科目：${subject}
- 适用学段：${stages}
- 适用年级：${grades}
- 题型描述：${description}

### 交互配置
- 说明：交互配置定义了学生在界面上的操作方式，包括如何选择答案、输入内容等交互行为。
- 交互类型：${interactionType}
- 交互配置：${interactionConfig}

### 资源配置
- 说明：资源配置用于生成题目所需的资源。文本类型无需生成资源内容；图片类型需要生成图片生成的 prompt 描述；音频类型需要生成用于合成音频的文本内容。
- 资源类型：${resourceType}
- 资源配置：${resourceConfig}

### 答案配置
- 说明：答案配置定义了题目的正确答案格式和判断标准。
- 答案类型：${answerType}
- 答案配置：${answerConfig}

### 认知与能力
- 认知层次：${cognitiveLevels}
- 能力域：${domainName}
- 原子能力：${atomicNames}
- 难度：${difficulty}

## 任务
- 生成严格遵循此题型的{count}道题目。
- 请确保生成的题目完全符合题型的各项配置要求。
- 仅返回 JSON 格式，按照预定义的输出模式，不要添加额外的解释或说明。

## 输出格式
{format_instructions}`;

    return template;
  };

  const handleApplyTemplate = async () => {
    try {
      const template = await generatePromptTemplate();
      form.setFieldValue('aiPrompt', template);
      message.success('模板已应用');
    } catch (error) {
      console.error('生成模板失败:', error);
      message.error('生成模板失败，请稍后重试');
    }
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
