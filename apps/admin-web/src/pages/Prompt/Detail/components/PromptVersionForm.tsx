import { FormInstance, Form, InputNumber } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { VersionFormValues } from '../../types';

type Props = {
  form: FormInstance<VersionFormValues>;
};

const jsonValidator = async (_: any, value: string) => {
  if (!value) return Promise.resolve();
  try {
    JSON.parse(value);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(new Error('请输入合法的 JSON 字符串'));
  }
};

export function PromptVersionForm({ form }: Props) {
  return (
    <Form layout="vertical" form={form}>
      <Form.Item label="Template" name="template" rules={[{ required: true, message: '请输入模板内容' }]}>
        <TextArea rows={6} placeholder="使用 {variable} 进行占位" />
      </Form.Item>
      <Form.Item label="System Prompt" name="system_prompt">
        <TextArea rows={3} placeholder="可选" />
      </Form.Item>
      <Form.Item label="Negative Prompt" name="negative_prompt">
        <TextArea rows={3} placeholder="可选（主要用于绘图）" />
      </Form.Item>
      <Form.Item
        label="Input Schema (JSON)"
        name="input_schema"
        rules={[{ validator: jsonValidator }]}
        tooltip="定义输入变量的结构，用于自动校验"
      >
        <TextArea rows={4} placeholder='例如 {"required":["subject","grade"], "properties": {...}}' />
      </Form.Item>
      <Form.Item
        label="Sampling Params (JSON)"
        name="sampling_params"
        rules={[{ validator: jsonValidator }]}
        tooltip="模型采样参数，如 temperature, top_p 等"
      >
        <TextArea rows={3} placeholder='例如 {"temperature": 0.7}' />
      </Form.Item>
      <Form.Item label="Timeout (ms)" name="timeout_ms">
        <InputNumber style={{ width: '100%' }} placeholder="超时时间（毫秒）" />
      </Form.Item>
      <Form.Item label="变更说明" name="changelog">
        <TextArea rows={2} placeholder="描述本次版本的变更内容" />
      </Form.Item>
    </Form>
  );
}
