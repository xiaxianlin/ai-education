import { Card, Col, Row, Statistic } from 'antd';
import { formatDuration } from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

export function Report() {
  const { report } = usePracticeDetailModel();

  if (!report) {
    return null;
  }

  return (
    <Card title="练习报告">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="综合得分" value={report.overall_score} precision={1} suffix="分" />
        </Col>
        <Col span={6}>
          <Statistic title="能力水平" value={report.ability_level || '-'} />
        </Col>
        <Col span={6}>
          <Statistic title="置信度" value={report.confidence} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic title="总耗时" value={formatDuration(report.total_time)} />
        </Col>
      </Row>
    </Card>
  );
}
