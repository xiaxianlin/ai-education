import { type FormInstance, Empty, message } from 'antd';
import { ProCard, ProForm } from '@ant-design/pro-components';

type Props = {
  form: FormInstance;
  loading: boolean;
  result: TestPromptResponse | null;
  onTest: (values: TestPromptRequest) => Promise<void>;
  requiredParamsSet?: boolean;
};

export function TestForm({ form, loading, result, onTest, requiredParamsSet = true }: Props) {
  const handleSubmit = async (values: TestPromptRequest) => {
    // 检查必填参数是否已设置
    if (!requiredParamsSet) {
      message.warning('请先在「参数信息」中填写所有必填参数');
      return;
    }

    await onTest(values);
  };

  return (
    <>
      <ProCard title="运行测试" bordered headerBordered style={{ marginTop: 16 }}>
        <ProForm
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: '开始运行',
            },
            submitButtonProps: {
              type: 'primary',
              loading,
              block: true,
              size: 'large',
              disabled: !requiredParamsSet, // 如果必填参数未设置，禁用测试按钮
            },
            resetButtonProps: {
              style: { display: 'none' }, // 隐藏重置按钮
            },
          }}
        >
          {/* 保持空表单，仅展示底部按钮 */}
        </ProForm>
      </ProCard>

      <ProCard style={{ marginTop: 16 }} title="输出结果" bordered headerBordered>
        {!result ? (
          <Empty
            description="运行后将在此展示渲染后的提示词与模型响应"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
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
          </>
        )}
      </ProCard>
    </>
  );
}
