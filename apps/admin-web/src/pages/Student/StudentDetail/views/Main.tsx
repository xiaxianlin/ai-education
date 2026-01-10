import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Card, Flex } from 'antd';

import {} from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { PracticeSessionList } from './PracticeSessionList';
import { TextbookList } from './TextbookList';

export function Main() {
  const navigate = useNavigate();
  const { loading } = useStudentDetailModel();

  if (loading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <PageContainer title="学生详情" header={{ onBack: () => navigate(-1) }}>
      <Flex vertical gap={16}>
        <BasicInfo />
        <TextbookList />
        <PracticeSessionList />
      </Flex>
    </PageContainer>
  );
}
