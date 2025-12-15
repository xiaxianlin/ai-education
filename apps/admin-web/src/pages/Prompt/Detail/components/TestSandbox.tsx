import { Button, Form, FormInstance, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ProCard } from '@ant-design/pro-components';
import { TestFormValues } from '../../types';

type Props = {
  form: FormInstance<TestFormValues>;
  loading: boolean;
  result: TestPromptResponse | null;
  onTest: () => Promise<void>;
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

export function TestSandbox({ form, loading, result, onTest }: Props) {
  return (
    <ProCard title="测试沙箱">
      <Form layout="vertical" form={form}>
        <Form.Item label="变量 (JSON)" name="variables" rules={[{ validator: jsonValidator }]}>
          <TextArea rows={4} placeholder='例如 {"subject":"math","grade":6}' />
        </Form.Item>
        <Form.Item label="模型提供方" name="model_provider">
          <Input placeholder="openai / wenxin / sdxl 等" />
        </Form.Item>
        <Form.Item label="模型名称" name="model_name">
          <Input placeholder="gpt-4o-mini / sdxl 等" />
        </Form.Item>
        <Button type="primary" loading={loading} onClick={onTest}>
          立即测试
        </Button>
      </Form>
      {result && (
        <ProCard style={{ marginTop: 16 }} title="结果" bordered headerBordered>
          <p>
            <strong>渲染后：</strong>
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            {result.rendered_prompt}
          </pre>
          <p>
            <strong>响应：</strong>
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            {JSON.stringify(result.response, null, 2)}
          </pre>
          <p>
            <strong>耗时：</strong> {result.latency_ms} ms
          </p>
          <p>
            <strong>状态：</strong> {result.status}
          </p>
        </ProCard>
      )}
    </ProCard>
  );
}
