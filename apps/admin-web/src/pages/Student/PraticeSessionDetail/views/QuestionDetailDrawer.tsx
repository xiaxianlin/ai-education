import { AudioPlayer } from '@/components';
import { ProDescriptions } from '@ant-design/pro-components';
import { Drawer, Image, Tag } from 'antd';

// OSS 基础 URL
const OSS_BASE_URL = 'https://xxl-ai-education.oss-cn-hangzhou.aliyuncs.com';

interface QuestionDetailDrawerProps {
  open: boolean;
  question?: Question;
  answer?: PracticeSessionAnswer;
  onClose: () => void;
}

/**
 * 构建资源 URL
 */
function buildResourceUrl(resource?: string): string | null {
  if (!resource) return null;

  // 如果已经是完整 URL，直接返回
  if (resource.startsWith('http://') || resource.startsWith('https://')) {
    return resource;
  }

  // 否则拼接 OSS 基础 URL
  return `${OSS_BASE_URL}/${resource}`;
}

export function QuestionDetailDrawer({ open, question, answer, onClose }: QuestionDetailDrawerProps) {
  if (!question) return null;

  const imageResources = question.resources?.filter((r) => r.type === 'image') || [];
  const audioResource = question.resources?.find((r) => r.type === 'audio');
  const isWrongAnswer = answer?.status === 2; // 答错的题目

  return (
    <Drawer title="题目详情" placement="right" width={750} open={open} onClose={onClose} destroyOnClose>
      <ProDescriptions bordered column={1}>
        <ProDescriptions.Item label="题目ID" valueType="text">
          {question.id}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题型" valueType="text">
          {question.question_type_code || '未知题型'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="难度" valueType="text">
          {question.difficulty || '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题目内容" valueType="text">
          {question.stem.text}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="选项" valueType="text">
          {(!question.options || question.options.length === 0) && '-'}
          {question.options?.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...
            return (
              <div key={index} style={{ marginBottom: 4 }}>
                <Tag style={{ margin: 0 }}>{optionLabel}</Tag> {option.text}
                {option.image_url && <Image width={100} src={buildResourceUrl(option.image_url) || ''} />}
              </div>
            );
          })}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="知识点" valueType="text">
          {question.knowledge_points?.join(', ') || '-'}
        </ProDescriptions.Item>

        <ProDescriptions.Item label="题目资源" valueType="text">
          {(!question.resources || question.resources.length === 0) && '-'}
          {imageResources.map((res, index) => (
            <Image
              key={index}
              width={120}
              src={buildResourceUrl(res.url) || ''}
              alt="题目图片"
              preview={{ mask: '预览' }}
            />
          ))}
          {audioResource && (
            <AudioPlayer src={buildResourceUrl(audioResource.url) || ''} resourceContent={audioResource.transcript} />
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="正确答案" valueType="text">
          {answer?.correct_answer || question.answer.correct_answers?.join(', ') || '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="学生答案" valueType="text">
          {answer?.text_answer || '未作答'}
        </ProDescriptions.Item>
        {isWrongAnswer && answer?.analysis && (
          <ProDescriptions.Item label="错题分析" valueType="text">
            {answer.analysis}
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
    </Drawer>
  );
}
