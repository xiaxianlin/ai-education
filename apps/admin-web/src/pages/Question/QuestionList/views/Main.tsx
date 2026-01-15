import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { DetailView } from './Detail';
import { QuestionFormModal } from './Form';
import { ListView } from './List';

export default function MainView() {
  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs />
      <ListView />
      <QuestionFormModal />
      <DetailView />
    </PageContainer>
  );
}
