import { ProDescriptions } from '@ant-design/pro-components';
import { Tag, Space, Button } from 'antd';

type Props = {
  prompt: PromptDetail;
  onPublish: () => void;
  navigate: (path: string) => void;
};

export function BasicInfo({ prompt, onPublish, navigate }: Props) {
  // 根据 API 文档，PromptDetail 中的 id 是 prompt 的 id，version_id 是版本的 id
  const promptId = prompt.id;

  return (
    <ProDescriptions
      title="基础信息"
      column={2}
      extra={
        <Space>
          {prompt.is_published === 0 && (
            <Button type="primary" onClick={onPublish}>
              发布版本
            </Button>
          )}
          <Button onClick={() => navigate(`/prompt/versions?prompt_id=${promptId}`)}>
            查看版本列表
          </Button>
          <Button onClick={() => navigate(`/prompt/test/${prompt.version_id}`)}>
            测试
          </Button>
        </Space>
      }
    >
      <ProDescriptions.Item label="名称">{prompt.name}</ProDescriptions.Item>
      <ProDescriptions.Item label="Slug">{prompt.slug}</ProDescriptions.Item>
      <ProDescriptions.Item label="场景">{prompt.scene}</ProDescriptions.Item>
      <ProDescriptions.Item label="状态">
        <Tag color={prompt.is_published === 1 ? 'green' : 'default'}>
          {prompt.is_published === 1 ? '已发布' : '未发布'}
        </Tag>
      </ProDescriptions.Item>
      <ProDescriptions.Item label="标签" span={2}>
        <Space>
          {prompt.tags?.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      </ProDescriptions.Item>
      <ProDescriptions.Item label="描述" span={2}>
        {prompt.description || '-'}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="版本 ID">{prompt.version_id}</ProDescriptions.Item>
      <ProDescriptions.Item label="创建时间">
        {prompt.create_time ? new Date(prompt.create_time * 1000).toLocaleString() : '-'}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="更新时间">
        {prompt.update_time ? new Date(prompt.update_time * 1000).toLocaleString() : '-'}
      </ProDescriptions.Item>
    </ProDescriptions>
  );
}

