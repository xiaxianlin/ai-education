import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';

interface QuestionStatisticsProps {
  question: Question;
}

export function QuestionStatistics({ question }: QuestionStatisticsProps) {
  // 如果没有统计信息，不显示卡片
  if (question.usage_count === 0 && !question.correct_rate && !question.avg_time_spent) {
    return null;
  }

  return (
    <ProCard title="统计信息">
      <ProDescriptions column={3}>
        <ProDescriptions.Item label="使用次数">
          <Tag color="blue">{question.usage_count || 0}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="正确率">
          {question.correct_rate ? <Tag color="success">{question.correct_rate}%</Tag> : '-'}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="平均耗时">
          {question.avg_time_spent ? <Tag color="orange">{question.avg_time_spent} 秒</Tag> : '-'}
        </ProDescriptions.Item>
      </ProDescriptions>
    </ProCard>
  );
}
