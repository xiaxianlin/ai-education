import { ANSWER_TYPE_LABELS } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Card, Tag } from 'antd';

interface AnswerConfigDetailProps {
  answerType?: string;
  answerConfig?: any;
}

export default function AnswerConfigDetail({ answerType, answerConfig }: AnswerConfigDetailProps) {
  return (
    <Card title="答案配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="答案类型">
          {answerType ? (
            <Tag color="orange">
              {ANSWER_TYPE_LABELS[answerType as keyof typeof ANSWER_TYPE_LABELS] || answerType}
            </Tag>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="答案配置">
          {answerConfig ? <ReactJson value={answerConfig} displayDataTypes={false} collapsed={1} /> : '-'}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}

