import { PageContainer } from '@ant-design/pro-components';
import TextbookForm from './Form';
import TextbookTable from './Table';

export default function MainView() {
  return (
    <PageContainer header={{ title: '' }}>
      <TextbookTable />
      <TextbookForm />
    </PageContainer>
  );
}
