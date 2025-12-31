import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  GRADES,
  RESOURCE_TYPE_COLORS,
  RESOURCE_TYPE_LABELS,
  STAGE_LABELS,
  Stage,
} from '@ai-education/shared-web';
import { Card, Descriptions, Flex, Tag } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function QuestionTypeInfo() {
  const { questionType } = useQuestionTypeGenerateModel();

  if (!questionType) {
    return null;
  }

  return (
    <Card title="题型信息" style={{ marginBottom: 16 }}>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="编码">{questionType.code || '-'}</Descriptions.Item>
        <Descriptions.Item label="名称">{questionType.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="科目">
          {questionType.subject ? <Tag color="blue">{questionType.subject}</Tag> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="难度">
          <Tag color={DIFFICULTY_COLORS[questionType.difficulty as Difficulty]}>
            {DIFFICULTY_LABELS[questionType.difficulty as Difficulty]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="资源类型">
          <Tag color={RESOURCE_TYPE_COLORS[questionType.resource_type as ResourceType]}>
            {RESOURCE_TYPE_LABELS[questionType.resource_type as ResourceType]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="适用学段">
          {questionType.stages?.length ? (
            <Flex gap={4} wrap>
              {questionType.stages.map((s: Stage) => (
                <Tag key={s} color="green">
                  {STAGE_LABELS[s as keyof typeof STAGE_LABELS] || s}
                </Tag>
              ))}
            </Flex>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="适用年级">
          {questionType.grades?.length ? (
            <Flex gap={4} wrap>
              {questionType.grades.map((g: number) => (
                <Tag key={g}>{GRADES[g] || `${g}年级`}</Tag>
              ))}
            </Flex>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={1}>
          {questionType.description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
