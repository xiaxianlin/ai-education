import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  return (
    <PageContainer title="教材管理">
      <SubjectGradeTabs />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
