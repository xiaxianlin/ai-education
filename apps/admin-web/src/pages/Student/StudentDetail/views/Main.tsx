import { PageContainer, ProSkeleton } from '@ant-design/pro-components';
import { Card, Flex } from 'antd';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { PracticeList } from './PracticeList';
import { TextbookList } from './TextbookList';

export function Main() {
  const navigate = useNavigate();
  const { loading } = useStudentDetailModel();
  const [activeTab, setActiveTab] = useState('textbook');

  const content = useMemo(() => {
    switch (activeTab) {
      case 'textbook':
        return <TextbookList />;
      case 'practice':
        return <PracticeList />;
    }
  }, [activeTab]);

  if (loading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <PageContainer title="学生详情" header={{ onBack: () => navigate(-1) }}>
      <Flex vertical gap={16}>
        <BasicInfo />
        <Card
          tabList={[
            { key: 'textbook', label: '教材管理' },
            { key: 'practice', label: '练习管理' },
          ]}
          activeTabKey={activeTab}
          onTabChange={setActiveTab}
        >
          {content}
        </Card>
      </Flex>
    </PageContainer>
  );
}
