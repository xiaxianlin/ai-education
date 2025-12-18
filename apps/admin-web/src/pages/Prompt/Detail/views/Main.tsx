import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, Flex, Spin, Tag } from 'antd';
import { usePromptDetailModel } from '../models/page';
import { PageHeader } from '@/components';
import { PublishModal } from '../components/PublishModal';

export default function MainView() {
  const { prompt, loading, navigate, refresh } = usePromptDetailModel();

  if (loading) {
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
    <PageContainer
      title={<PageHeader title="提示词详情" />}
      extra={[
        !prompt.is_published && <PublishModal versionId={prompt.version_id} onSuccess={refresh} />,
        <Button type="primary" onClick={() => navigate(`/prompt/form?version_id=${prompt.version_id}`)}>
          编辑
        </Button>,
      ]}
    >
      <ProCard title="基础信息" style={{ marginTop: 16 }}>
        <ProDescriptions column={3}>
          <ProDescriptions.Item label="名称">{prompt.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="Slug">{prompt.slug}</ProDescriptions.Item>
          <ProDescriptions.Item label="type">{prompt.type}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            <Tag color={prompt.is_published === 1 ? 'green' : 'default'}>
              {prompt.is_published === 1 ? '已发布' : '未发布'}
            </Tag>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="版本 ID">{prompt.version_id}</ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间">
            {prompt.create_time ? new Date(prompt.create_time * 1000).toLocaleString() : '-'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="描述" span={3}>
            {prompt.description || '-'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="变更说明" span={3}>
            {prompt.changelog || '-'}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>
      <ProCard title="模板内容" style={{ marginTop: 16 }}>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {prompt.template_content}
        </pre>
      </ProCard>
      <ProCard title="负面提示" style={{ marginTop: 16 }}>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {prompt.negative_content}
        </pre>
      </ProCard>
      <ProCard title="模型参数" style={{ marginTop: 16 }}>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {JSON.stringify(prompt.model_params, null, 2)}
        </pre>
      </ProCard>
    </PageContainer>
  );
}
