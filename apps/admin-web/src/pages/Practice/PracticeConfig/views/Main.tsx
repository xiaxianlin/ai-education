import { PageContainer } from '@ant-design/pro-components';
import { Button, Spin, Tabs } from 'antd';
import { usePracticeConfigModel } from '../models/page';
import { FormView } from './FormView';
import { TableView } from './TableView';
import { JSONView } from './JSONView';

export default function MainView() {
  const { loading, submit, practice } = usePracticeConfigModel();

  if (loading) {
    return (
      <PageContainer title="练习参数配置" header={{ breadcrumb: {} }}>
        <Spin spinning={loading} style={{ width: '100%', padding: '50px' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`练习参数配置 - ${practice?.name}`}
      header={{ breadcrumb: {} }}
      footer={[
        <Button type="primary" key="add" onClick={submit}>
          提交配置
        </Button>,
      ]}
    >
      <Tabs defaultValue="list" type="card">
        <Tabs.TabPane tab="表单模式" key="list">
          <TableView />
        </Tabs.TabPane>
        <Tabs.TabPane tab="JSON模式" key="form">
          <JSONView />
        </Tabs.TabPane>
      </Tabs>
      <FormView />
    </PageContainer>
  );
}
