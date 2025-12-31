import {
  COGNITIVE_LEVEL_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  GRADES,
  STAGE_LABELS,
} from '@ai-education/shared-web';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';

interface QuestionBasicInfoProps {
  question: Question;
  generatingImage: boolean;
  generatingAudio: boolean;
  onGenerateImage: () => void;
  onGenerateAudio: () => void;
}

export function QuestionBasicInfo({
  question,
  generatingImage,
  generatingAudio,
  onGenerateImage,
  onGenerateAudio,
}: QuestionBasicInfoProps) {
  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;
  const difficultyColor = DIFFICULTY_COLORS[question.difficulty as Difficulty] || 'default';
  const stageLabel = question.stage ? STAGE_LABELS[question.stage as Stage] : undefined;

  return (
    <ProCard
      title="基本信息"
      extra={
        <>
          {question.question_type_code.includes('image') && (
            <Button type="primary" onClick={onGenerateImage} loading={generatingImage}>
              生成图片
            </Button>
          )}
          {question.question_type_code.includes('audio') && (
            <Button type="primary" onClick={onGenerateAudio} loading={generatingAudio}>
              生成语音
            </Button>
          )}
        </>
      }
    >
      <ProDescriptions column={3}>
        <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
        <ProDescriptions.Item label="科目">
          <Tag color="blue">{question.subject}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="年级">{gradeInfo || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="学段">
          {stageLabel ? <Tag color="green">{stageLabel}</Tag> : '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题型">{question.question_type_code}</ProDescriptions.Item>
        <ProDescriptions.Item label="难度">
          {question.difficulty ? (
            <Tag color={difficultyColor}>{DIFFICULTY_LABELS[question.difficulty as Difficulty]}</Tag>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="认知层次">
          {question.cognitive_level ? (
            <Tag>
              {COGNITIVE_LEVEL_LABELS[question.cognitive_level as CognitiveLevel] || question.cognitive_level}
            </Tag>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="知识点" span={2}>
          {question.knowledge_points?.length ? (
            <Space size={[4, 4]} wrap>
              {question.knowledge_points.map((kp, idx) => (
                <Tag key={idx} color="purple">
                  {kp}
                </Tag>
              ))}
            </Space>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        {question.ability_tags && question.ability_tags.length > 0 && (
          <ProDescriptions.Item label="能力标签" span={3}>
            <Space size={[4, 4]} wrap>
              {question.ability_tags.map((tag, idx) => (
                <Tag key={idx} color="cyan">
                  {tag}
                </Tag>
              ))}
            </Space>
          </ProDescriptions.Item>
        )}
        <ProDescriptions.Item label="来源">
          <Tag color="default">{question.source || 'ai'}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <Tag color={question.is_active ? 'success' : 'default'}>
            {question.is_active ? '已激活' : '未激活'}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间">
          {question.create_time ? new Date(question.create_time * 1000).toLocaleString() : '-'}
        </ProDescriptions.Item>
        {question.update_time && (
          <ProDescriptions.Item label="更新时间" span={2}>
            {new Date(question.update_time * 1000).toLocaleString()}
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
    </ProCard>
  );
}

