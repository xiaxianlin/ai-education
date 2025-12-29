import { ProDescriptions } from '@ant-design/pro-components';
import { Card } from 'antd';

interface QuestionCountConfig {
  total?: number;
  per_group?: number;
  max_groups?: number;
  time_limit_minutes?: number;
}

interface QuestionCountConfigInfoProps {
  config?: QuestionCountConfig;
}

export function QuestionCountConfigInfo({ config }: QuestionCountConfigInfoProps) {
  if (!config) {
    return (
      <Card title="题量配置" size="small">
        <ProDescriptions column={1} size="small">
          <ProDescriptions.Item>-</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    );
  }

  return (
    <ProDescriptions column={1} size="small" bordered title="题量配置" labelStyle={{ width: 200 }}>
      <ProDescriptions.Item label="总题数">{config?.total || '-'}</ProDescriptions.Item>
      <ProDescriptions.Item label="每组题数">{config?.per_group || '-'}</ProDescriptions.Item>
      <ProDescriptions.Item label="最大组数">{config?.max_groups || '-'}</ProDescriptions.Item>
      <ProDescriptions.Item label="时间限制（分钟）">{config?.time_limit_minutes || '-'}</ProDescriptions.Item>
    </ProDescriptions>
  );
}
