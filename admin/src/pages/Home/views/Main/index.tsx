import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row } from 'antd';
import Meta from 'antd/es/card/Meta';

export default function MainView() {
  return (
    <PageContainer header={{ title: '' }} ghost>
      <Row gutter={16}>
        <Col className="gutter-row" span={6}></Col>
      </Row>
    </PageContainer>
  );
}
