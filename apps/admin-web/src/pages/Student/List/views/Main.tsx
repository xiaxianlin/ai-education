import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  return (
    <PageContainer title="学生管理" header={{ breadcrumb: {} }}>
      <TableView />
      <FormView />
    </PageContainer>
  );
}
