import { Card, Spin } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function GeneratingStatus() {
  const { generating } = useQuestionTypeGenerateModel();

  if (!generating) {
    return null;
  }

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>正在生成题目，请稍候...</div>
      </div>
    </Card>
  );
}

