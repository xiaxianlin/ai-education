import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Space } from 'antd';

import { PageHeader } from '@/components';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useStudentDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Footer } from './Footer';
import { PracticeList } from './PracticeList';
import { TextbookList } from './TextbookList';

export function Entry() {
  const { loading } = useStudentDetailModel();

  if (loading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <PageContainer title={<PageHeader title="学生详情" />}>
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
