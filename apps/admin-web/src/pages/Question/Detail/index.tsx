import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { QuestionApi } from '../api';
import { useRequest } from 'ahooks';
import { message, Button, Card, Tag, Image, Flex, Typography } from 'antd';
import { GRADES } from '@/constants/course';
import { AudioPlayer, DeleteButton } from '@/components';
import { getResourceUrl } from '@ai-education/shared-web';
import { PageHeader } from '@/components';

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: question,
    loading,
    refresh,
  } = useRequest(() => QuestionApi.getQuestion(id!), {
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
      await QuestionApi.generateQuestionImage(id);
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
      await QuestionApi.generateQuestionAudio(id);
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
      await QuestionApi.deleteQuestion(id);
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
      title={<PageHeader title="题目详情" />}
      header={{ breadcrumb: {} }}
      footer={[
        <Button key="edit" type="primary" onClick={() => navigate(`/question/form/${question.id}`)}>
          编辑
        </Button>,
        <DeleteButton
          key="delete"
          title="确定要删除这道题目吗？"
          onConfirm={() => handleDelete()}
          buttonProps={{ type: 'primary', loading: deleting }}
        />,
      ]}
    >
      <Flex vertical gap={16} style={{ width: '100%' }}>
        <Card
          title="基本信息"
          extra={
            <>
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
            </>
          }
        >
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{question.subject}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{gradeInfo || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="题型">{String(question.type)}</ProDescriptions.Item>
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

        <ProCard title="题目内容" bordered={false}>
          <Typography.Paragraph>{question.content}</Typography.Paragraph>

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
        </ProCard>

        <ProCard title="选项">
          <Flex gap={10}>
            {optionsList.map((option, index) => (
              <Tag key={index} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <strong>{String.fromCharCode(65 + index)}.</strong> {option}
              </Tag>
            ))}
            {optionsList.length === 0 && '此题没有选项'}
          </Flex>
        </ProCard>

        <ProCard title="答案">
          <Tag color="blue">{question.answer}</Tag>
        </ProCard>
      </Flex>
    </PageContainer>
  );
}
