import { Drawer, Tag, Image } from 'antd';
import { AudioPlayer } from '@/components/ui';
import { ProDescriptions } from '@ant-design/pro-components';

// OSS 基础 URL
const OSS_BASE_URL = 'https://xxl-ai-helper.oss-cn-hangzhou.aliyuncs.com';

interface QuestionDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  question?: Question;
  answer?: PracticeAnswer;
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

/**
 * 解析选项
 */
function parseOptions(options?: string): string[] {
  if (!options) return [];

  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) {
      return parsed.map((opt: any) =>
        typeof opt === 'string' ? opt : opt.text || opt.label || JSON.stringify(opt),
      );
    }
  } catch {
    // 解析失败，尝试按换行符分割
  }

  // 按换行符分割
  return options.split('\n').filter((line) => line.trim());
}

export function QuestionDetailDrawer({
  open,
  onClose,
  question,
  answer,
}: QuestionDetailDrawerProps) {
  if (!question) return null;

  const resourceUrl = buildResourceUrl(question.resource);
  const optionsList = parseOptions(question.options);
  const hasanswer =
    answer && answer.status !== undefined && answer.status !== null && answer.status !== 0;

  return (
    <Drawer
      title="题目详情"
      placement="right"
      width={750}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <ProDescriptions bordered column={1}>
        <ProDescriptions.Item label="题目ID" valueType="text">
          {question.id}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题型" valueType="text">
          {question.type || '未知题型'} ({question.subtype})
        </ProDescriptions.Item>
        <ProDescriptions.Item label="难度" valueType="text">
          {question.difficulty || '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题目内容" valueType="text">
          {question.content}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="选项" valueType="text">
          {optionsList.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...
            return (
              <Tag key={index} style={{ margin: 0 }}>
                {optionLabel}. {option}
              </Tag>
            );
          })}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="知识点" valueType="text">
          {question.knowledge || '-'}
        </ProDescriptions.Item>

        <ProDescriptions.Item label="题目资源" valueType="text">
          {question.resource_type === 'image' && resourceUrl && (
            <Image width={120} src={resourceUrl} alt="题目资源" preview={{ mask: '预览' }} />
          )}
          {question.resource_type === 'audio' && resourceUrl && (
            <AudioPlayer src={resourceUrl} resourceContent={question.resource_content} />
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="正确答案" valueType="text">
          {question.answer}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="学生答案" valueType="text">
          {answer?.text_answer || '未作答'}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Drawer>
  );
}
