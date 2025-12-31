import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Typography } from 'antd';

const { Text } = Typography;

interface QuestionTypeConfigProps {
  questionType?: QuestionType;
}

export function QuestionTypeConfig({ questionType }: QuestionTypeConfigProps) {
  if (!questionType) {
    return null;
  }

  return (
    <ProCard title="题型配置">
      <ProDescriptions column={2} bordered>
        <ProDescriptions.Item label="题型名称" span={2}>
          {questionType.name || '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="题型描述" span={2}>
          {questionType.description || '-'}
        </ProDescriptions.Item>
        {questionType.interaction_config && (
          <ProDescriptions.Item label="交互配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.interaction_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.resource_config && (
          <ProDescriptions.Item label="资源配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.resource_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.answer_config && (
          <ProDescriptions.Item label="答案配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.answer_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.feedback_config && (
          <ProDescriptions.Item label="反馈配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.feedback_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
    </ProCard>
  );
}

