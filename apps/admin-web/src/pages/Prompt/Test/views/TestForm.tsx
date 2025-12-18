import { type FormInstance, Empty, Divider, Tabs } from 'antd';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { useAntdApp } from '@/lib/antdApp';

type Props = {
  form: FormInstance;
  loading: boolean;
  result: TestPromptResponse | null;
  onTest: (values: TestPromptRequest) => Promise<void>;
  requiredParamsSet?: boolean;
};

export function TestForm({ form, loading, result, onTest, requiredParamsSet = true }: Props) {
  const { message } = useAntdApp();

  const handleSubmit = async (values: TestPromptRequest) => {
    // 检查必填参数是否已设置
    if (!requiredParamsSet) {
      message.warning('请先在「输入参数」中填写所有必填参数');
      return;
    }

    await onTest(values);
  };

  const renderResult = () => {
    if (!result) {
      return <Empty description="运行后将在此展示渲染后的提示词与模型响应" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const tabItems = [
      {
        key: 'prompt',
        label: '渲染后提示词',
        children: (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'var(--app-code-bg)',
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.6,
              maxHeight: 300,
              overflow: 'auto',
              margin: 0,
              border: '1px solid var(--app-code-border)',
            }}
          >
            {result.rendered_prompt}
          </pre>
        ),
      },
      {
        key: 'response',
        label: '模型响应',
        children: (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'var(--app-code-bg)',
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.6,
              maxHeight: 300,
              overflow: 'auto',
              margin: 0,
              border: '1px solid var(--app-code-border)',
            }}
          >
            {JSON.stringify(result.response_snapshot, null, 2)}
          </pre>
        ),
      },
    ];

    return (
      <>
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ marginBottom: 12 }}>
          <span style={{ marginRight: 24 }}>
            <strong>状态：</strong>
            <span style={{ color: result.status === 'success' ? 'var(--chart-2)' : 'var(--destructive)' }}>
              {result.status === 'success' ? '成功' : '失败'}
            </span>
          </span>
          <span>
            <strong>耗时：</strong>
            {result.latency_ms} ms
          </span>
        </div>
        {result.error && (
          <div style={{ marginBottom: 12, color: 'var(--destructive)' }}>
            <strong>错误：</strong>
            {result.error}
          </div>
        )}
        <Tabs items={tabItems} size="small" />
      </>
    );
  };

  return (
    <ProCard title="测试运行" subTitle={result ? '运行完成' : ''} bordered headerBordered>
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
            disabled: !requiredParamsSet,
          },
          resetButtonProps: {
            style: { display: 'none' },
          },
        }}
      >
        {/* 保持空表单，仅展示底部按钮 */}
      </ProForm>

      {renderResult()}
    </ProCard>
  );
}
