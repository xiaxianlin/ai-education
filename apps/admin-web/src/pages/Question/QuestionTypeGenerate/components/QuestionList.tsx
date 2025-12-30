import { Card, Col, Empty, Row } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';
import { QuestionCard } from './QuestionCard';

export function QuestionList() {
  const { generatedQuestions } = useQuestionTypeGenerateModel();

  if (!generatedQuestions || generatedQuestions.length === 0) {
    return (
      <Card>
        <Empty description="暂无生成的题目" />
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {generatedQuestions.map((question) => (
          <Col key={question.id} xs={24} sm={12} lg={8}>
            <QuestionCard question={question} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

