import { useEffect, useMemo, useState } from 'react';
import { ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, FormInstance, Input, Space, Tag } from 'antd';
import { adminApi } from '@/lib/api';
import { PromptVersionForm } from './PromptVersionForm';

type VersionFormValues = {
  template: string;
  system_prompt?: string;
  negative_prompt?: string;
  input_schema?: string;
  sampling_params?: string;
  timeout_ms?: number;
  changelog?: string;
};

type TestFormValues = {
  variables?: string;
  model_provider?: string;
  model_name?: string;
};

type Props = {
  isNew: boolean;
  versions: PromptVersion[];
  versionForm: FormInstance<VersionFormValues>;
  testForm: FormInstance<TestFormValues>;
  loading: boolean;
  testResult: TestPromptResponse | null;
  onCreateVersion: () => Promise<void>;
  onPublish: (vid: number) => Promise<void>;
  onArchive: (vid: number) => Promise<void>;
  onTest: () => Promise<void>;
  promptId?: number;
};

export function PromptDetailSections({
  isNew,
  versions,
  versionForm,
  testForm,
  loading,
  testResult,
  onCreateVersion,
  onPublish,
  onArchive,
  onTest,
  promptId,
}: Props) {
  const [metrics, setMetrics] = useState<PromptMetrics | null>(null);

  useEffect(() => {
    if (!promptId) return;
    adminApi.getPromptMetrics(promptId).then(setMetrics);
  }, [promptId]);

  const versionColumns = useMemo<ProColumns<PromptVersion>[]>(
    () => [
      { title: '版本号', dataIndex: 'version_no' },
      {
        title: '发布',
        dataIndex: 'is_published',
        render: (_, r) => (r.is_published ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
      },
      { title: '变更说明', dataIndex: 'changelog' },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              type="link"
              onClick={() =>
                versionForm.setFieldsValue({
                  template: record.template,
                  system_prompt: record.system_prompt,
                  negative_prompt: record.negative_prompt,
                  input_schema: JSON.stringify(record.input_schema ?? {}, null, 2),
                  sampling_params: JSON.stringify(record.sampling_params ?? {}, null, 2),
                  timeout_ms: record.timeout_ms,
                  changelog: record.changelog,
                })
              }
            >
              查看
            </Button>
            <Button size="small" type="link" onClick={() => onPublish(record.id)}>
              发布
            </Button>
            <Button size="small" danger type="link" onClick={() => onArchive(record.id)}>
              下线
            </Button>
          </Space>
        ),
      },
    ],
    [onArchive, onPublish, versionForm],
  );

  if (isNew) return null;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <ProCard split="horizontal" title="版本管理">
        <ProCard title="版本列表">
          <ProTable<PromptVersion>
            rowKey="id"
            search={false}
            options={false}
            columns={versionColumns}
            dataSource={versions}
            pagination={false}
          />
        </ProCard>
        <ProCard title="创建新版本">
          <PromptVersionForm form={versionForm} />
          <Button type="primary" onClick={onCreateVersion} style={{ marginTop: 16 }}>
            创建版本
          </Button>
        </ProCard>
      </ProCard>

      <ProCard title="测试沙箱">
        <Form layout="vertical" form={testForm}>
          <Form.Item label="变量 (JSON)" name="variables">
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
        {testResult && (
          <ProCard style={{ marginTop: 16 }} title="结果">
            <p>渲染后：</p>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{testResult.rendered_prompt}</pre>
            <p>响应：</p>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(testResult.response, null, 2)}</pre>
            <p>耗时：{testResult.latency_ms} ms</p>
            <p>状态：{testResult.status}</p>
          </ProCard>
        )}
      </ProCard>

      <ProCard title="基础指标">
        <Space size="large">
          <div>调用量：{metrics?.calls ?? 0}</div>
          <div>成功率：{metrics ? `${(metrics.success_rate * 100).toFixed(1)}%` : '-'}</div>
          <div>P95耗时：{metrics?.p95_latency_ms ?? '-'} ms</div>
        </Space>
      </ProCard>
    </Space>
  );
}

