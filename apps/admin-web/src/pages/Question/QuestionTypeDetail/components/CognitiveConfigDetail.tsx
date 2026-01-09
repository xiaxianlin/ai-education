import { ProDescriptions } from '@ant-design/pro-components';
import { COGNITIVE_LEVEL_LABELS } from '@ai-education/shared-web';
import { Card, Tag } from 'antd';

interface CognitiveConfigDetailProps {
  cognitiveLevels?: string[];
}

export default function CognitiveConfigDetail({ cognitiveLevels }: CognitiveConfigDetailProps) {
  return (
    <Card title="认知配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="认知层次">
          {cognitiveLevels?.length ? (
            <div>
              {cognitiveLevels.map((level, index) => (
                <Tag key={index} style={{ marginBottom: 4 }}>
                  {COGNITIVE_LEVEL_LABELS[level as keyof typeof COGNITIVE_LEVEL_LABELS] || level}
                </Tag>
              ))}
            </div>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}

