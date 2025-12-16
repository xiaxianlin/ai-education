import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { usePromptDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';

export default function MainView() {
  const { prompt, loading, handlePublish, navigate } = usePromptDetailModel();

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
    <PageContainer title={`提示词详情：${prompt.name}`}>
      <ProCard>
        <BasicInfo prompt={prompt} onPublish={handlePublish} navigate={navigate} />
      </ProCard>
      <ProCard title="模板内容" style={{ marginTop: 16 }}>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {prompt.template_content}
        </pre>
      </ProCard>
      {prompt.negative_content && (
        <ProCard title="负面提示" style={{ marginTop: 16 }}>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
            {prompt.negative_content}
          </pre>
        </ProCard>
      )}
      {prompt.model_params && Object.keys(prompt.model_params).length > 0 && (
        <ProCard title="模型参数" style={{ marginTop: 16 }}>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
            {JSON.stringify(prompt.model_params, null, 2)}
          </pre>
        </ProCard>
      )}
      {prompt.changelog && (
        <ProCard title="变更说明" style={{ marginTop: 16 }}>
          <p>{prompt.changelog}</p>
        </ProCard>
      )}
    </PageContainer>
  );
}

