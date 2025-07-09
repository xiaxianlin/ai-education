import { PageContainer } from '@ant-design/pro-components';
import ListView from './List';
import { CreateForm } from './Create';

export const MainView = () => {
  return (
    <PageContainer ghost header={{ title: '账号列表' }}>
      <ListView />
      <CreateForm />
    </PageContainer>
  );
};
