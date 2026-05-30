import { SubjectGradeTabs } from '@/components';
import { PageShell } from '@/components/ui';
import { useTextbookListModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const { subject, grade, setSubject, setGrade } = useTextbookListModel();

  return (
    <PageShell title="教材管理" description="按学科和年级维护教材基础资料。">
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <TableView />
      <FormView />
    </PageShell>
  );
}
