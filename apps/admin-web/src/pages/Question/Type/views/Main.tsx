import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  return (
    <PageContainer title="题型管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
