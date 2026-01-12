import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  return (
    <PageContainer title="教材版本管理">
      <SubjectGradeTabs showGrade={false} />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
