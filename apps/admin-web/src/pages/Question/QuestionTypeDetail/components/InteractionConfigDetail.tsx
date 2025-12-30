import { INTERACTION_TYPE_LABELS } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Card, Tag } from 'antd';

interface InteractionConfigDetailProps {
  interactionType?: string;
  interactionConfig?: any;
}

export default function InteractionConfigDetail({ interactionType, interactionConfig }: InteractionConfigDetailProps) {
  return (
    <Card title="交互配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="交互类型">
          {interactionType ? (
            <Tag color="purple">
              {INTERACTION_TYPE_LABELS[interactionType as keyof typeof INTERACTION_TYPE_LABELS] || interactionType}
            </Tag>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="交互配置">
          {interactionConfig ? (
            <ReactJson value={interactionConfig} displayDataTypes={false} collapsed={1} />
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}

