import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Flex, Spin } from 'antd';
import DomainInfo from './DomainInfo';
import AtomicList from './AtomicList';
import AtomicForm from './AtomicForm';
import { useAbilityDetailModel } from '../models/page';

export default function MainView() {
  const { domain, loading, navigate } = useAbilityDetailModel();

  return (
    <PageContainer
      title="能力详情"
      header={{
        onBack: () => navigate('/learning/ability'),
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
          <Button size="large" onClick={() => navigate('/learning/ability')}>
            返回
          </Button>
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}
