import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Form, message, Space } from 'antd';
import { adminApi } from '@/lib/api';
import { VersionList } from './components/VersionList';
import { VersionCreator } from './components/VersionCreator';
import { TestSandbox } from './components/TestSandbox';
import { MetricsOverview } from './components/MetricsOverview';
import { VersionFormValues, TestFormValues } from '../types';

export default function PromptDetailPage() {
  const { id } = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestPromptResponse | null>(null);
  const [metrics, setMetrics] = useState<PromptMetrics | null>(null);

  const [versionForm] = Form.useForm<VersionFormValues>();
  const [testForm] = Form.useForm<TestFormValues>();

  const fetchData = async (promptId: number) => {
    const [p, vers] = await Promise.all([adminApi.getPrompt(promptId), adminApi.listPromptVersions(promptId)]);
    setPrompt(p);
    setVersions(vers);
  };

  const fetchMetrics = async (promptId: number) => {
    const m = await adminApi.getPromptMetrics(promptId);
    setMetrics(m);
  };

  useEffect(() => {
    if (id) {
      const pid = Number(id);
      fetchData(pid);
      fetchMetrics(pid);
    }
  }, [id]);

  const handleCreateVersion = async () => {
    if (!prompt) return;
    const values = await versionForm.validateFields();
    await adminApi.createPromptVersion(prompt.id, {
      template: values.template,
      system_prompt: values.system_prompt,
      negative_prompt: values.negative_prompt,
      input_schema: values.input_schema ? JSON.parse(values.input_schema) : {},
      sampling_params: values.sampling_params ? JSON.parse(values.sampling_params) : {},
      timeout_ms: values.timeout_ms,
      changelog: values.changelog,
    });
    message.success('已创建新版本');
    versionForm.resetFields();
    fetchData(prompt.id);
  };

  const handlePublish = async (vid: number) => {
    if (!prompt) return;
    await adminApi.publishPromptVersion(prompt.id, vid);
    message.success('已发布');
    fetchData(prompt.id);
  };

  const handleArchive = async (vid: number) => {
    if (!prompt) return;
    await adminApi.archivePromptVersion(prompt.id, vid);
    message.success('已下线');
    fetchData(prompt.id);
  };

  const handleTest = async () => {
    if (!prompt) return;
    const values = await testForm.validateFields();
    const activeVersionId = prompt.current_version_id || versions[0]?.id;
    if (!activeVersionId) {
      message.warning('请先创建版本');
      return;
    }
    setLoading(true);
    try {
      const result = await adminApi.testPromptVersion(prompt.id, activeVersionId, {
        variables: values.variables ? JSON.parse(values.variables) : {},
        model_provider: values.model_provider,
        model_name: values.model_name,
      });
      setTestResult(result);
      message.success('测试完成');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = (version: PromptVersion) => {
    versionForm.setFieldsValue({
      template: version.template,
      system_prompt: version.system_prompt,
      negative_prompt: version.negative_prompt,
      input_schema: JSON.stringify(version.input_schema ?? {}, null, 2),
      sampling_params: JSON.stringify(version.sampling_params ?? {}, null, 2),
      timeout_ms: version.timeout_ms,
      changelog: version.changelog,
    });
    // Scroll to version form
    document.getElementById('version-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!prompt) {
    return <PageContainer title="加载中..." />;
  }

  return (
    <PageContainer title={`提示词详情：${prompt.name}`}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <MetricsOverview metrics={metrics} />

        <ProCard split="horizontal" title="版本管理">
          <ProCard title="版本列表">
            <VersionList
              versions={versions}
              onView={handleViewVersion}
              onPublish={handlePublish}
              onArchive={handleArchive}
            />
          </ProCard>
          <ProCard title="创建新版本">
            <div id="version-form-card">
              <VersionCreator form={versionForm} onCreate={handleCreateVersion} />
            </div>
          </ProCard>
        </ProCard>

        <TestSandbox form={testForm} loading={loading} result={testResult} onTest={handleTest} />
      </Space>
    </PageContainer>
  );
}
