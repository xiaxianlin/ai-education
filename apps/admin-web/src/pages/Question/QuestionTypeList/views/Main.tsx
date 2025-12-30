import ListView from './List';
import { PageContainer } from '@ant-design/pro-components';
import { SubjectGradeTabs } from '@/components';

export default function MainView() {
  return (
    <PageContainer title="题型管理">
      <SubjectGradeTabs />
      <ListView />
    </PageContainer>
  );
}
