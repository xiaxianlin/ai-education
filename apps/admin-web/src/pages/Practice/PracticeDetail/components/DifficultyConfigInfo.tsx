import { ProDescriptions } from '@ant-design/pro-components';
import { Card } from 'antd';

interface DifficultyDistribution {
  easy?: number;
  medium?: number;
  hard?: number;
}

interface DifficultyConfig {
  level?: string;
  target_accuracy?: number;
  distribution?: DifficultyDistribution;
}

interface DifficultyConfigInfoProps {
  config?: DifficultyConfig;
}

const LEVEL_LABELS: Record<string, string> = {
  basic: '基础',
  intermediate: '中级',
  advanced: '高级',
};

export function DifficultyConfigInfo({ config }: DifficultyConfigInfoProps) {
  if (!config) {
    return (
      <Card title="难度配置" size="small">
        <ProDescriptions column={1} size="small">
          <ProDescriptions.Item>-</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    );
  }

  return (
    <ProDescriptions column={1} size="small" bordered title="难度配置" labelStyle={{ width: 200 }}>
      <ProDescriptions.Item label="难度等级">{config?.level ? LEVEL_LABELS[config.level] : '-'}</ProDescriptions.Item>
      <ProDescriptions.Item label="目标正确率">
        {config?.target_accuracy ? Math.round(config.target_accuracy) : '-'}%
      </ProDescriptions.Item>
      <ProDescriptions.Item label="难度分布">
        <ProDescriptions column={1} size="small" bordered>
          <ProDescriptions.Item label="简单">
            {config?.distribution?.easy ? config.distribution.easy : '-'}%
          </ProDescriptions.Item>
          <ProDescriptions.Item label="中等">
            {config?.distribution?.medium ? config.distribution.medium : '-'}%
          </ProDescriptions.Item>
          <ProDescriptions.Item label="困难">
            {config?.distribution?.hard ? config.distribution.hard : '-'}%
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProDescriptions.Item>
    </ProDescriptions>
  );
}
