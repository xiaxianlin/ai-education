import { Card, Descriptions, Tag } from 'antd';
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
        <Descriptions.Item label="题型分类">
          {questionType.category ? (
            <Tag color={questionType.category === 'ability_practice' ? 'purple' : 'cyan'}>
              {questionType.category === 'ability_practice' ? '能力练习' : '单元练习'}
            </Tag>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="学段">
          {questionType.grade_band ? (
            <Tag color="green">
              {questionType.grade_band === 'Low' ? '低年级 (1-3)' : questionType.grade_band === 'Mid' ? '中年级 (4-6)' : '高年级 (7-12)'}
            </Tag>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        {questionType.ability_code && (
          <Descriptions.Item label="能力代码">
            <Tag color="cyan">{questionType.ability_code}</Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="描述" span={1}>
          {questionType.description || '-'}
        </Descriptions.Item>
        {/* TODO: 以下字段已删除：difficulty, resource_type, stages, grades */}
      </Descriptions>
    </Card>
  );
}
