import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Space } from 'antd';

import { PageHeader } from '@/components';
import { BasicInfo } from './BasicInfo';
import { TextbookList } from './TextbookList';
import { PracticeList } from './PracticeList';
import { useStudentDetailModel } from '../models/page';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { Footer } from './Footer';

export function Entry() {
  const { loading } = useStudentDetailModel();

  if (loading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <PageContainer
      title={<PageHeader title="学生详情" />}
      header={{
        breadcrumb: {},
        extra: [],
      }}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <BasicInfo />
        <TextbookList />
        <PracticeList />
        <BasicInfoForm />
      </Space>
      <Footer />
    </PageContainer>
  );
}
