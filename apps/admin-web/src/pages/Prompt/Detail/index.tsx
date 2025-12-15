import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { adminApi } from '@/lib/api';
import { PromptDetailSections } from './components/PromptDetailSections';

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

export default function PromptDetailPage() {
  const { id } = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestPromptResponse | null>(null);

  const [versionForm] = Form.useForm<VersionFormValues>();
  const [testForm] = Form.useForm<TestFormValues>();

  const fetchData = async (promptId: number) => {
    const [p, vers] = await Promise.all([adminApi.getPrompt(promptId), adminApi.listPromptVersions(promptId)]);
    setPrompt(p);
    setVersions(vers);
  };

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
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

  if (!prompt) {
    return <PageContainer title="加载中..." />;
  }

  return (
    <PageContainer title={`提示词详情：${prompt.name}`}>
      <PromptDetailSections
        isNew={false}
        versions={versions}
        versionForm={versionForm}
        testForm={testForm}
        loading={loading}
        testResult={testResult}
        onCreateVersion={handleCreateVersion}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onTest={handleTest}
        promptId={prompt.id}
      />
    </PageContainer>
  );
}
