import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, INTERACTION_TYPE_LABELS } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import { Card, Flex, Space, Tag, Typography } from 'antd';
import { memo } from 'react';

const { Text } = Typography;

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = memo(function QuestionCard({ question }: QuestionCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[question.difficulty as Difficulty] || 'default';
  const isComposite =
    (question.stem?.sub_questions?.length || 0) > 0 || (question.stem as any)?.subQuestions?.length > 0;

  // 获取题干内容（优先使用 rich_text）
  const stemContent = question.stem?.rich_text || question.stem?.text || '';
  const hasRichText = !!question.stem?.rich_text;

  // 构建标题标签（简化）
  const titleTags = (
    <Space size={[4, 4]} wrap>
      <Tag color="blue" style={{ margin: 0, fontSize: 11, padding: '1px 6px', lineHeight: '18px' }}>
        {question.subject}
      </Tag>
      <Tag color="green" style={{ margin: 0, fontSize: 11, padding: '1px 6px', lineHeight: '18px' }}>
        {question.grade}年级
      </Tag>
      <Tag color="purple" style={{ margin: 0, fontSize: 11, padding: '1px 6px', lineHeight: '18px' }}>
        {INTERACTION_TYPE_LABELS[question.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
          question.question_type_code}
      </Tag>
      <Tag color={difficultyColor} style={{ margin: 0, fontSize: 11, padding: '1px 6px', lineHeight: '18px' }}>
        {DIFFICULTY_LABELS[question.difficulty as Difficulty]}
      </Tag>
      {isComposite && (
        <Tag color="red" style={{ margin: 0, fontSize: 11, padding: '1px 6px', lineHeight: '18px' }}>
          复合题
        </Tag>
      )}
    </Space>
  );

  return (
    <Card title={titleTags}>
      <ProDescriptions bordered column={1} size="small">
        {/* 题干 */}
        <ProDescriptions.Item label="题干">
          {hasRichText ? (
            <div dangerouslySetInnerHTML={{ __html: stemContent }} />
          ) : (
            <Text style={{ color: '#262626', wordBreak: 'break-word' }}>{stemContent || '-'}</Text>
          )}
        </ProDescriptions.Item>

        {/* 选项（平铺） */}
        {!!question.options?.length && (
          <ProDescriptions.Item label="选项">
            <Flex gap={4} wrap>
              {question.options.map((opt, idx) => {
                return (
                  <Tag key={opt.id || idx}>
                    <Text strong style={{ marginRight: 4 }}>
                      {String.fromCharCode(65 + idx)}:
                    </Text>
                    <Text style={{ wordBreak: 'break-word' }}>{opt.text || '-'}</Text>
                  </Tag>
                );
              })}
            </Flex>
          </ProDescriptions.Item>
        )}

        {/* 答案 */}
        <ProDescriptions.Item label="答案">
          <Tag color="success" style={{ margin: 0, fontSize: 12 }}>
            {question.answer?.correct_answers?.join(', ') || '-'}
          </Tag>
        </ProDescriptions.Item>

        {/* 知识点 */}
        {!!question.knowledge_points?.length && (
          <ProDescriptions.Item label="知识点">
            <Space size={[4, 4]} wrap>
              {question.knowledge_points.map((kp, idx) => (
                <Tag key={idx} color="purple" style={{ margin: 0, fontSize: 11 }}>
                  {kp}
                </Tag>
              ))}
            </Space>
          </ProDescriptions.Item>
        )}

        {/* 解析 */}
        {question.explanation && (
          <ProDescriptions.Item label="解析">
            <Text style={{ fontSize: 12 }}>{question.explanation}</Text>
          </ProDescriptions.Item>
        )}

        {/* 子题（复合题） */}
        {isComposite && question.stem?.sub_questions && (
          <ProDescriptions.Item label="子题">
            <div className="space-y-2">
              {question.stem.sub_questions.map((sub: Record<string, unknown>, idx: number) => (
                <div key={(sub.id as string) || idx} className="border rounded p-2 text-xs">
                  <div className="mb-1">
                    <Text strong style={{ marginRight: 8 }}>
                      第{idx + 1}题
                    </Text>
                    {!!sub.interaction_type && (
                      <Tag style={{ margin: 0 }}>
                        {INTERACTION_TYPE_LABELS[
                          sub.interaction_type as InteractionType as keyof typeof INTERACTION_TYPE_LABELS
                        ] || (sub.interaction_type as string)}
                      </Tag>
                    )}
                  </div>
                  <div className="mb-1">
                    {hasRichText && (sub.stem as Record<string, unknown>)?.rich_text ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: String((sub.stem as Record<string, unknown>)?.rich_text || ''),
                        }}
                      />
                    ) : (
                      <div>{String((sub.stem as Record<string, unknown>)?.text || '')}</div>
                    )}
                  </div>
                  {Array.isArray(sub.options) && (sub.options as Array<Record<string, unknown>>).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(sub.options as Array<Record<string, unknown>>).map(
                        (opt: Record<string, unknown>, optIdx: number) => (
                          <span key={optIdx} className="text-xs">
                            {String.fromCharCode(65 + optIdx)}.{' '}
                            {String((opt.text as string) || (opt.id as string) || '')}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
    </Card>
  );
});
