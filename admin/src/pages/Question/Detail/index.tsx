import { useParams, history } from '@umijs/max';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { useRequest } from 'ahooks';
import { message, Button, Card, Space, Tag, Image } from 'antd';
import { GRADES } from '@/constants/course';
import { StatusTag } from '@/components/ui';

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: question, loading, refresh } = useRequest(
    () => QuestionApi.get(id!),
    {
      ready: !!id,
      onError: () => {
        message.error('加载问题失败');
        history.back();
      },
    }
  );

  // 生成图片
  const { runAsync: handleGenerateImage, loading: generatingImage } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.generateImage(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('图片生成成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '图片生成失败');
      },
    }
  );

  // 生成语音
  const { runAsync: handleGenerateAudio, loading: generatingAudio } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.generateAudio(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('语音生成成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '语音生成失败');
      },
    }
  );

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;

  // 判断题型，决定显示哪个按钮
  const isImageQuestion = question.type === '辨识题';
  const isAudioQuestion = question.type === '跟读题' || question.type === '听力题';

  // 构建资源 URL
  // OSS 基础 URL
  const OSS_BASE_URL = 'https://xxl-ai-helper.oss-cn-hangzhou.aliyuncs.com';
  
  const resourceUrl = question.resource 
    ? (question.resource.startsWith('http://') || question.resource.startsWith('https://'))
      ? question.resource
      : `${OSS_BASE_URL}/${question.resource}`
    : null;

  // 解析选项
  let optionsList: string[] = [];
  if (question.options) {
    try {
      const parsed = JSON.parse(question.options);
      if (Array.isArray(parsed)) {
        optionsList = parsed.map((opt: any) => (typeof opt === 'string' ? opt : opt.text || opt.label || JSON.stringify(opt)));
      } else {
        // 如果不是数组，尝试按换行符分割
        optionsList = question.options.split('\n').filter((line) => line.trim());
      }
    } catch {
      // 如果解析失败，尝试按换行符分割
      optionsList = question.options.split('\n').filter((line) => line.trim());
    }
  }

  return (
    <PageContainer
      title="题目详情"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="edit" type="primary" onClick={() => history.push(`/question/edit/${question.id}`)}>
            编辑
          </Button>,
          <Button key="back" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card 
          title="基本信息"
          extra={
            <Space>
              {isImageQuestion && (
                <Button
                  type="primary"
                  onClick={handleGenerateImage}
                  loading={generatingImage}
                >
                  生成图片
                </Button>
              )}
              {isAudioQuestion && (
                <Button
                  type="primary"
                  onClick={handleGenerateAudio}
                  loading={generatingAudio}
                >
                  生成语音
                </Button>
              )}
            </Space>
          }
        >
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <StatusTag status={question.status === 1} />
            </ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{question.subject}</ProDescriptions.Item>
            <ProDescriptions.Item label="阶段">{gradeInfo?.stage || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{gradeInfo?.grade || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="题型">{question.type}</ProDescriptions.Item>
            <ProDescriptions.Item label="难度">
              {question.difficulty ? <Tag>{question.difficulty}</Tag> : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="资源路径">{question.resource || '-'}</ProDescriptions.Item>
            {question.textbook && (
              <ProDescriptions.Item label="所属教材" span={2}>
                {question.textbook.subject} - {question.textbook.version} - {gradeInfo?.grade} - {question.textbook.semester}
              </ProDescriptions.Item>
            )}
            {question.unit && (
              <ProDescriptions.Item label="所属单元" span={2}>
                {question.unit.name}
              </ProDescriptions.Item>
            )}
            {question.knowledge && (
              <ProDescriptions.Item label="所属知识点" span={2}>
                {String(question.knowledge)}
              </ProDescriptions.Item>
            )}
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {question.create_time * 1000}
            </ProDescriptions.Item>
            {question.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {question.update_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        <Card title="题目内容">
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.8' }}>
            {question.content}
          </div>
        </Card>

        {optionsList.length > 0 && (
          <Card title="选项">
            <Space direction="vertical" style={{ width: '100%' }}>
              {optionsList.map((option, index) => (
                <div key={index} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                </div>
              ))}
            </Space>
          </Card>
        )}

        {question.answer && (
          <Card title="答案">
            <div style={{ fontSize: '14px', padding: '12px', background: '#e6f7ff', borderRadius: '4px' }}>
              {question.answer}
            </div>
          </Card>
        )}

        {/* 资源展示模块 */}
        {resourceUrl && (
          <Card title="资源">
            {isImageQuestion && (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={resourceUrl}
                  alt="题目图片"
                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                  preview={{
                    mask: '预览',
                  }}
                />
              </div>
            )}
            {isAudioQuestion && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <audio controls style={{ width: '100%', maxWidth: '600px' }}>
                  <source src={resourceUrl} type="audio/mpeg" />
                  您的浏览器不支持音频播放。
                </audio>
                <div style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}>
                  <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                    下载音频文件
                  </a>
                </div>
              </div>
            )}
            {!isImageQuestion && !isAudioQuestion && (
              <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>资源路径：</strong>
                  <span style={{ wordBreak: 'break-all' }}>{question.resource}</span>
                </div>
                {resourceUrl && (
                  <div>
                    <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                      查看资源
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </Space>
    </PageContainer>
  );
}

