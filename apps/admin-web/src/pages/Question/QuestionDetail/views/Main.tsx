import { AudioPlayer, DeleteButton } from '@/components';
import { getResourceUrl, GRADES } from '@ai-education/shared-web';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, Flex, Image, Tag, Typography } from 'antd';
import { useQuestionDetailModel } from '../models/page';
;

export default function MainView() {
  const {
    question,
    loading,
    navigate,
    generatingImage,
    generatingAudio,
    deleting,
    handleGenerateImage,
    handleGenerateAudio,
    handleDelete,
  } = useQuestionDetailModel();

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;

  const imageResources = question.resources?.filter((r) => r.type === 'image') || [];
  const audioResources = question.resources?.filter((r) => r.type === 'audio') || [];

  return (
    <PageContainer
      title="题目详情"
      header={{ onBack: () => navigate(-1) }}
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
        <ProCard
          title="基本信息"
          extra={
            <>
              {question.question_type_code.includes('image') && (
                <Button type="primary" onClick={handleGenerateImage} loading={generatingImage}>
                  生成图片
                </Button>
              )}
              {question.question_type_code.includes('audio') && (
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
            <ProDescriptions.Item label="题型">{question.question_type_code}</ProDescriptions.Item>
            <ProDescriptions.Item label="难度">
              {question.difficulty ? <Tag>{question.difficulty}</Tag> : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="知识点" span={2}>
              {question.knowledge_points?.join(', ') || '-'}
            </ProDescriptions.Item>
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
          </ProDescriptions>
        </ProCard>

        <ProCard title="题目内容" bordered={false}>
          <Typography.Paragraph>{question.stem.text}</Typography.Paragraph>

          {/* 资源组件 */}
          <Flex gap={16} wrap="wrap" style={{ marginTop: '20px' }}>
            {imageResources.map((res, index) => (
              <div key={index}>
                <Image
                  src={getResourceUrl(res.url) ?? undefined}
                  alt="题目图片"
                  width={120}
                  style={{ objectFit: 'contain' }}
                  preview={{ mask: '预览' }}
                />
                {res.transcript && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{res.transcript}</div>
                )}
              </div>
            ))}
          </Flex>

          {audioResources.map((res, index) => (
            <div key={index} style={{ marginTop: '16px' }}>
              <AudioPlayer src={getResourceUrl(res.url) ?? ''} resourceContent={res.transcript} />
            </div>
          ))}

          {(!question.resources || question.resources.length === 0) &&
            (question.question_type_code.includes('image') || question.question_type_code.includes('audio')) && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: '#fffbe6',
                  borderRadius: '4px',
                  border: '1px solid #ffe58f',
                  color: '#666',
                }}
              >
                该题目需要多媒体资源，但尚未生成。
              </div>
            )}
        </ProCard>

        <ProCard title="选项">
          <Flex gap={10} wrap="wrap">
            {question.options?.map((option, index) => (
              <Tag key={index} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + index)}.</strong>
                {option.text}
                {option.image_url && (
                  <Image src={getResourceUrl(option.image_url) ?? undefined} width={40} style={{ marginLeft: 8 }} />
                )}
              </Tag>
            ))}
            {(!question.options || question.options.length === 0) && '此题没有选项'}
          </Flex>
        </ProCard>

        <ProCard title="答案">
          <Tag color="blue">{question.answer.correct_answers?.join(', ') || '-'}</Tag>
          {question.explanation && (
            <div style={{ marginTop: 12, color: '#666' }}>
              <strong>解析：</strong> {question.explanation}
            </div>
          )}
        </ProCard>
      </Flex>
    </PageContainer>
  );
}

