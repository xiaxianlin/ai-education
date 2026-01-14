import { ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

export function PromptForm() {
  const form = Form.useFormInstance();

  const generatePromptTemplate = async () => {
    const values = form.getFieldsValue();

    // 格式化基础信息
    const name = values.name || '';
    const subject = values.subject || '';
    const category = values.category === 'ability_practice' ? '能力练习' : '单元练习';
    const gradeBands: Record<string, string> = { Low: '低年级 (1-3)', Mid: '中年级 (4-6)', High: '高年级 (7-12)' };
    const gradeBand =
      values.gradeBand && gradeBands[values.gradeBand as string]
        ? gradeBands[values.gradeBand as string]
        : values.gradeBand || '无';
    const abilityCode = values.abilityCode || '无';
    const description = values.description || '无';

    // 格式化配置字段
    let mediaContext = '无';
    if (values.mediaContext) {
      try {
        const parsed = JSON.parse(values.mediaContext);
        if (parsed && Object.keys(parsed).length > 0) {
          mediaContext = JSON.stringify(parsed, null, 2);
        }
      } catch {
        mediaContext = values.mediaContext;
      }
    }

    let scaffoldingConfig = '无';
    if (values.scaffoldingConfig) {
      try {
        const parsed = JSON.parse(values.scaffoldingConfig);
        if (parsed && Object.keys(parsed).length > 0) {
          scaffoldingConfig = JSON.stringify(parsed, null, 2);
        }
      } catch {
        scaffoldingConfig = values.scaffoldingConfig;
      }
    }

    let evaluationConfig = '无';
    if (values.evaluationConfig) {
      try {
        const parsed = JSON.parse(values.evaluationConfig);
        if (parsed && Object.keys(parsed).length > 0) {
          evaluationConfig = JSON.stringify(parsed, null, 2);
        }
      } catch {
        evaluationConfig = values.evaluationConfig;
      }
    }

    // 生成改进后的模板
    const template = `请根据题型信息和生成要求生成问题。

## 题型信息

### 基础信息
- 题型名称：${name}
- 科目：${subject}
- 题型分类：${category}
- 学段：${gradeBand}
- 能力代码：${abilityCode}
- 题型描述：${description}

### 媒体配置 (media_context)
- 说明：定义支持的媒体类型(文本/图片/音视频)及其配置
- 配置：${mediaContext}

### 脚手架配置 (scaffolding_config)
- 说明：定义脚手架模式(单/多选)与交互工具(提示/模板)
- 配置：${scaffoldingConfig}

### 评估配置 (evaluation_config)
- 说明：聚合评估模式(auto_match/ai_analysis)、正确答案参考及评分量表
- 配置：${evaluationConfig}

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
      form.setFieldValue('prompt', template);
      message.success('模板已应用');
    } catch (error) {
      console.error('生成模板失败:', error);
      message.error('生成模板失败，请稍后重试');
    }
  };

  return (
    <ProFormTextArea
      name="prompt"
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
