import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Flex, Spin } from 'antd';
import { useAbilityDetailModel } from '../models/page';
import AtomicForm from './AtomicForm';
import AtomicList from './AtomicList';
import DomainInfo from './DomainInfo';

export default function MainView() {
  const { domain, loading, navigate } = useAbilityDetailModel();

  return (
    <PageContainer
      title="能力详情"
      header={{
        onBack: () => navigate('/ability'),
        breadcrumb: {},
      }}
    >
      <Spin spinning={loading}>
        {domain && (
          <>
            <DomainInfo domain={domain} />
            <AtomicList />
            <AtomicForm />
          </>
        )}
      </Spin>
      <FooterToolbar className="page-footer">
        <Flex justify="center" gap={16}>
          <Button size="large" onClick={() => navigate('/ability')}>
            返回
          </Button>
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}
