import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { adminApi } from '@/lib/api';
import { useRequest } from 'ahooks';
import { message, Button, Card, Space, Tag, Image, Popconfirm, Flex } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { GRADES } from '@/constants/course';
import { AudioPlayer } from '@/components/ui';
import { getResourceUrl } from '@ai-education/shared-web';

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: question,
    loading,
    refresh,
  } = useRequest(() => adminApi.getQuestion(id!), {
    ready: !!id,
    onError: () => {
      message.error('加载问题失败');
      navigate(-1);
    },
  });

  // 生成图片
  const { runAsync: handleGenerateImage, loading: generatingImage } = useRequest(
    async () => {
      if (!id) return;
      await adminApi.generateQuestionImage(id);
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
    },
  );

  // 生成语音
  const { runAsync: handleGenerateAudio, loading: generatingAudio } = useRequest(
    async () => {
      if (!id) return;
      await adminApi.generateQuestionAudio(id);
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
    },
  );

  // 删除题目
  const { runAsync: handleDelete, loading: deleting } = useRequest(
    async () => {
      if (!id) return;
      await adminApi.deleteQuestion(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        navigate('/question');
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;

  // 根据 resource_type 判断资源类型
  const isImageQuestion = question.resource_type === 'image';
  const isAudioQuestion = question.resource_type === 'audio';

  const resourceUrl = getResourceUrl(question.resource);

  // 解析选项
  let optionsList: string[] = [];
  if (question.options) {
    try {
      const parsed = JSON.parse(question.options);
      if (Array.isArray(parsed)) {
        optionsList = parsed.map((opt: any) =>
          typeof opt === 'string' ? opt : opt.text || opt.label || JSON.stringify(opt),
        );
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
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>题目详情</span>
        </div>
      }
      header={{
        breadcrumb: {},
        extra: [
          <Button key="edit" type="primary" onClick={() => navigate(`/question/edit/${question.id}`)}>
            编辑
          </Button>,
          <Popconfirm
            key="delete"
            title="确定要删除这道题目吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger loading={deleting}>
              删除
            </Button>
          </Popconfirm>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card
          title="基本信息"
          extra={
            <Space>
              {isImageQuestion && (
                <Button type="primary" onClick={handleGenerateImage} loading={generatingImage}>
                  生成图片
                </Button>
              )}
              {isAudioQuestion && (
                <Button type="primary" onClick={handleGenerateAudio} loading={generatingAudio}>
                  生成语音
                </Button>
              )}
            </Space>
          }
        >
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{question.subject}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{gradeInfo || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="题型">{question.type}</ProDescriptions.Item>
            {question.subtype && <ProDescriptions.Item label="子类型">{question.subtype}</ProDescriptions.Item>}
            <ProDescriptions.Item label="难度">
              {question.difficulty ? <Tag>{question.difficulty}</Tag> : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="资源类型">
              {question.resource_type ? (
                <Tag color={question.resource_type === 'image' ? 'blue' : 'green'}>
                  {question.resource_type === 'image' ? '图片' : '音频'}
                </Tag>
              ) : (
                '-'
              )}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="资源状态">
              {question.resource_type ? (
                <Tag color={question.resource && question.resource.trim() !== '' ? 'success' : 'warning'}>
                  {question.resource && question.resource.trim() !== '' ? '已生成' : '未生成'}
                </Tag>
              ) : (
                '-'
              )}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="资源路径">{question.resource || '-'}</ProDescriptions.Item>
            {question.resource_content && (
              <ProDescriptions.Item label="录音文本" span={2}>
                {question.resource_content}
              </ProDescriptions.Item>
            )}
            {question.textbook && (
              <ProDescriptions.Item label="教材" span={1}>
                {question.textbook.version}
              </ProDescriptions.Item>
            )}
            {question.unit && (
              <ProDescriptions.Item label="单元" span={1}>
                {question.unit.name}
              </ProDescriptions.Item>
            )}
            {question.knowledge && (
              <ProDescriptions.Item label="知识点" span={2}>
                {String(question.knowledge)}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        <Card title="题目内容">
          <div
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          >
            {question.content}
          </div>

          {/* 图片组件 */}
          {isImageQuestion && resourceUrl && (
            <div style={{ marginTop: '20px' }}>
              <Image
                src={resourceUrl}
                alt="题目图片"
                width={96}
                height={96}
                style={{ objectFit: 'contain' }}
                preview={{
                  mask: '预览',
                }}
              />
              {question.resource_content && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <strong>资源文本：</strong>
                  {question.resource_content}
                </div>
              )}
            </div>
          )}

          {/* 音频组件 */}
          {isAudioQuestion && resourceUrl && (
            <div style={{ marginTop: '20px' }}>
              <AudioPlayer src={resourceUrl} resourceContent={question.resource_content} />
            </div>
          )}

          {/* 资源未生成提示 */}
          {!resourceUrl && (isImageQuestion || isAudioQuestion) && (
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                background: '#fffbe6',
                borderRadius: '4px',
                border: '1px solid #ffe58f',
              }}
            >
              <div style={{ marginBottom: '8px', color: '#666' }}>
                {isImageQuestion && '该题目需要图片资源，但尚未生成。'}
                {isAudioQuestion && '该题目需要音频资源，但尚未生成。'}
              </div>
              {question.resource_content && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <strong>资源文本：</strong>
                  {question.resource_content}
                </div>
              )}
            </div>
          )}
        </Card>

        {optionsList.length > 0 && (
          <Card title="选项">
            <Flex gap={10}>
              {optionsList.map((option, index) => (
                <Tag key={index} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                </Tag>
              ))}
            </Flex>
          </Card>
        )}

        {question.answer && (
          <Card title="答案">
            <div
              style={{
                fontSize: '14px',
                padding: '12px',
                background: '#e6f7ff',
                borderRadius: '4px',
              }}
            >
              {question.answer}
            </div>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
}
