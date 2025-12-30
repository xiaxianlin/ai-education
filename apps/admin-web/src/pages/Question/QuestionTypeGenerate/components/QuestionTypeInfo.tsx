import { GRADES, STAGE_LABELS, Stage } from '@ai-education/shared-web';
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
        <Descriptions.Item label="状态">
          {questionType.is_active !== undefined ? (
            <Tag color={questionType.is_active ? 'success' : 'error'}>
              {questionType.is_active ? '启用' : '禁用'}
            </Tag>
          ) : (
            '-'
          )}
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

