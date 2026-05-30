import { SubjectGradeTabs } from '@/components';
import { PageShell } from '@/components/ui';
import { useTextbookVersionListModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const { subject, setSubject } = useTextbookVersionListModel();

  return (
    <PageShell title="教材版本管理" description="按学科维护教材版本和修订年份。">
      <SubjectGradeTabs subject={subject} setSubject={setSubject} showGrade={false} />
      <TableView />
      <FormView />
    </PageShell>
  );
}
