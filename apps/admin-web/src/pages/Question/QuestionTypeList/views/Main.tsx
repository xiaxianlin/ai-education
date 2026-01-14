import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import ListView from './List';

export default function MainView() {
  return (
    <PageContainer title="题型管理">
      <SubjectGradeTabs showGrade={false} />
      <ListView />
    </PageContainer>
  );
}
