import { PageContainer } from '@ant-design/pro-components';
import { useParams, useNavigate } from 'react-router-dom';
import { SubjectGradeTabs } from '@/components';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>();

  return (
    <PageContainer
      title="学生教材配置管理"
      header={{ onBack: () => navigate(-1) }}
    >
      <SubjectGradeTabs />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
