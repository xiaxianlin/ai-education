import { GRADES } from '@ai-education/shared-web';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';

interface QuestionBasicInfoProps {
  question: Question;
}

export function QuestionBasicInfo({ question }: QuestionBasicInfoProps) {
  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;

  return (
    <ProCard title="基本信息">
      <ProDescriptions column={3}>
        <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
        <ProDescriptions.Item label="科目">
          <Tag color="blue">{question.subject}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{gradeInfo || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="题型编码">{question.question_type_code}</ProDescriptions.Item>
        {question.ability_code && (
          <ProDescriptions.Item label="能力代码">
            <Tag color="cyan">{question.ability_code}</Tag>
          </ProDescriptions.Item>
        )}
        <ProDescriptions.Item label="创建时间">
          {question.create_time ? new Date(question.create_time * 1000).toLocaleString() : '-'}
        </ProDescriptions.Item>
        {question.update_time && (
          <ProDescriptions.Item label="更新时间" span={2}>
            {new Date(question.update_time * 1000).toLocaleString()}
          </ProDescriptions.Item>
        )}
        {/* TODO: 以下字段已删除：stage, difficulty, cognitive_level, knowledge_points, ability_tags, source, is_active */}
      </ProDescriptions>
    </ProCard>
  );
}
