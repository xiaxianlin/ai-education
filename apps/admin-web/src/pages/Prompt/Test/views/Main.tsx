import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Spin, Tag, Space } from 'antd';
import { usePromptTestModel } from '../models/page';
import { TestForm } from './TestForm';

export default function MainView() {
  const { prompt, loading, testForm, testResult, handleTest } = usePromptTestModel();

  if (loading && !prompt) {
    return (
      <PageContainer title="加载中...">
        <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
      </PageContainer>
    );
  }

  if (!prompt) {
    return <PageContainer title="提示词不存在" />;
  }

  return (
    <PageContainer title={`提示词测试：${prompt.name}`}>
      <ProCard>
        <ProDescriptions title="提示词信息" column={2}>
          <ProDescriptions.Item label="名称">{prompt.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="Slug">{prompt.slug}</ProDescriptions.Item>
          <ProDescriptions.Item label="类型">{prompt.type}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            <Tag color={prompt.is_published === 1 ? 'green' : 'default'}>
              {prompt.is_published === 1 ? '已发布' : '未发布'}
            </Tag>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="版本 ID">{prompt.version_id}</ProDescriptions.Item>
          <ProDescriptions.Item label="标签" span={2}>
            <Space>
              {prompt.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>
      <ProCard title="模板内容" style={{ marginTop: 16 }}>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {prompt.template_content}
        </pre>
      </ProCard>
      <TestForm form={testForm} loading={loading} result={testResult} onTest={handleTest} />
    </PageContainer>
  );
}

