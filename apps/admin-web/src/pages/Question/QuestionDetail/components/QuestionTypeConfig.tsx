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
        {questionType.media_context && (
          <ProDescriptions.Item label="媒体配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.media_context, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.scaffolding_config && (
          <ProDescriptions.Item label="脚手架配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.scaffolding_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.evaluation_config && (
          <ProDescriptions.Item label="评估配置" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(questionType.evaluation_config, null, 2)}
            </Text>
          </ProDescriptions.Item>
        )}
        {questionType.prompt && (
          <ProDescriptions.Item label="AI 指令" span={2}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {questionType.prompt}
            </Text>
          </ProDescriptions.Item>
        )}
      </ProDescriptions>
    </ProCard>
  );
}
