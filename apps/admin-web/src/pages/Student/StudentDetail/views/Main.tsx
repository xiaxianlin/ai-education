import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Flex } from 'antd';

import { } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentDetailModel } from '../models/page';
import { AbilityMastery } from './AbilityMastery';
import { BasicInfo } from './BasicInfo';
import { PracticeList } from './PracticeList';

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
        <AbilityMastery />
        <PracticeList />
      </Flex>
    </PageContainer>
  );
}
