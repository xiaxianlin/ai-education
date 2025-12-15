import { FormInstance, Button, Form, Input, InputNumber } from 'antd';
import TextArea from 'antd/es/input/TextArea';

type VersionFormValues = {
  template: string;
  system_prompt?: string;
  negative_prompt?: string;
  input_schema?: string;
  sampling_params?: string;
  timeout_ms?: number;
  changelog?: string;
};

type Props = {
  form: FormInstance<VersionFormValues>;
};

export function PromptVersionForm({ form }: Props) {
  return (
    <Form layout="vertical" form={form}>
      <Form.Item label="Template" name="template" rules={[{ required: true }]}>
        <TextArea rows={6} placeholder="使用 {variable} 进行占位" />
      </Form.Item>
      <Form.Item label="System Prompt" name="system_prompt">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Negative Prompt" name="negative_prompt">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Input Schema (JSON)" name="input_schema">
        <TextArea rows={4} placeholder='例如 {"required":["subject","grade"]}' />
      </Form.Item>
      <Form.Item label="Sampling Params (JSON)" name="sampling_params">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Timeout (ms)" name="timeout_ms">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="变更说明" name="changelog">
        <TextArea rows={2} />
      </Form.Item>
    </Form>
  );
}

