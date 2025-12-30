import { ProDescriptions } from '@ant-design/pro-components';
import { Card, Tag } from 'antd';

interface CognitiveConfigDetailProps {
  cognitiveLevels?: string[];
  abilityDimensions?: string[];
}

export default function CognitiveConfigDetail({
  cognitiveLevels,
  abilityDimensions,
}: CognitiveConfigDetailProps) {
  return (
    <Card title="认知配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="认知层次">
          {cognitiveLevels?.length ? (
            <div>
              {cognitiveLevels.map((level, index) => (
                <Tag key={index} style={{ marginBottom: 4 }}>
                  {level}
                </Tag>
              ))}
            </div>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="能力维度">
          {abilityDimensions?.length ? (
            <div>
              {abilityDimensions.map((dimension, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                  {dimension}
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

