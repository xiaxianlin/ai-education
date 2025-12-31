import { QuestionCard } from '@/components';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Empty, Typography } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

const { Text } = Typography;

export function QuestionList() {
  const { generatedQuestions } = useQuestionTypeGenerateModel();

  if (!generatedQuestions || generatedQuestions.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Empty
          image={<QuestionCircleOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description={
            <Text type="secondary" style={{ fontSize: 14 }}>
              暂无生成的题目
            </Text>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16, color: '#262626' }}>
          已生成题目 ({generatedQuestions.length} 道)
        </Text>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {generatedQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
