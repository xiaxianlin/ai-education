import { Drawer, Form, Input, InputNumber, Button, Space, Select } from 'antd';
import { useEffect } from 'react';
import { useConfigs } from '@/hooks/useConfigs';
import { useAntdApp } from '@/lib/antdApp';

export interface ModelConfig {
  model_provider: string;
  model_name: string;
  model_params?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
}

export default function ModelDrawer({ visible, onClose, config, onSave }: Props) {
  const { message } = useAntdApp();
  const [form] = Form.useForm();
  const { providers } = useConfigs();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(config);
    }
  }, [visible, config, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 构建模型配置对象
      const modelConfig: ModelConfig = {
        model_provider: values.model_provider,
        model_name: values.model_name,
        model_params: {
          temperature: values.temperature,
          max_tokens: values.max_tokens,
          top_p: values.top_p,
          frequency_penalty: values.frequency_penalty,
          presence_penalty: values.presence_penalty,
        },
      };

      // 移除 undefined 的参数
      if (modelConfig.model_params) {
        Object.keys(modelConfig.model_params).forEach(key => {
          if (modelConfig.model_params![key as keyof typeof modelConfig.model_params] === undefined) {
            delete modelConfig.model_params![key as keyof typeof modelConfig.model_params];
          }
        });
      }

      onSave(modelConfig);
      onClose();
      message.success('模型配置保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Drawer
      title="模型设置"
      placement="right"
      width={500}
      open={visible}
      onClose={onClose}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="model_provider"
          label="模型提供方"
          rules={[{ required: true, message: '请选择模型提供方' }]}
          tooltip="选择模型提供方"
        >
          <Select placeholder="请选择模型提供方">
            {providers.map((provider) => (
              <Select.Option key={provider} value={provider}>
                {provider}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="model_name"
          label="模型名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
          tooltip="如：qwen-plus、gpt-4o-mini、ernie-bot 等"
        >
          <Input placeholder="qwen-plus" />
        </Form.Item>

        <Form.Item label="模型参数">
          <Form.Item
            name="temperature"
            label="Temperature"
            tooltip="控制生成文本的随机性，值越高越随机，范围 0-2"
          >
            <InputNumber
              min={0}
              max={2}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="0.7"
            />
          </Form.Item>

          <Form.Item
            name="max_tokens"
            label="Max Tokens"
            tooltip="生成文本的最大长度"
          >
            <InputNumber
              min={1}
              max={4096}
              style={{ width: '100%' }}
              placeholder="1000"
            />
          </Form.Item>

          <Form.Item
            name="top_p"
            label="Top P"
            tooltip="核采样参数，控制生成词汇的多样性，范围 0-1"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="0.9"
            />
          </Form.Item>

          <Form.Item
            name="frequency_penalty"
            label="Frequency Penalty"
            tooltip="频率惩罚，减少重复词汇，范围 -2 到 2"
          >
            <InputNumber
              min={-2}
              max={2}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            name="presence_penalty"
            label="Presence Penalty"
            tooltip="存在惩罚，鼓励谈论新话题，范围 -2 到 2"
          >
            <InputNumber
              min={-2}
              max={2}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
