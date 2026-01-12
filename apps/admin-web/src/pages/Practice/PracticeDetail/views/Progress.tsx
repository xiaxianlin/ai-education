import { Card, Col, Row, Statistic } from 'antd';
import { usePracticeDetailModel } from '../models/page';

export function Progress() {
  const { session } = usePracticeDetailModel();

  if (!session) {
    return null;
  }

  return (
    <Card title="练习进度">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="总题数" value={session.question_count} suffix="题" />
        </Col>
        <Col span={6}>
          <Statistic title="已完成" value={session.answer_count} suffix="题" />
        </Col>
        <Col span={6}>
          <Statistic title="正确" value={session.correct_count} suffix="题" valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col span={6}>
          <Statistic
            title="错误"
            value={session.answer_count - session.correct_count}
            suffix="题"
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );
}
