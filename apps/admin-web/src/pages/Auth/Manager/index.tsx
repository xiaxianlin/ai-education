import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { ManagerFormView } from './views/FormView';
import { ManagerTableView } from './views/TableView';

export default function ManagerPage() {
  const actionRef = useRef<any>();
  const [formVisible, setFormVisible] = React.useState(false);

  return (
    <PageContainer title="账号管理" header={{ breadcrumb: {} }}>
      <ManagerTableView actionRef={actionRef} onAddClick={() => setFormVisible(true)} />
      <ManagerFormView open={formVisible} onOpenChange={setFormVisible} actionRef={actionRef} />
    </PageContainer>
  );
}
