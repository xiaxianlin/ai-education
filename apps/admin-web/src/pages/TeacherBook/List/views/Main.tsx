import { PageContainer } from '@ant-design/pro-components';
import FormView from './Form';
import TableView from './Table';
import { SubjectGradeTabs } from '@/components';
import { useTeacherBookListModel } from '../models/page';

export default function MainView() {
  const { subject, grade, setSubject, setGrade } = useTeacherBookListModel();
  return (
    <PageContainer title="教师用书管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
