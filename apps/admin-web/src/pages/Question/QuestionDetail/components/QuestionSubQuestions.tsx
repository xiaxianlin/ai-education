import { AudioPlayer } from '@/components';
import { getResourceUrl, INTERACTION_TYPE_LABELS } from '@ai-education/shared-web';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Flex, Image, Space, Tag, Typography } from 'antd';

const { Text } = Typography;

interface QuestionSubQuestionsProps {
  subQuestions?: Array<Record<string, unknown>>;
}

export function QuestionSubQuestions({ subQuestions }: QuestionSubQuestionsProps) {
  if (!subQuestions || subQuestions.length === 0) {
    return null;
  }

  return (
    <ProCard title="子题">
      <Flex vertical gap={16}>
        {subQuestions.map((sub: Record<string, unknown>, idx: number) => {
          const subStem = sub.stem as Record<string, unknown>;
          const subStemContent = (subStem?.rich_text as string) || (subStem?.text as string) || '';
          const subHasRichText = !!(subStem?.rich_text as string);
          const subResourcesArray: QuestionResource[] = Array.isArray(sub.resources)
            ? (sub.resources as QuestionResource[])
            : [];
          const subAnswer = (sub.answer as Record<string, unknown>) || {};

          return (
            <ProCard
              key={(sub.id as string) || idx}
              title={
                <Space>
                  <Text strong>第 {idx + 1} 题</Text>
                  {sub.interaction_type ? (
                    <Tag>
                      {INTERACTION_TYPE_LABELS[
                        (sub.interaction_type as InteractionType) as keyof typeof INTERACTION_TYPE_LABELS
                      ] || String(sub.interaction_type)}
                    </Tag>
                  ) : null}
                </Space>
              }
              bordered
              size="small"
            >
              <ProDescriptions column={1} size="small" bordered>
                {/* 子题题干 */}
                <ProDescriptions.Item label="题干">
                  {subHasRichText ? (
                    <div dangerouslySetInnerHTML={{ __html: subStemContent }} />
                  ) : (
                    <Text>{subStemContent || '-'}</Text>
                  )}
                  {/* 子题资源 */}
                  {subResourcesArray.length > 0 && (
                    <Flex gap={8} wrap="wrap" style={{ marginTop: 8 }}>
                      {subResourcesArray.map((res) => {
                        if (res.type === 'image') {
                          return (
                            <Image
                              key={res.id}
                              src={getResourceUrl(res.url) ?? undefined}
                              alt={res.alt || '子题图片'}
                              width={100}
                              style={{ objectFit: 'contain' }}
                              preview={{ mask: '预览' }}
                            />
                          );
                        }
                        if (res.type === 'audio') {
                          return (
                            <AudioPlayer
                              key={res.id}
                              src={getResourceUrl(res.url) ?? ''}
                              resourceContent={res.transcript}
                            />
                          );
                        }
                        return null;
                      })}
                    </Flex>
                  )}
                </ProDescriptions.Item>

                {/* 子题选项 */}
                {Array.isArray(sub.options) && (sub.options as Array<Record<string, unknown>>).length > 0 ? (
                  <ProDescriptions.Item label="选项">
                    <Flex vertical gap={4}>
                      {(sub.options as Array<Record<string, unknown>>).map(
                        (opt: Record<string, unknown>, optIdx: number) => (
                          <Text key={optIdx}>
                            {String.fromCharCode(65 + optIdx)}. {String(opt.text || opt.id || '')}
                          </Text>
                        ),
                      )}
                    </Flex>
                  </ProDescriptions.Item>
                ) : null}

                {/* 子题答案 */}
                <ProDescriptions.Item label="答案">
                  <Tag color="success">
                    {Array.isArray(subAnswer.correct_answers)
                      ? (subAnswer.correct_answers as string[]).join(', ')
                      : String(subAnswer.correct_answers || '-')}
                  </Tag>
                </ProDescriptions.Item>

                {/* 子题解析 */}
                {sub.explanation && (
                  <ProDescriptions.Item label="解析">
                    <Text>{String(sub.explanation || '')}</Text>
                  </ProDescriptions.Item>
                )}
              </ProDescriptions>
            </ProCard>
          );
        })}
      </Flex>
    </ProCard>
  );
}

