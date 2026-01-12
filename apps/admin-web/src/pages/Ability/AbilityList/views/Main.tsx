import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { SUBJECTS } from '@ai-education/shared-web';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  // 只显示小学阶段的科目：语文、数学、英语
  const primarySubjects = SUBJECTS;

  return (
    <PageContainer title="能力管理">
      <SubjectGradeTabs showGrade={false} subjects={primarySubjects} />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
