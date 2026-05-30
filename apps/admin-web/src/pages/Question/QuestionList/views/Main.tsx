import { SubjectGradeTabs } from '@/components';
import { PageShell } from '@/components/ui';
import { DetailView } from './Detail';
import { QuestionFormModal } from './Form';
import { ListView } from './List';

export default function MainView() {
  return (
    <PageShell title="题目管理" description="按学科与年级检索、查看和维护已生成题目。">
      <SubjectGradeTabs />
      <ListView />
      <QuestionFormModal />
      <DetailView />
    </PageShell>
  );
}
