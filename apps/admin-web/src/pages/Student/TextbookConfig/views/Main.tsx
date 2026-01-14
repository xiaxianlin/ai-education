import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from './Form';
import TableView from './Table';

export default function MainView() {
  const navigate = useNavigate();
  useParams<{ id: string }>();

  return (
    <PageContainer title="学生教材配置管理" header={{ onBack: () => navigate(-1) }}>
      <SubjectGradeTabs />
      <TableView />
      <FormView />
    </PageContainer>
  );
}
