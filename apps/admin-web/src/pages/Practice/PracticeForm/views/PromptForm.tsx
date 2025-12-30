import { ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, message, Modal, Space } from 'antd';
import { useCallback } from 'react';

/**
 * 提取提示词模板中的占位参数
 * 支持格式：{param}
 */
function extractParameters(prompt: string): string[] {
  if (!prompt) return [];

  const parameters = new Set<string>();
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(prompt)) !== null) {
    const param = match[1].trim();
    if (param) {
      parameters.add(param);
    }
  }

  return Array.from(parameters);
}

export function PromptForm() {
  const form = Form.useFormInstance();

  const handleExtractParameters = useCallback(() => {
    const prompt = form.getFieldValue('prompt');
    if (!prompt) {
      message.warning('请先输入提示词模板');
      return;
    }

    const extractedParams = extractParameters(prompt);
    if (extractedParams.length === 0) {
      message.info('未找到占位参数');
      return;
    }

    // 获取现有的参数配置
    const existingConfig = form.getFieldValue('parameter_config') || [];
    const existingKeys = new Set(existingConfig.map((item: any) => item?.key).filter(Boolean));

    // 创建新参数配置（只添加不存在的参数）
    const newParams = extractedParams
      .filter((key) => !existingKeys.has(key))
      .map((key) => ({
        key,
        description: '',
        value_type: 'string' as const,
        required: true,
      }));

    if (newParams.length === 0) {
      message.info('所有参数已存在');
      return;
    }

    // 显示确认弹窗
    Modal.confirm({
      title: '提取参数',
      content: `已提取 ${newParams.length} 个参数：${newParams.map((p) => p.key).join('、')}，是否添加到参数配置？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 合并到现有配置
        const updatedConfig = [...existingConfig, ...newParams];
        form.setFieldValue('parameter_config', updatedConfig);
        message.success(`已添加 ${newParams.length} 个参数`);
      },
    });
  }, [form]);

  return (
    <>
      <ProFormTextArea
        name="prompt"
        placeholder="请输入提示词模板内容"
        fieldProps={{ rows: 26 }}
        rules={[{ required: true, message: '请输入提示词模板内容' }]}
        extra={
          <Space>
            <Button type="link" size="small" onClick={handleExtractParameters}>
              提取参数
            </Button>
            <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}>支持格式：{'{param}'}</span>
          </Space>
        }
      />
    </>
  );
}
