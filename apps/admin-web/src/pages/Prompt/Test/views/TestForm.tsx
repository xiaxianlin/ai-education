import type { FormInstance } from 'antd';
import { ProCard, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

type Props = {
  form: FormInstance;
  loading: boolean;
  result: TestPromptResponse | null;
  onTest: (values: any) => Promise<void>;
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

export function TestForm({ form, loading, result, onTest }: Props) {
  return (
    <ProCard title="测试表单">
      <ProForm
        form={form}
        layout="vertical"
        onFinish={onTest}
        submitter={{
          searchConfig: {
            submitText: '立即测试',
          },
          submitButtonProps: {
            loading,
          },
        }}
        initialValues={{
          model_provider: 'aliyun',
          model_name: 'qwen-plus',
        }}
      >
        <ProFormTextArea
          name="variables"
          label="变量 (JSON)"
          rules={[{ validator: jsonValidator }]}
          tooltip="模板变量，例如：{&quot;subject&quot;:&quot;math&quot;,&quot;grade&quot;:6}"
          fieldProps={{
            rows: 4,
            placeholder: '例如 {"subject":"math","grade":6}',
          }}
        />
        <ProFormText
          name="model_provider"
          label="模型提供方"
          fieldProps={{
            placeholder: 'aliyun / openai 等',
          }}
        />
        <ProFormText
          name="model_name"
          label="模型名称"
          fieldProps={{
            placeholder: 'qwen-plus / gpt-4o-mini 等',
          }}
        />
      </ProForm>
      {result && (
        <ProCard style={{ marginTop: 16 }} title="测试结果" bordered headerBordered>
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
            {JSON.stringify(result.response_snapshot, null, 2)}
          </pre>
          <p>
            <strong>耗时：</strong> {result.latency_ms} ms
          </p>
          <p>
            <strong>状态：</strong> {result.status}
          </p>
          {result.error && (
            <p>
              <strong>错误：</strong> {result.error}
            </p>
          )}
        </ProCard>
      )}
    </ProCard>
  );
}

