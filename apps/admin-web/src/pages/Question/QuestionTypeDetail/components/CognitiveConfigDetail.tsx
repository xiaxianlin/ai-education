import { ProDescriptions } from '@ant-design/pro-components';
import { ABILITY_TYPE_MAP, COGNITIVE_LEVEL_LABELS } from '@ai-education/shared-web';
import { Card, Tag } from 'antd';

interface CognitiveConfigDetailProps {
  cognitiveLevels?: string[];
  abilityDimensions?: string[];
  subject?: string;
}

export default function CognitiveConfigDetail({
  cognitiveLevels,
  abilityDimensions,
  subject,
}: CognitiveConfigDetailProps) {
  // 获取能力维度映射
  const abilityTypeMap = subject ? ABILITY_TYPE_MAP[subject] || {} : {};

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
        <ProDescriptions.Item label="能力维度">
          {abilityDimensions?.length ? (
            <div>
              {abilityDimensions.map((dimension, index) => {
                const label = abilityTypeMap[dimension] || dimension;
                return (
                  <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                    {label}
                  </Tag>
                );
              })}
            </div>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}

