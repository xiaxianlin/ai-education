import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';
import { SubjectGradeTabs } from '@/components';
import { useTextbookListModel } from '../models/page';

export default function MainView() {
  const { subject, grade, setSubject, setGrade } = useTextbookListModel();
  return (
    <PageContainer title="教材管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
