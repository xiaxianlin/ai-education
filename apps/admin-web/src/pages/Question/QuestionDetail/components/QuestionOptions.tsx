import { AudioPlayer } from '@/components';
import { getResourceUrl } from '@ai-education/shared-web';
import { ProCard } from '@ant-design/pro-components';
import { Flex, Image, Tag, Typography } from 'antd';
import { useQuestionResources } from '../hooks/useQuestionResources';

const { Text } = Typography;

interface QuestionOptionsProps {
  question: Question;
}

export function QuestionOptions({ question }: QuestionOptionsProps) {
  const { getOptionResources } = useQuestionResources(question);

  // 从 content 字段获取选项
  const content = question.content || {};
  const options = content.options || [];

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <ProCard title="选项">
      <Flex gap={12} wrap="wrap">
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const optionResources = getOptionResources(option.id);
          const optionImageResources = optionResources.filter((r) => r.type === 'image');
          const optionAudioResources = optionResources.filter((r) => r.type === 'audio');

          return (
            <div
              key={option.id || index}
              style={{
                padding: '12px',
                background: '#fafafa',
                borderRadius: '4px',
                width: 'calc(25% - 9px)',
                minWidth: '200px',
                flex: '0 0 auto',
              }}
            >
              <Flex align="flex-start" gap={8} vertical>
                <Flex align="center" gap={8} style={{ width: '100%' }}>
                  <Tag color="blue" style={{ margin: 0, minWidth: '32px', textAlign: 'center' }}>
                    {optionLabel}
                  </Tag>
                  {option.is_correct && (
                    <Tag color="success" style={{ margin: 0 }}>
                      正确答案
                    </Tag>
                  )}
                </Flex>
                <Text style={{ wordBreak: 'break-word', width: '100%' }}>{option.text || '-'}</Text>
                {/* 选项资源（图片）- 新结构 */}
                {optionImageResources.length > 0 && (
                  <Flex gap={8} wrap="wrap">
                    {optionImageResources.map((res) => (
                      <Image
                        key={res.id}
                        src={getResourceUrl(res.url) ?? undefined}
                        alt={res.alt || '选项图片'}
                        width={80}
                        style={{ objectFit: 'contain' }}
                        preview={{ mask: '预览' }}
                      />
                    ))}
                  </Flex>
                )}
                {/* 选项资源（音频）- 新结构 */}
                {optionAudioResources.map((res) => (
                  <AudioPlayer
                    key={res.id}
                    src={getResourceUrl(res.url) ?? ''}
                    resourceContent={res.transcript}
                  />
                ))}
                {/* 选项资源（向后兼容：旧字段 image_url 和 audio_url） */}
                {option.image_url && (
                  <Image
                    src={getResourceUrl(option.image_url) ?? undefined}
                    alt="选项图片"
                    width={80}
                    style={{ objectFit: 'contain' }}
                    preview={{ mask: '预览' }}
                  />
                )}
                {option.audio_url && (
                  <AudioPlayer src={getResourceUrl(option.audio_url) ?? ''} />
                )}
                {/* 选项反馈 */}
                {option.feedback && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    反馈：{option.feedback}
                  </Text>
                )}
              </Flex>
            </div>
          );
        })}
      </Flex>
    </ProCard>
  );
}

