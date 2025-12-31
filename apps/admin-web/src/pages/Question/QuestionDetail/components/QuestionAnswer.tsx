import { ProCard } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

interface QuestionAnswerProps {
  answer: Answer;
  explanation?: string;
}

export function QuestionAnswer({ answer, explanation }: QuestionAnswerProps) {
  return (
    <ProCard title="答案">
      <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
        {answer?.correct_answers?.join(', ') || '-'}
      </Tag>
      {answer?.accept_answers && answer.accept_answers.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ marginRight: 8 }}>
            可接受答案：
          </Text>
          <Tag color="default">{answer.accept_answers.join(', ')}</Tag>
        </div>
      )}
      {explanation && (
        <div style={{ marginTop: 12, color: '#666' }}>
          <strong>解析：</strong>
          <Text style={{ marginLeft: 8 }}>{explanation}</Text>
        </div>
      )}
    </ProCard>
  );
}

