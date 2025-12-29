import { ABILITY_TYPE_MAP, COGNITIVE_LEVEL_LABELS, CognitiveLevel } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import { Card } from 'antd';

interface AbilityConfigInfoProps {
  config?: AbilityConfig;
  subject: string;
}

export function AbilityConfigInfo({ config, subject }: AbilityConfigInfoProps) {
  if (!config) {
    return (
      <Card title="能力配置" size="small">
        <ProDescriptions column={1} size="small">
          <ProDescriptions.Item>-</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    );
  }

  return (
    <ProDescriptions column={1} size="small" bordered title="能力配置" labelStyle={{ width: 200 }}>
      {config.cognitive_levels && config.cognitive_levels.length > 0 && (
        <ProDescriptions.Item label="认知层次">
          {config.cognitive_levels.map((level) => COGNITIVE_LEVEL_LABELS[level as CognitiveLevel] || level).join(', ')}
        </ProDescriptions.Item>
      )}
      {config.distribution && Object.keys(config.distribution).length > 0 && (
        <ProDescriptions.Item label="能力分布">
          <ProDescriptions column={1} size="small" bordered>
            {config.distribution?.map(({ key, value }) => (
              <ProDescriptions.Item key={key} label={ABILITY_TYPE_MAP[subject][key]}>
                {value}
              </ProDescriptions.Item>
            ))}
          </ProDescriptions>
        </ProDescriptions.Item>
      )}
      {(!config.cognitive_levels || config.cognitive_levels.length === 0) &&
        (!config.distribution || Object.keys(config.distribution).length === 0) && (
          <ProDescriptions.Item>-</ProDescriptions.Item>
        )}
    </ProDescriptions>
  );
}
