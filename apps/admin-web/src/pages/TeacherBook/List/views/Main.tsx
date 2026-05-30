import { SubjectGradeTabs } from '@/components';
import { PageShell } from '@/components/ui';
import { useTeacherBookListModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const { subject, grade, setSubject, setGrade } = useTeacherBookListModel();

  return (
    <PageShell title="教师用书管理" description="按学科和年级维护教师用书基础资料。">
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <TableView />
      <FormView />
    </PageShell>
  );
}
