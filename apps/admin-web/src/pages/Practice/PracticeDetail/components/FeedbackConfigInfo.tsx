import { ProDescriptions } from '@ant-design/pro-components';
import { Card } from 'antd';

interface GamificationConfig {
  enable_points?: boolean;
  enable_badges?: boolean;
  enable_progress?: boolean;
}

interface FeedbackConfig {
  instant_feedback?: boolean;
  show_explanation?: boolean;
  gamification?: GamificationConfig;
  encouragement_messages?: string[];
}

interface FeedbackConfigInfoProps {
  config?: FeedbackConfig;
}

export function FeedbackConfigInfo({ config }: FeedbackConfigInfoProps) {
  if (!config) {
    return (
      <Card title="反馈配置" size="small">
        <ProDescriptions column={1} size="small">
          <ProDescriptions.Item>-</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    );
  }

  const gamificationItems: string[] = [];
  if (config.gamification?.enable_points) gamificationItems.push('积分');
  if (config.gamification?.enable_badges) gamificationItems.push('徽章');
  if (config.gamification?.enable_progress) gamificationItems.push('进度');

  return (
    <ProDescriptions column={1} size="small" bordered title="反馈配置" labelStyle={{ width: 200 }}>
      <ProDescriptions.Item label="即时反馈">{config?.instant_feedback ? '是' : '否'}</ProDescriptions.Item>
      <ProDescriptions.Item label="显示解析">{config?.show_explanation ? '是' : '否'}</ProDescriptions.Item>
      <ProDescriptions.Item label="游戏化">
        <ProDescriptions column={1} size="small" bordered>
          <ProDescriptions.Item label="积分">{config?.gamification?.enable_points ? '是' : '否'}</ProDescriptions.Item>
          <ProDescriptions.Item label="徽章">{config?.gamification?.enable_badges ? '是' : '否'}</ProDescriptions.Item>
          <ProDescriptions.Item label="进度">
            {config?.gamification?.enable_progress ? '是' : '否'}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProDescriptions.Item>
      <ProDescriptions.Item label="鼓励消息">
        {!config?.encouragement_messages?.length && '-'}
        {config?.encouragement_messages?.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </ProDescriptions.Item>
    </ProDescriptions>
  );
}
