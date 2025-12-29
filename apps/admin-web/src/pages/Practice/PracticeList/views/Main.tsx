import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { ListView } from './List';

export default function MainView() {
  return (
    <PageContainer title="练习列表">
      <SubjectGradeTabs />
      <ListView />
    </PageContainer>
  );
}
